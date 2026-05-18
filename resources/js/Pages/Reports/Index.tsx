import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHero from '@/Components/PageHero';
import { Head, Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

interface Classroom {
    id: number;
    name: string;
    grade_level: string | null;
    academic_year: string | null;
    students_count: number;
    homeroom_teacher: string | null;
}

interface Props extends PageProps { classrooms: Classroom[] }

export default function ReportIndex() {
    const { classrooms } = usePage<Props>().props;

    return (
        <AuthenticatedLayout header="Raport">
            <Head title="Raport" />

            <PageHero
                icon="description"
                title="Cetak Raport"
                subtitle="Pilih kelas untuk melihat daftar santri dan mencetak raport."
            />

            {classrooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant py-20 text-center">
                    <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">school</span>
                    <p className="mt-3 text-body-base text-on-surface-variant">Belum ada kelas yang tersedia.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {classrooms.map((c) => (
                        <Link
                            key={c.id}
                            href={`/raport/${c.id}`}
                            className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                                    <span className="material-symbols-outlined text-[22px] text-primary">school</span>
                                </div>
                                <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-label-sm text-on-surface-variant">
                                    {c.students_count} santri
                                </span>
                            </div>
                            <div>
                                <h3 className="text-body-base font-bold text-on-surface">{c.name}</h3>
                                {c.grade_level && (
                                    <p className="text-body-sm text-on-surface-variant">Tingkat {c.grade_level}</p>
                                )}
                                {c.academic_year && (
                                    <p className="text-label-sm text-on-surface-variant/70">{c.academic_year}</p>
                                )}
                            </div>
                            {c.homeroom_teacher && (
                                <div className="flex items-center gap-1.5 border-t border-outline-variant pt-3">
                                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>
                                    <span className="text-label-sm text-on-surface-variant">{c.homeroom_teacher}</span>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
