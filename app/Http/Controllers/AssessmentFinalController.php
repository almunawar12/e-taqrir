<?php

namespace App\Http\Controllers;

use App\Domain\Assessment\Services\AssessmentService;
use App\Models\Assessment;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AssessmentFinalController extends Controller
{
    public function __construct(private readonly AssessmentService $service) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Assessment::class);

        $user = $request->user();
        abort_if($user->active_role !== 'guru_mapel', 403);

        $groups = $this->buildGroups($user, withScores: false);

        return Inertia::render('Assessments/Final', [
            'groups' => $groups,
        ]);
    }

    public function show(Request $request, int $classroomId, int $subjectId): Response
    {
        $this->authorize('viewAny', Assessment::class);

        $user = $request->user();
        abort_if($user->active_role !== 'guru_mapel', 403);

        $groups   = $this->buildGroups($user, withScores: true);
        $group    = $groups->first(
            fn($g) => $g['classroom']['id'] === $classroomId && $g['subject']['id'] === $subjectId
        );

        abort_if($group === null, 404);

        return Inertia::render('Assessments/FinalShow', [
            'group'   => $group,
            'weights' => Setting::weights(),
        ]);
    }

    private function buildGroups(mixed $user, bool $withScores): \Illuminate\Support\Collection
    {
        $assessments = Assessment::with(
            $withScores
                ? ['classroom:id,name', 'subject:id,name,code', 'items.student:id,name,nis']
                : ['classroom:id,name', 'subject:id,name,code', 'items']
        )
        ->where('teacher_id', $user->id)
        ->whereIn('type', ['harian', 'uts', 'uas'])
        ->when($user->active_academic_year, fn($q) => $q->where('academic_year', $user->active_academic_year))
        ->when($user->active_semester,      fn($q) => $q->where('semester',      $user->active_semester))
        ->get();

        $weights = Setting::weights();

        $finalAssessments = Assessment::where('teacher_id', $user->id)
            ->where('type', 'final')
            ->when($user->active_academic_year, fn($q) => $q->where('academic_year', $user->active_academic_year))
            ->when($user->active_semester,      fn($q) => $q->where('semester',      $user->active_semester))
            ->get()
            ->keyBy(fn($a) => "{$a->classroom_id}|{$a->subject_id}|{$a->academic_year}|{$a->semester}");

        return $assessments
            ->groupBy(fn($a) => "{$a->classroom_id}|{$a->subject_id}|{$a->academic_year}|{$a->semester}")
            ->map(function ($group, $key) use ($weights, $finalAssessments, $withScores) {
                $first  = $group->first();
                $byType = $group->keyBy('type');

                $typeInfo = fn($a) => $a ? [
                    'id'     => $a->id,
                    'state'  => (string) $a->state,
                    'filled' => $a->items->whereNotNull('score')->count(),
                    'total'  => $a->items->count(),
                ] : null;

                $finalAsmt  = $finalAssessments->get($key);
                $finalState = $finalAsmt ? (string) $finalAsmt->state : null;
                $hasAll     = $byType->has('harian') && $byType->has('uts') && $byType->has('uas');
                $canSubmit  = $hasAll && ($finalState === null || in_array($finalState, ['draft', 'rejected']));

                $base = [
                    'classroom'        => $first->classroom,
                    'subject'          => $first->subject,
                    'academic_year'    => $first->academic_year,
                    'semester'         => $first->semester,
                    'by_type'          => [
                        'harian' => $typeInfo($byType->get('harian')),
                        'uts'    => $typeInfo($byType->get('uts')),
                        'uas'    => $typeInfo($byType->get('uas')),
                    ],
                    'final_assessment' => $finalAsmt ? ['id' => $finalAsmt->id, 'state' => $finalState] : null,
                    'can_submit'       => $canSubmit,
                ];

                if (! $withScores) {
                    return $base;
                }

                $studentMap = [];
                $scoreMap   = [];
                foreach ($group as $assessment) {
                    foreach ($assessment->items as $item) {
                        $studentMap[$item->student_id] = $item->student;
                        $scoreMap[$item->student_id][$assessment->type] = $item->score !== null
                            ? (float) $item->score : null;
                    }
                }

                $wh = $weights['harian'] / 100;
                $wu = $weights['uts']    / 100;
                $wa = $weights['uas']    / 100;

                $finalScores = collect($studentMap)
                    ->map(function ($student) use ($scoreMap, $wh, $wu, $wa) {
                        $nh  = $scoreMap[$student->id]['harian'] ?? null;
                        $nts = $scoreMap[$student->id]['uts']    ?? null;
                        $nas = $scoreMap[$student->id]['uas']    ?? null;

                        return [
                            'student_id' => $student->id,
                            'nis'        => $student->nis,
                            'name'       => $student->name,
                            'harian'     => $nh,
                            'uts'        => $nts,
                            'uas'        => $nas,
                            'final'      => ($nh !== null && $nts !== null && $nas !== null)
                                ? round($nh * $wh + $nts * $wu + $nas * $wa, 2)
                                : null,
                        ];
                    })
                    ->sortBy('name')
                    ->values();

                return array_merge($base, ['final_scores' => $finalScores]);
            })
            ->values();
    }

    public function submit(Request $request): RedirectResponse
    {
        $this->authorize('viewAny', Assessment::class);

        $user = $request->user();
        abort_if($user->active_role !== 'guru_mapel', 403);

        $request->validate([
            'classroom_id'  => ['required', 'integer', 'exists:classrooms,id'],
            'subject_id'    => ['required', 'integer', 'exists:subjects,id'],
            'academic_year' => ['required', 'string', 'max:20'],
            'semester'      => ['required', 'integer', Rule::in([1, 2])],
            'comment'       => ['nullable', 'string', 'max:1000'],
        ]);

        $weights = Setting::weights();
        $comment = $request->string('comment')->toString() ?: null;

        // Load source assessments
        $sources = Assessment::with(['items.student:id,name,nis'])
            ->where('teacher_id', $user->id)
            ->where('classroom_id',  $request->integer('classroom_id'))
            ->where('subject_id',    $request->integer('subject_id'))
            ->where('academic_year', $request->string('academic_year'))
            ->where('semester',      $request->integer('semester'))
            ->whereIn('type', ['harian', 'uts', 'uas'])
            ->get();

        $byType = $sources->keyBy('type');
        abort_if(
            !$byType->has('harian') || !$byType->has('uts') || !$byType->has('uas'),
            422,
            'Semua jenis penilaian (Harian, UTS, UAS) harus ada sebelum mengajukan nilai akhir.'
        );

        // Build score map from source items
        $studentMap = [];
        $scoreMap   = [];
        foreach ($sources as $src) {
            foreach ($src->items as $item) {
                $studentMap[$item->student_id] = $item->student;
                $scoreMap[$item->student_id][$src->type] = $item->score !== null
                    ? (float) $item->score
                    : null;
            }
        }

        // Find or create the final assessment record
        $finalAsmt = Assessment::firstOrNew([
            'classroom_id'  => $request->integer('classroom_id'),
            'subject_id'    => $request->integer('subject_id'),
            'academic_year' => $request->string('academic_year')->toString(),
            'semester'      => $request->integer('semester'),
            'type'          => 'final',
        ]);

        if ($finalAsmt->exists) {
            $this->authorize('submit', $finalAsmt);
            if ($finalAsmt->isRejected()) {
                $this->service->resetToDraft($finalAsmt, $user);
                $finalAsmt->refresh();
            }
            abort_if(!$finalAsmt->isDraft(), 422, 'Nilai akhir sudah diajukan atau dalam proses verifikasi.');
        }

        $wh = $weights['harian'] / 100;
        $wu = $weights['uts']    / 100;
        $wa = $weights['uas']    / 100;

        DB::transaction(function () use ($finalAsmt, $user, $comment, $studentMap, $scoreMap, $wh, $wu, $wa) {
            if (! $finalAsmt->exists) {
                $finalAsmt->teacher_id = $user->id;
                $finalAsmt->save();
            }

            foreach ($studentMap as $studentId => $_) {
                $nh  = $scoreMap[$studentId]['harian'] ?? null;
                $nts = $scoreMap[$studentId]['uts']    ?? null;
                $nas = $scoreMap[$studentId]['uas']    ?? null;

                $finalScore = ($nh !== null && $nts !== null && $nas !== null)
                    ? round($nh * $wh + $nts * $wu + $nas * $wa, 2)
                    : null;

                $finalAsmt->items()->updateOrCreate(
                    ['student_id' => $studentId],
                    ['score' => $finalScore, 'notes' => null],
                );
            }

            $this->service->submit($finalAsmt, $user, $comment);
        });

        return back()->with('success', 'Nilai akhir berhasil diajukan ke wali kelas.');
    }
}
