import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

interface Classroom {
    id: number;
    name: string;
    grade_level: string | null;
    homeroom_teacher: string | null;
}

interface Student {
    id: number;
    nis: string;
    name: string;
    gender: 'L' | 'P';
    has_data: boolean;
}

interface Props extends PageProps {
    classroom: Classroom;
    students:  Student[];
    year:      string | null;
    semester:  number;
}

export default function ReportShow() {
    const { classroom, students, year, semester } = usePage<Props>().props;

    const previewUrl = (studentId: number) =>
        `/raport/${classroom.id}/${studentId}?year=${year ?? ''}&semester=${semester}`;

    const printUrl = (studentId: number) =>
        `${previewUrl(studentId)}&autoprint=1`;

    return (
        <AuthenticatedLayout header="Raport">
            <Head title={`Raport — ${classroom.name}`} />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
                    <a
                        href="/raport"
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-high"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </a>
                    <div className="flex-1">
                        <h1 className="text-headline-md font-bold text-on-surface">{classroom.name}</h1>
                        <p className="text-body-sm text-on-surface-variant">
                            {classroom.grade_level && `Tingkat ${classroom.grade_level} · `}
                            {year} · Semester {semester}
                            {classroom.homeroom_teacher && ` · ${classroom.homeroom_teacher}`}
                        </p>
                    </div>
                    <span className="text-body-sm text-on-surface-variant">
                        {students.length} santri
                    </span>
                </div>

                {/* Student list */}
                {students.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant py-16 text-center">
                        <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">group</span>
                        <p className="mt-3 text-body-base text-on-surface-variant">Belum ada santri di kelas ini.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
                        <div className="border-b border-outline-variant bg-surface-container-low px-5 py-3">
                            <p className="text-label-sm text-on-surface-variant">
                                Klik nama santri untuk preview · Klik <span className="material-symbols-outlined align-middle text-[14px]">print</span> untuk langsung cetak
                            </p>
                        </div>
                        <ul className="divide-y divide-outline-variant">
                            {students.map((s, idx) => (
                                <li key={s.id} className="flex items-center gap-2 pr-3">
                                    <Link
                                        href={previewUrl(s.id)}
                                        className="flex flex-1 items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-container-low"
                                    >
                                        <span className="w-7 flex-shrink-0 text-right text-label-sm text-on-surface-variant">
                                            {idx + 1}
                                        </span>
                                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-label-sm font-bold text-primary">
                                            {s.gender === 'L' ? 'L' : 'P'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-body-sm font-semibold text-on-surface">{s.name}</p>
                                            <p className="font-mono text-label-sm text-on-surface-variant">{s.nis}</p>
                                        </div>
                                        {s.has_data ? (
                                            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-label-sm text-primary">
                                                <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                                Ada nilai
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-label-sm text-on-surface-variant">
                                                Belum ada nilai
                                            </span>
                                        )}
                                        <span className="material-symbols-outlined flex-shrink-0 text-[20px] text-on-surface-variant">
                                            chevron_right
                                        </span>
                                    </Link>
                                    {/* Direct print button */}
                                    <a
                                        href={printUrl(s.id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Cetak langsung"
                                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">print</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
