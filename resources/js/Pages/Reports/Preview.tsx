import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { PageProps } from '@/types';

interface SubjectScore {
    subject: { name: string; code: string };
    notes:   string | null;
    nh:  number | null;
    nts: number | null;
    nas: number | null;
    na:  number | null;
}

interface SchoolProfile {
    name:         string;
    foundation:   string;
    address:      string;
    city:         string;
    postal_code:  string;
    phone:        string;
    email:        string;
    website:      string;
    logo_url:     string | null;
    opening_text: string;
}

interface Props extends PageProps {
    classroom: {
        id: number;
        name: string;
        grade_level: string | null;
        homeroom_teacher: string | null;
    };
    student: {
        id: number;
        nis: string;
        name: string;
        gender: 'L' | 'P';
        birth_date: string | null;
        birth_place: string | null;
        address: string | null;
    };
    subjects:  SubjectScore[];
    year:      string | null;
    semester:  number;
    weights:   { harian: number; uts: number; uas: number };
    school:    SchoolProfile;
}

type PaperSize = 'a4' | 'f4';

const PAPER_CSS: Record<PaperSize, string> = {
    a4: '@page { size: A4 portrait; margin: 15mm; }',
    f4: '@page { size: 215.9mm 330.2mm portrait; margin: 15mm; }',
};

function gradeLabel(score: number | null): string {
    if (score === null) return '—';
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'E';
}

function scoreColor(score: number | null): string {
    if (score === null) return 'text-gray-400';
    if (score >= 80) return 'text-green-700 font-semibold';
    if (score >= 60) return 'text-yellow-700 font-semibold';
    return 'text-red-700 font-semibold';
}

