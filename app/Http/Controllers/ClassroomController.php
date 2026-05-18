<?php
namespace App\Http\Controllers;
use App\Http\Requests\StoreClassroomRequest;
use App\Http\Requests\UpdateClassroomRequest;
use App\Models\Classroom;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClassroomController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Classroom::class);
        $user = $request->user();

        $classrooms = Classroom::query()
            ->withCount('students')
            ->with('homeroomTeacher:id,name')
            ->when($user->active_role === 'wali_kelas', fn($q) => $q->where('homeroom_teacher_id', $user->id))
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy('grade_level')->orderBy('name')
            ->paginate(20)->withQueryString();

        return Inertia::render('Classrooms/Index', [
            'classrooms' => $classrooms,
            'filters'    => $request->only('search'),
            'teachers'   => User::role(['wali_kelas', 'super_admin'])->select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function show(Request $request, Classroom $classroom): Response
    {
        $this->authorize('viewAny', Classroom::class);

        $assigned = $classroom->students()
            ->orderBy('name')
            ->get(['id', 'nis', 'name', 'gender']);

        $unassigned = Student::whereNull('classroom_id')
            ->when(
                $request->search,
                fn ($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('nis', 'like', "%{$s}%")
            )
            ->orderBy('name')
            ->limit(50)
            ->get(['id', 'nis', 'name', 'gender']);

        return Inertia::render('Classrooms/Show', [
            'classroom'  => $classroom->load('homeroomTeacher:id,name'),
            'assigned'   => $assigned,
            'unassigned' => $unassigned,
            'filters'    => $request->only('search'),
        ]);
    }

    public function store(StoreClassroomRequest $request): RedirectResponse
    {
        Classroom::create($request->validated());
        return redirect()->route('classrooms.index')->with('success', 'Kelas berhasil ditambahkan.');
    }

    public function update(UpdateClassroomRequest $request, Classroom $classroom): RedirectResponse
    {
        $classroom->update($request->validated());
        return redirect()->route('classrooms.index')->with('success', 'Kelas berhasil diperbarui.');
    }

    public function destroy(Classroom $classroom): RedirectResponse
    {
        $this->authorize('delete', $classroom);
        $classroom->delete();
        return back()->with('success', 'Kelas dihapus.');
    }

    public function restore(int $id): RedirectResponse
    {
        $classroom = Classroom::withTrashed()->findOrFail($id);
        $this->authorize('restore', $classroom);
        $classroom->restore();
        return back()->with('success', 'Kelas dipulihkan.');
    }

    public function assignStudent(Request $request, Classroom $classroom): RedirectResponse
    {
        $this->authorize('viewAny', Classroom::class);
        $request->validate(['student_id' => 'required|exists:students,id']);

        Student::whereKey($request->student_id)
            ->whereNull('classroom_id')
            ->update(['classroom_id' => $classroom->id]);

        return back()->with('success', 'Santri berhasil ditambahkan ke kelas.');
    }

    public function removeStudent(Classroom $classroom, Student $student): RedirectResponse
    {
        $this->authorize('viewAny', Classroom::class);

        if ((int) $student->classroom_id === $classroom->id) {
            $student->update(['classroom_id' => null]);
        }

        return back()->with('success', 'Santri berhasil dilepas dari kelas.');
    }
}
