<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\AssessmentItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ScoreImportController extends Controller
{
    public function downloadTemplate(Assessment $assessment): StreamedResponse
    {
        $this->authorize('update', $assessment);

        $assessment->load(['classroom:id,name', 'subject:id,name,code', 'items.student:id,name,nis']);

        $spreadsheet = new Spreadsheet();
        $sheet       = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Nilai');

        // ── Meta info rows ───────────────────────────────────────────────
        $sheet->setCellValue('A1', 'Mata Pelajaran');
        $sheet->setCellValue('B1', "[{$assessment->subject->code}] {$assessment->subject->name}");
        $sheet->setCellValue('A2', 'Kelas');
        $sheet->setCellValue('B2', $assessment->classroom->name);
        $sheet->setCellValue('A3', 'Tahun Ajaran');
        $sheet->setCellValue('B3', "{$assessment->academic_year} — Semester {$assessment->semester}");
        $sheet->setCellValue('A4', 'Jenis');
        $sheet->setCellValue('B4', strtoupper($assessment->type));

        $sheet->getStyle('A1:A4')->getFont()->setBold(true);

        // ── Column headers (row 6) ────────────────────────────────────────
        $sheet->fromArray(['student_id', 'NIS', 'Nama Santri', 'Nilai (0-100)', 'Catatan'], null, 'A6');

        $headerStyle = $sheet->getStyle('A6:E6');
        $headerStyle->getFont()->setBold(true)->getColor()->setRGB('FFFFFF');
        $headerStyle->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('004532');
        $headerStyle->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // ── Data rows ─────────────────────────────────────────────────────
        $row = 7;
        foreach ($assessment->items->sortBy('student.name') as $item) {
            $sheet->setCellValue("A{$row}", $item->student_id);
            $sheet->setCellValue("B{$row}", $item->student->nis);
            $sheet->setCellValue("C{$row}", $item->student->name);
            $sheet->setCellValue("D{$row}", $item->score !== null ? (float) $item->score : '');
            $sheet->setCellValue("E{$row}", $item->notes ?? '');
            $row++;
        }

        // ── Column widths ─────────────────────────────────────────────────
        $sheet->getColumnDimension('A')->setWidth(0.5); // student_id — narrow, read-only ref
        $sheet->getColumnDimension('B')->setAutoSize(true);
        $sheet->getColumnDimension('C')->setAutoSize(true);
        $sheet->getColumnDimension('D')->setWidth(16);
        $sheet->getColumnDimension('E')->setAutoSize(true);

        // ── Score validation & format ─────────────────────────────────────
        $lastRow = $row - 1;
        if ($lastRow >= 7) {
            $sheet->getStyle("D7:D{$lastRow}")
                ->getNumberFormat()
                ->setFormatCode(NumberFormat::FORMAT_NUMBER_00);

            $validation = $sheet->getCell('D7')->getDataValidation();
            $validation->setType(DataValidation::TYPE_DECIMAL);
            $validation->setOperator(DataValidation::OPERATOR_BETWEEN);
            $validation->setFormula1('0');
            $validation->setFormula2('100');
            $validation->setShowErrorMessage(true);
            $validation->setErrorTitle('Nilai tidak valid');
            $validation->setError('Nilai harus antara 0 dan 100.');
            $validation->setSqref("D7:D{$lastRow}");
        }

        $sheet->freezePane('A7');

        $writer   = new Xlsx($spreadsheet);
        $filename = preg_replace('/[^A-Za-z0-9\-_.]/', '-',
            "nilai-{$assessment->subject->code}-{$assessment->classroom->name}-{$assessment->type}.xlsx"
        );

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function import(Request $request, Assessment $assessment): RedirectResponse
    {
        $this->authorize('update', $assessment);

        $request->validate([
            'scores_file' => ['required', 'file', 'mimes:xlsx,xls', 'max:4096'],
        ]);

        $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load(
            $request->file('scores_file')->getPathname()
        );
        $rows = $spreadsheet->getActiveSheet()->toArray(null, true, true, false);

        // Find the data header row (first cell = 'student_id')
        $dataStart = null;
        foreach ($rows as $idx => $row) {
            if (isset($row[0]) && strtolower(trim((string) $row[0])) === 'student_id') {
                $dataStart = $idx + 1;
                break;
            }
        }

        if ($dataStart === null) {
            return back()->withErrors(['scores_file' => 'Format file tidak valid. Gunakan template yang diunduh dari sistem.']);
        }

        $updated = 0;
        $errors  = [];

        foreach (array_slice($rows, $dataStart) as $i => $row) {
            $studentId = isset($row[0]) ? (int) $row[0] : 0;
            $scoreRaw  = isset($row[3]) ? trim((string) $row[3]) : '';
            $notes     = isset($row[4]) ? trim((string) $row[4]) : null;

            if (! $studentId) continue;

            $score = $scoreRaw === '' ? null : (float) $scoreRaw;

            if ($score !== null && ($score < 0 || $score > 100)) {
                $errors[] = "Baris " . ($dataStart + $i + 2) . ": nilai {$scoreRaw} di luar batas 0–100.";
                continue;
            }

            $affected = AssessmentItem::where('assessment_id', $assessment->id)
                ->where('student_id', $studentId)
                ->update(['score' => $score, 'notes' => $notes ?: null]);

            if ($affected) $updated++;
        }

        $flash = [];
        if ($updated > 0) {
            $flash['success'] = "{$updated} nilai berhasil diperbarui dari file Excel.";
        }
        if (count($errors)) {
            $flash['error'] = implode(' | ', $errors);
        }
        if (! $updated && ! count($errors)) {
            $flash['error'] = 'Tidak ada data nilai yang diproses.';
        }

        return back()->with($flash);
    }
}
