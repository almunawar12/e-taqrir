<?php
namespace App\Http\Controllers;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\Classroom;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Student::class);
        $students = Student::query()
            ->with('classroom:id,name')
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('nis', 'like', "%{$s}%"))
            ->when($request->classroom_id, fn($q, $id) => $q->where('classroom_id', $id))
            ->orderBy('name')
            ->paginate(25)->withQueryString();

        return Inertia::render('Students/Index', [
            'students' => $students,
            'classrooms' => Classroom::select('id', 'name')->orderBy('name')->get(),
            'filters' => $request->only('search', 'classroom_id'),
        ]);
    }

    public function store(StoreStudentRequest $request): RedirectResponse
    {
        Student::create($request->validated());
        return redirect()->route('students.index')->with('success', 'Santri berhasil ditambahkan.');
    }

    public function update(UpdateStudentRequest $request, Student $student): RedirectResponse
    {
        $student->update($request->validated());
        return redirect()->route('students.index')->with('success', 'Data santri diperbarui.');
    }

    public function destroy(Student $student): RedirectResponse
    {
        $this->authorize('delete', $student);
        $student->delete();
        return back()->with('success', 'Santri dihapus.');
    }

    public function restore(int $id): RedirectResponse
    {
        $student = Student::withTrashed()->findOrFail($id);
        $this->authorize('restore', $student);
        $student->restore();
        return back()->with('success', 'Data santri dipulihkan.');
    }
}
