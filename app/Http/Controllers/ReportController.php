<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\AssessmentItem;
use App\Models\Classroom;
use App\Models\Setting;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_if(
            ! in_array($user->active_role, ['super_admin', 'wali_kelas']),
            403
        );

        $query = Classroom::with('homeroomTeacher:id,name')
            ->withCount('students')
            ->orderBy('name');

        if ($user->active_role === 'wali_kelas') {
            $query->where('homeroom_teacher_id', $user->id);
        }

        $classrooms = $query->get()->map(fn($c) => [
            'id'              => $c->id,
            'name'            => $c->name,
            'grade_level'     => $c->grade_level,
            'academic_year'   => $c->academic_year,
            'students_count'  => $c->students_count,
            'homeroom_teacher' => $c->homeroomTeacher?->name,
        ]);

        return Inertia::render('Reports/Index', [
            'classrooms' => $classrooms,
        ]);
    }

    public function show(Request $request, Classroom $classroom): Response
    {
        $user = $request->user();
        abort_if(
            ! in_array($user->active_role, ['super_admin', 'wali_kelas']),
            403
        );
        if ($user->active_role === 'wali_kelas') {
            abort_if($classroom->homeroom_teacher_id !== $user->id, 403);
        }

        $year     = $request->query('year',     $user->active_academic_year ?? $classroom->academic_year);
        $semester = (int) $request->query('semester', $user->active_semester ?? 1);

        $students = $classroom->students()->orderBy('name')->get(['id', 'nis', 'name', 'gender']);

        // Check which students have any assessments in this period
        $studentIdsWithData = AssessmentItem::whereHas('assessment', function ($q) use ($classroom, $year, $semester) {
            $q->where('classroom_id', $classroom->id)
              ->where('academic_year', $year)
              ->where('semester',      $semester)
              ->whereIn('type', ['harian', 'uts', 'uas']);
        })
        ->whereNotNull('score')
        ->pluck('student_id')
        ->unique();

        $studentList = $students->map(fn($s) => [
            'id'       => $s->id,
            'nis'      => $s->nis,
            'name'     => $s->name,
            'gender'   => $s->gender,
            'has_data' => $studentIdsWithData->contains($s->id),
        ]);

        return Inertia::render('Reports/Show', [
            'classroom' => [
                'id'               => $classroom->id,
                'name'             => $classroom->name,
                'grade_level'      => $classroom->grade_level,
                'homeroom_teacher' => $classroom->homeroomTeacher?->name,
            ],
            'students'  => $studentList,
            'year'      => $year,
            'semester'  => $semester,
        ]);
    }

    public function preview(Request $request, Classroom $classroom, Student $student): Response
    {
        $user = $request->user();
        abort_if(
            ! in_array($user->active_role, ['super_admin', 'wali_kelas']),
            403
        );
        if ($user->active_role === 'wali_kelas') {
            abort_if($classroom->homeroom_teacher_id !== $user->id, 403);
        }
        abort_if($student->classroom_id !== $classroom->id, 404);

        $year     = $request->query('year',     $user->active_academic_year ?? $classroom->academic_year);
        $semester = (int) $request->query('semester', $user->active_semester ?? 1);

        $weights = Setting::weights();

        // Load all source assessments for this classroom/period
        $assessments = Assessment::with(['subject:id,name,code', 'teacher:id,name'])
            ->where('classroom_id',  $classroom->id)
            ->where('academic_year', $year)
            ->where('semester',      $semester)
            ->whereIn('type', ['harian', 'uts', 'uas'])
            ->get();

        // Load this student's score items
        $itemMap = AssessmentItem::where('student_id', $student->id)
            ->whereIn('assessment_id', $assessments->pluck('id'))
            ->get()
            ->keyBy('assessment_id');

        $wh = $weights['harian'] / 100;
        $wu = $weights['uts']    / 100;
        $wa = $weights['uas']    / 100;

        $subjects = $assessments
            ->groupBy('subject_id')
            ->map(function ($group) use ($itemMap, $wh, $wu, $wa) {
                $byType  = $group->keyBy('type');
                $harianA = $byType->get('harian');
                $utsA    = $byType->get('uts');
                $uasA    = $byType->get('uas');

                $nh  = $harianA ? (($itemMap->get($harianA->id)?->score !== null) ? (float) $itemMap->get($harianA->id)->score : null) : null;
                $nts = $utsA    ? (($itemMap->get($utsA->id)?->score    !== null) ? (float) $itemMap->get($utsA->id)->score    : null) : null;
                $nas = $uasA    ? (($itemMap->get($uasA->id)?->score    !== null) ? (float) $itemMap->get($uasA->id)->score    : null) : null;
                $na  = ($nh !== null && $nts !== null && $nas !== null)
                    ? round($nh * $wh + $nts * $wu + $nas * $wa, 2) : null;

                // Collect notes: prefer uas > uts > harian, skip nulls/empty
                $noteParts = array_filter([
                    $uasA    ? ($itemMap->get($uasA->id)?->notes    ?: null) : null,
                    $utsA    ? ($itemMap->get($utsA->id)?->notes    ?: null) : null,
                    $harianA ? ($itemMap->get($harianA->id)?->notes ?: null) : null,
                ]);
                $notes = implode('; ', array_unique($noteParts)) ?: null;

                $first = $group->first();
                return [
                    'subject' => ['name' => $first->subject->name, 'code' => $first->subject->code],
                    'notes'   => $notes,
                    'nh'      => $nh,
                    'nts'     => $nts,
                    'nas'     => $nas,
                    'na'      => $na,
                ];
            })
            ->sortBy('subject.name')
            ->values();

        $classroom->load('homeroomTeacher:id,name');

        return Inertia::render('Reports/Preview', [
            'classroom' => [
                'id'               => $classroom->id,
                'name'             => $classroom->name,
                'grade_level'      => $classroom->grade_level,
                'homeroom_teacher' => $classroom->homeroomTeacher?->name,
            ],
            'student'  => [
                'id'          => $student->id,
                'nis'         => $student->nis,
                'name'        => $student->name,
                'gender'      => $student->gender,
                'birth_date'  => $student->birth_date?->format('d F Y'),
                'birth_place' => $student->birth_place,
                'address'     => $student->address,
            ],
            'subjects'  => $subjects,
            'year'      => $year,
            'semester'  => $semester,
            'weights'   => $weights,
        ]);
    }
}
