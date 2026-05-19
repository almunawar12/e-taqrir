<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\StudentAbsence;
use App\Models\StudentExtracurricular;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RekapController extends Controller
{
    private function authorizeClassroom(Request $request, Classroom $classroom): void
    {
        $user = $request->user();
        abort_if(! in_array($user->active_role, ['super_admin', 'wali_kelas']), 403);
        if ($user->active_role === 'wali_kelas') {
            abort_if($classroom->homeroom_teacher_id !== $user->id, 403);
        }
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_if(! in_array($user->active_role, ['super_admin', 'wali_kelas']), 403);

        $query = Classroom::with('homeroomTeacher:id,name')
            ->withCount('students')
            ->orderBy('name');

        if ($user->active_role === 'wali_kelas') {
            $query->where('homeroom_teacher_id', $user->id);
        }

        $classrooms = $query->get()->map(fn ($c) => [
            'id'               => $c->id,
            'name'             => $c->name,
            'grade_level'      => $c->grade_level,
            'academic_year'    => $c->academic_year,
            'students_count'   => $c->students_count,
            'homeroom_teacher' => $c->homeroomTeacher?->name,
        ]);

        return Inertia::render('Rekap/Index', [
            'classrooms' => $classrooms,
        ]);
    }

    public function show(Request $request, Classroom $classroom): Response
    {
        $this->authorizeClassroom($request, $classroom);

        $user     = $request->user();
        $year     = $request->query('year',     $user->active_academic_year ?? $classroom->academic_year);
        $semester = (int) $request->query('semester', $user->active_semester ?? 1);

        $students = $classroom->students()->orderBy('name')->get(['id', 'nis', 'name']);

        $absences = StudentAbsence::where('classroom_id', $classroom->id)
            ->where('academic_year', $year)
            ->where('semester', $semester)
            ->get()
            ->keyBy('student_id');

        $ekskuls = StudentExtracurricular::where('classroom_id', $classroom->id)
            ->where('academic_year', $year)
            ->where('semester', $semester)
            ->orderBy('sort_order')
            ->get()
            ->groupBy('student_id');

        $studentData = $students->map(fn ($s) => [
            'id'      => $s->id,
            'nis'     => $s->nis,
            'name'    => $s->name,
            'absence' => [
                'sakit' => $absences[$s->id]->sakit ?? 0,
                'izin'  => $absences[$s->id]->izin  ?? 0,
                'alpha' => $absences[$s->id]->alpha ?? 0,
                'notes' => $absences[$s->id]->notes ?? '',
            ],
            'ekskul'  => ($ekskuls[$s->id] ?? collect())
                ->map(fn ($e) => ['name' => $e->name, 'grade' => $e->grade])
                ->values()
                ->toArray(),
        ]);

        return Inertia::render('Rekap/Show', [
            'classroom' => [
                'id'          => $classroom->id,
                'name'        => $classroom->name,
                'grade_level' => $classroom->grade_level,
            ],
            'students' => $studentData,
            'year'     => $year,
            'semester' => $semester,
        ]);
    }

    public function saveAbsensi(Request $request, Classroom $classroom): RedirectResponse
    {
        $this->authorizeClassroom($request, $classroom);

        $data = $request->validate([
            'year'              => ['required', 'string', 'regex:/^\d{4}\/\d{4}$/'],
            'semester'          => ['required', 'integer', 'in:1,2'],
            'absences'          => ['required', 'array'],
            'absences.*.sakit'  => ['required', 'integer', 'min:0', 'max:999'],
            'absences.*.izin'   => ['required', 'integer', 'min:0', 'max:999'],
            'absences.*.alpha'  => ['required', 'integer', 'min:0', 'max:999'],
            'absences.*.notes'  => ['nullable', 'string', 'max:500'],
        ]);

        $studentIds = $classroom->students()->pluck('id');

        foreach ($data['absences'] as $studentId => $values) {
            if (! $studentIds->contains((int) $studentId)) continue;
            StudentAbsence::updateOrCreate(
                [
                    'student_id'    => $studentId,
                    'classroom_id'  => $classroom->id,
                    'academic_year' => $data['year'],
                    'semester'      => $data['semester'],
                ],
                [
                    'sakit' => $values['sakit'],
                    'izin'  => $values['izin'],
                    'alpha' => $values['alpha'],
                    'notes' => $values['notes'] ?? null,
                ]
            );
        }

        return back()->with('success', 'Data absensi berhasil disimpan.');
    }

    public function saveEkskul(Request $request, Classroom $classroom): RedirectResponse
    {
        $this->authorizeClassroom($request, $classroom);

        $data = $request->validate([
            'year'              => ['required', 'string', 'regex:/^\d{4}\/\d{4}$/'],
            'semester'          => ['required', 'integer', 'in:1,2'],
            'students'          => ['required', 'array'],
            'students.*'        => ['present', 'array', 'max:15'],
            'students.*.*.name' => ['required', 'string', 'max:100'],
            'students.*.*.grade' => ['required', 'string', 'in:A,B,C'],
        ]);

        $studentIds = $classroom->students()->pluck('id');

        // Delete all existing ekskul for this classroom/period
        StudentExtracurricular::where('classroom_id', $classroom->id)
            ->where('academic_year', $data['year'])
            ->where('semester', $data['semester'])
            ->whereIn('student_id', $studentIds)
            ->delete();

        foreach ($data['students'] as $studentId => $ekskuls) {
            if (! $studentIds->contains((int) $studentId)) continue;
            foreach ($ekskuls as $idx => $item) {
                StudentExtracurricular::create([
                    'student_id'   => $studentId,
                    'classroom_id' => $classroom->id,
                    'academic_year' => $data['year'],
                    'semester'     => $data['semester'],
                    'name'         => $item['name'],
                    'grade'        => $item['grade'],
                    'sort_order'   => $idx,
                ]);
            }
        }

        return back()->with('success', 'Data ekskul berhasil disimpan.');
    }
}