export default function ReportPreview() {
    const { classroom, student, subjects, year, semester, weights, school } = usePage<Props>().props;
    const [paper, setPaper] = useState<PaperSize>('a4');

    const handlePrint = () => window.print();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('autoprint') === '1') {
            const t = setTimeout(() => window.print(), 600);
            return () => clearTimeout(t);
        }
    }, []);

    const totalNA = subjects.filter((s) => s.na !== null);
    const avgNA   = totalNA.length > 0
        ? (totalNA.reduce((acc, s) => acc + (s.na ?? 0), 0) / totalNA.length)
        : null;

    return (
        <>
            <Head title={`Raport — ${student.name}`} />

            {/* Dynamic @page CSS */}
            <style>{PAPER_CSS[paper]}</style>

            {/* Print toolbar — hidden when printing */}
            <div className="no-print fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                    <a
                        href={`/raport/${classroom.id}`}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Kembali
                    </a>
                    <span className="text-sm font-semibold text-gray-800">{student.name}</span>
                </div>

                <div className="flex items-center gap-3">
                    <PaperToggle paper={paper} onChange={setPaper} />
                    <button
                        type="button"
                        onClick={handlePrint}
                        style={{ backgroundColor: '#004532' }}
                        className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90"
                    >
                        <span className="material-symbols-outlined text-[18px]">print</span>
                        Cetak / Simpan PDF
                    </button>
                </div>
            </div>

            {/* Report card body */}
            <div className={`report-page mx-auto bg-white ${paper === 'a4' ? 'w-[210mm]' : 'w-[215.9mm]'} min-h-[297mm] px-[15mm] py-[12mm] pt-[70px] font-serif text-gray-900 print:pt-0`}>

                {/* School header / Kop Raport */}
                <div className="border-b-2 border-gray-800 pb-4">
                    <div className="flex items-center gap-4">
                        {school.logo_url && (
                            <img
                                src={school.logo_url}
                                alt="Logo Sekolah"
                                className="h-20 w-20 flex-shrink-0 object-contain"
                                style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' } as React.CSSProperties}
                            />
                        )}
                        <div className={school.logo_url ? 'text-left' : 'flex-1 text-center'}>
                            {school.foundation && (
                                <p className="text-xs uppercase tracking-widest text-gray-500">{school.foundation}</p>
                            )}
                            <h2 className="text-xl font-bold uppercase tracking-wide text-gray-900">
                                {school.name || 'Nama Pesantren'}
                            </h2>
                            {(school.address || school.city) && (
                                <p className="text-xs text-gray-600">
                                    {[school.address, school.city, school.postal_code].filter(Boolean).join(', ')}
                                </p>
                            )}
                            {(school.phone || school.email || school.website) && (
                                <p className="text-xs text-gray-500">
                                    {[
                                        school.phone   ? `Telp: ${school.phone}`  : null,
                                        school.email   ? `Email: ${school.email}` : null,
                                        school.website ? school.website            : null,
                                    ].filter(Boolean).join(' | ')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Judul + kata pembuka — di bawah garis kop */}
                <div className="mb-6 mt-4 text-center">
                    <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-900">
                        Laporan Hasil Belajar
                    </h1>
                    <p className="mt-0.5 text-sm text-gray-600">
                        Tahun Ajaran {year} · Semester {semester === 1 ? 'Ganjil (1)' : 'Genap (2)'}
                    </p>
                    {school.opening_text && (
                        <p className="mt-2 text-xs italic text-gray-500">{school.opening_text}</p>
                    )}
                </div>

                {/* Student info */}
                <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                    <InfoRow label="Nama Santri"    value={student.name} />
                    <InfoRow label="Kelas"          value={classroom.name} />
                    <InfoRow label="NIS"            value={student.nis} />
                    <InfoRow label="Wali Kelas"     value={classroom.homeroom_teacher ?? '—'} />
                    <InfoRow label="Jenis Kelamin"  value={student.gender === 'L' ? 'Laki-laki' : 'Perempuan'} />
                    <InfoRow label="Tahun Ajaran"   value={`${year ?? '—'} · Semester ${semester}`} />
                    {student.birth_place && student.birth_date && (
                        <InfoRow label="Tempat/Tgl Lahir" value={`${student.birth_place}, ${student.birth_date}`} />
                    )}
                </div>

                {/* Score table */}
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-800 text-white">
                            <th className="border border-gray-600 px-3 py-2 text-center text-xs font-semibold">No</th>
                            <th className="border border-gray-600 px-3 py-2 text-left text-xs font-semibold">Mata Pelajaran</th>
                            <th className="border border-gray-600 px-3 py-2 text-center text-xs font-semibold">
                                NH<br /><span className="font-normal opacity-75">({weights.harian}%)</span>
                            </th>
                            <th className="border border-gray-600 px-3 py-2 text-center text-xs font-semibold">
                                NTS<br /><span className="font-normal opacity-75">({weights.uts}%)</span>
                            </th>
                            <th className="border border-gray-600 px-3 py-2 text-center text-xs font-semibold">
                                NAS<br /><span className="font-normal opacity-75">({weights.uas}%)</span>
                            </th>
                            <th className="border border-gray-600 px-3 py-2 text-center text-xs font-semibold">NA</th>
                            <th className="border border-gray-600 px-3 py-2 text-center text-xs font-semibold">Predikat</th>
                            <th className="border border-gray-600 px-3 py-2 text-left text-xs font-semibold">Catatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((row, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border border-gray-300 px-3 py-1.5 text-center text-xs text-gray-500">
                                    {idx + 1}
                                </td>
                                <td className="border border-gray-300 px-3 py-1.5 font-medium text-gray-900">
                                    {row.subject.name}
                                </td>
                                <td className={`border border-gray-300 px-3 py-1.5 text-center ${scoreColor(row.nh)}`}>
                                    {row.nh?.toFixed(0) ?? '—'}
                                </td>
                                <td className={`border border-gray-300 px-3 py-1.5 text-center ${scoreColor(row.nts)}`}>
                                    {row.nts?.toFixed(0) ?? '—'}
                                </td>
                                <td className={`border border-gray-300 px-3 py-1.5 text-center ${scoreColor(row.nas)}`}>
                                    {row.nas?.toFixed(0) ?? '—'}
                                </td>
                                <td className={`border border-gray-300 px-3 py-1.5 text-center font-bold ${scoreColor(row.na)}`}>
                                    {row.na?.toFixed(2) ?? '—'}
                                </td>
                                <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold text-gray-700">
                                    {gradeLabel(row.na)}
                                </td>
                                <td className="border border-gray-300 px-3 py-1.5 text-xs text-gray-500 italic">
                                    {row.notes ?? ''}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    {avgNA !== null && (
                        <tfoot>
                            <tr className="bg-gray-100 font-semibold">
                                <td colSpan={5} className="border border-gray-300 px-3 py-2 text-right text-xs text-gray-700">
                                    Rata-rata Nilai Akhir
                                </td>
                                <td className={`border border-gray-300 px-3 py-2 text-center text-sm ${scoreColor(avgNA)}`}>
                                    {avgNA.toFixed(2)}
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700">
                                    {gradeLabel(avgNA)}
                                </td>
                                            <td className="border border-gray-300 px-3 py-2" />
                            </tr>
                        </tfoot>
                    )}
                </table>

                {/* Print button — visible on screen, hidden when printing */}
                <div className="no-print mt-6 flex items-center justify-center gap-3">
                    <PaperToggle paper={paper} onChange={setPaper} />
                    <button
                        type="button"
                        onClick={handlePrint}
                        style={{ backgroundColor: '#004532' }}
                        className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow transition-all hover:opacity-90"
                    >
                        <span className="material-symbols-outlined text-[18px]">print</span>
                        Cetak / Simpan PDF
                    </button>
                </div>

                {/* Signature section */}
                <div className="mt-10 grid grid-cols-3 gap-8 text-center text-sm">
                    <div>
                        <p className="text-gray-600">Mengetahui,</p>
                        <p className="font-semibold">Orang Tua/Wali</p>
                        <div className="mx-auto mt-12 h-px w-40 bg-gray-800" />
                        <p className="mt-1 text-gray-500">( ........................... )</p>
                    </div>
                    <div />
                    <div>
                        <p className="text-gray-600">Wali Kelas,</p>
                        <p className="font-semibold">{classroom.name}</p>
                        <div className="mx-auto mt-12 h-px w-40 bg-gray-800" />
                        <p className="mt-1 font-semibold">{classroom.homeroom_teacher ?? '—'}</p>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { margin: 0; padding: 0; }
                    .report-page { width: 100% !important; padding: 0 !important; margin: 0 !important; }
                    img {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        display: block !important;
                        max-width: 100% !important;
                    }
                }
            `}</style>
        </>
    );
}

function PaperToggle({ paper, onChange }: { paper: PaperSize; onChange: (s: PaperSize) => void }) {
    return (
        <div className="flex items-center gap-1 rounded-lg border border-gray-300 p-1">
            {(['a4', 'f4'] as PaperSize[]).map((size) => (
                <button
                    key={size}
                    type="button"
                    onClick={() => onChange(size)}
                    style={paper === size ? { backgroundColor: '#004532', color: '#fff' } : undefined}
                    className={`rounded-md px-4 py-1.5 text-sm font-bold transition-colors ${
                        paper === size ? '' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    {size.toUpperCase()}
                </button>
            ))}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex gap-2">
            <span className="w-36 flex-shrink-0 text-gray-500">{label}</span>
            <span className="text-gray-400">:</span>
            <span className="font-medium text-gray-900">{value}</span>
        </div>
    );
}
