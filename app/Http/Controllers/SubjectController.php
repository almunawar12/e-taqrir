<?php
namespace App\Http\Controllers;
use App\Http\Requests\StoreSubjectRequest;
use App\Http\Requests\UpdateSubjectRequest;
use App\Models\Classroom;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubjectController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Subject::class);
        $subjects = Subject::query()
            ->with(['teachers:id,name', 'classrooms:id,name,grade_level'])
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%"))
            ->orderBy('code')
            ->paginate(20)->withQueryString();

        $teachers   = User::role('guru_mapel')->orderBy('name')->get(['id', 'name']);
        $classrooms = Classroom::orderBy('grade_level')->orderBy('name')->get(['id', 'name', 'grade_level']);

        return Inertia::render('Subjects/Index', [
            'subjects'   => $subjects,
            'teachers'   => $teachers,
            'classrooms' => $classrooms,
            'filters'    => $request->only('search'),
        ]);
    }

    public function store(StoreSubjectRequest $request): RedirectResponse
    {
        Subject::create($request->validated());
        return redirect()->route('subjects.index')->with('success', 'Mata pelajaran berhasil ditambahkan.');
    }

    public function update(UpdateSubjectRequest $request, Subject $subject): RedirectResponse
    {
        $subject->update($request->validated());
        return redirect()->route('subjects.index')->with('success', 'Mata pelajaran berhasil diperbarui.');
    }

    public function destroy(Subject $subject): RedirectResponse
    {
        $this->authorize('delete', $subject);
        $subject->delete();
        return back()->with('success', 'Mata pelajaran dihapus.');
    }

    public function restore(int $id): RedirectResponse
    {
        $subject = Subject::withTrashed()->findOrFail($id);
        $this->authorize('restore', $subject);
        $subject->restore();
        return back()->with('success', 'Mata pelajaran dipulihkan.');
    }

    public function syncTeachers(Request $request, Subject $subject): RedirectResponse
    {
        $this->authorize('update', $subject);

        $request->validate([
            'teacher_ids'   => ['present', 'array'],
            'teacher_ids.*' => ['integer', Rule::exists('users', 'id')],
        ]);

        $subject->teachers()->sync($request->teacher_ids);

        return back()->with('success', 'Pengajar berhasil diperbarui.');
    }

    public function syncClassrooms(Request $request, Subject $subject): RedirectResponse
    {
        $this->authorize('update', $subject);

        $request->validate([
            'classroom_ids'   => ['present', 'array'],
            'classroom_ids.*' => ['integer', Rule::exists('classrooms', 'id')],
        ]);

        $subject->classrooms()->sync($request->classroom_ids);

        return back()->with('success', 'Kelas berhasil diperbarui.');
    }
}
