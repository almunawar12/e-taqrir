<?php
namespace App\Http\Controllers;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\Classroom;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
            'students'   => $students,
            'classrooms' => Classroom::select('id', 'name')->orderBy('name')->get(),
            'filters'    => $request->only('search', 'classroom_id'),
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

    public function downloadTemplate(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $headers = ['nis', 'name', 'gender', 'birth_date', 'birth_place', 'address', 'wali_phone'];
        $sheet->fromArray($headers, null, 'A1');

        // Style header row: bold + green background
        $headerStyle = $sheet->getStyle('A1:G1');
        $headerStyle->getFont()->setBold(true)->getColor()->setRGB('FFFFFF');
        $headerStyle->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('004532');

        // Example rows
        $sheet->fromArray(['2024001', 'Ahmad Fauzi', 'L', '2010-05-15', 'Jakarta', 'Jl. Contoh No. 1', '08123456789'], null, 'A2');
        $sheet->fromArray(['2024002', 'Siti Aminah', 'P', '2010-03-20', 'Bandung', '', '08987654321'], null, 'A3');

        foreach (range('A', 'G') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'template-import-santri.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        $this->authorize('viewAny', Student::class);
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls', 'max:4096'],
        ]);

        $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($request->file('file')->getPathname());
        $rows        = $spreadsheet->getActiveSheet()->toArray(null, true, true, false);
        array_shift($rows); // skip header row

        $imported = 0;
        $errors   = [];
        $rowNum   = 1;

        DB::beginTransaction();
        try {
            foreach ($rows as $row) {
                $rowNum++;
                $row = array_map(fn($v) => trim((string) ($v ?? '')), $row);

                $nis        = $row[0];
                $name       = $row[1];
                $gender     = strtoupper($row[2]);
                $birthDate  = $row[3] ?: null;
                $birthPlace = $row[4] ?: null;
                $address    = $row[5] ?: null;
                $waliPhone  = $row[6] ?: null;

                if ($nis === '' || $name === '') {
                    $errors[] = "Baris {$rowNum}: NIS dan Nama wajib diisi.";
                    continue;
                }
                if (! in_array($gender, ['L', 'P'])) {
                    $errors[] = "Baris {$rowNum}: Gender harus L atau P (nilai: \"{$row[2]}\").";
                    continue;
                }
                if (Student::withTrashed()->where('nis', $nis)->exists()) {
                    $errors[] = "Baris {$rowNum}: NIS {$nis} sudah terdaftar.";
                    continue;
                }

                Student::create([
                    'nis'         => $nis,
                    'name'        => $name,
                    'gender'      => $gender,
                    'birth_date'  => $birthDate,
                    'birth_place' => $birthPlace,
                    'address'     => $address,
                    'wali_phone'  => $waliPhone,
                ]);
                $imported++;
            }
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->with('error', 'Import gagal: ' . $e->getMessage());
        }

        $flash = [];
        if ($imported > 0) {
            $flash['success'] = "{$imported} santri berhasil diimport.";
        }
        if (count($errors) > 0) {
            $flash['error'] = count($errors) . ' baris gagal: ' . implode(' | ', $errors);
        }
        if ($imported === 0 && empty($errors)) {
            $flash['error'] = 'File kosong atau tidak ada data valid.';
        }

        return back()->with($flash);
    }
}
