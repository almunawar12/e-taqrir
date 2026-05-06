<?php
namespace App\Http\Controllers;

use App\Domain\Assessment\Services\AssessmentService;
use App\Http\Requests\StoreAssessmentRequest;
use App\Http\Requests\TransitionAssessmentRequest;
use App\Http\Requests\UpdateAssessmentRequest;
use App\Models\Assessment;
use App\Models\Classroom;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AssessmentController extends Controller
{
    public function __construct(private readonly AssessmentService $service) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Assessment::class);

        $user = $request->user();
        $query = Assessment::query()
            ->with(['classroom:id,name', 'subject:id,name,code', 'teacher:id,name'])
            ->withCount('items');

        // guru_mapel sees only their own
        if ($user->active_role === 'guru_mapel') {
            $query->where('teacher_id', $user->id);
        }

        // wali_kelas sees submitted (pending their verification)
        if ($user->active_role === 'wali_kelas') {
            $query->whereIn('state', ['submitted', 'verified', 'published']);
        }

        if ($request->state) {
            $query->where('state', $request->state);
        }

        $assessments = $query
            ->when($request->academic_year, fn($q, $y) => $q->where('academic_year', $y))
            ->when($request->semester, fn($q, $s) => $q->where('semester', $s))
            ->orderByDesc('updated_at')
            ->paginate(20)->withQueryString();

        return Inertia::render('Assessments/Index', [
            'assessments' => $assessments,
            'filters' => $request->only('state', 'academic_year', 'semester'),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Assessment::class);

        return Inertia::render('Assessments/Create', [
            'classrooms' => Classroom::select('id', 'name', 'academic_year')->orderBy('name')->get(),
            'subjects'   => Subject::select('id', 'code', 'name')->orderBy('code')->get(),
        ]);
    }

    public function store(StoreAssessmentRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['teacher_id'] = $request->user()->id;

        // enforce unique constraint
        $exists = Assessment::where([
            'classroom_id'  => $data['classroom_id'],
            'subject_id'    => $data['subject_id'],
            'academic_year' => $data['academic_year'],
            'semester'      => $data['semester'],
        ])->exists();

        if ($exists) {
            return back()->withErrors(['classroom_id' => 'Assessment untuk kelas, mapel, dan semester ini sudah ada.']);
        }

        $assessment = Assessment::create($data);

        // pre-populate items for all students in classroom
        $students = Student::where('classroom_id', $data['classroom_id'])->get('id');
        $items = $students->map(fn($s) => [
            'assessment_id' => $assessment->id,
            'student_id'    => $s->id,
            'score'         => null,
            'notes'         => null,
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);
        DB::table('assessment_items')->insert($items->toArray());

        return redirect()->route('assessments.edit', $assessment)
            ->with('success', 'Assessment dibuat. Silakan input nilai.');
    }

    public function edit(Assessment $assessment): Response
    {
        $this->authorize('update', $assessment);

        $assessment->load([
            'classroom:id,name',
            'subject:id,name,code',
            'items.student:id,name,nis,gender',
            'approvals.user:id,name',
        ]);

        return Inertia::render('Assessments/Edit', [
            'assessment' => $assessment,
            'canSubmit'  => request()->user()->can('submit', $assessment),
        ]);
    }

    public function update(UpdateAssessmentRequest $request, Assessment $assessment): RedirectResponse
    {
        $this->authorize('update', $assessment);

        DB::transaction(function () use ($request, $assessment) {
            foreach ($request->validated()['items'] as $item) {
                \App\Models\AssessmentItem::where('assessment_id', $assessment->id)
                    ->where('student_id', $item['student_id'])
                    ->update([
                        'score' => $item['score'] ?? null,
                        'notes' => $item['notes'] ?? null,
                    ]);
            }

            if ($request->filled('comment')) {
                $assessment->forceFill(['comment' => $request->comment])->save();
            }
        });

        return back()->with('success', 'Nilai disimpan.');
    }

    public function show(Assessment $assessment): Response
    {
        $this->authorize('view', $assessment);

        $assessment->load([
            'classroom:id,name',
            'subject:id,name,code',
            'teacher:id,name',
            'items.student:id,name,nis',
            'approvals.user:id,name',
        ]);

        return Inertia::render('Assessments/Show', [
            'assessment' => $assessment,
            'can' => [
                'submit'  => request()->user()->can('submit', $assessment),
                'verify'  => request()->user()->can('verify', $assessment),
                'reject'  => request()->user()->can('reject', $assessment),
                'publish' => request()->user()->can('publish', $assessment),
                'update'  => request()->user()->can('update', $assessment),
            ],
        ]);
    }

    public function transition(TransitionAssessmentRequest $request, Assessment $assessment): RedirectResponse
    {
        $action  = $request->validated()['action'];
        $comment = $request->string('comment')->toString() ?: null;
        $actor   = $request->user();

        match ($action) {
            'submit'  => $this->authorize('submit', $assessment),
            'verify'  => $this->authorize('verify', $assessment),
            'reject'  => $this->authorize('reject', $assessment),
            'publish' => $this->authorize('publish', $assessment),
            'reset'   => $this->authorize('submit', $assessment), // teacher resets their own rejected
        };

        match ($action) {
            'submit'  => $this->service->submit($assessment, $actor, $comment),
            'verify'  => $this->service->verify($assessment, $actor, $comment),
            'reject'  => $this->service->reject($assessment, $actor, $comment ?? ''),
            'publish' => $this->service->publish($assessment, $actor, $comment),
            'reset'   => $this->service->resetToDraft($assessment, $actor, $comment),
        };

        $labels = [
            'submit'  => 'diajukan',
            'verify'  => 'diverifikasi',
            'reject'  => 'ditolak',
            'publish' => 'dipublikasikan',
            'reset'   => 'dikembalikan ke draft',
        ];

        return back()->with('success', "Assessment berhasil {$labels[$action]}.");
    }

    public function destroy(Assessment $assessment): RedirectResponse
    {
        $this->authorize('delete', $assessment);
        $assessment->delete();
        return redirect()->route('assessments.index')->with('success', 'Assessment dihapus.');
    }
}
