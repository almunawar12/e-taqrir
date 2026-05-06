<?php
namespace App\Http\Controllers;
use App\Http\Requests\StoreClassroomRequest;
use App\Http\Requests\UpdateClassroomRequest;
use App\Models\Classroom;
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
        $classrooms = Classroom::query()
            ->withCount('students')
            ->with('homeroomTeacher:id,name')
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy('grade_level')->orderBy('name')
            ->paginate(20)->withQueryString();

        return Inertia::render('Classrooms/Index', [
            'classrooms' => $classrooms,
            'filters' => $request->only('search'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Classrooms/Form', [
            'teachers' => User::role('wali_kelas')->orRole('super_admin')->select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function store(StoreClassroomRequest $request): RedirectResponse
    {
        Classroom::create($request->validated());
        return redirect()->route('classrooms.index')->with('success', 'Kelas berhasil ditambahkan.');
    }

    public function edit(Classroom $classroom): Response
    {
        return Inertia::render('Classrooms/Form', [
            'classroom' => $classroom,
            'teachers' => User::role('wali_kelas')->orRole('super_admin')->select('id', 'name')->orderBy('name')->get(),
        ]);
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
}
