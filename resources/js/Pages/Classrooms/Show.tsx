import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useConfirm } from '@/hooks/useConfirm';
import { useActiveRole } from '@/hooks/useActiveRole';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useDebounce, useDebounceEffect } from '@/hooks/useDebounce';
import type { PageProps } from '@/types';

interface Teacher { id: number; name: string }
interface Student  { id: number; nis: string; name: string; gender: 'L' | 'P' }

interface Classroom {
    id: number;
    name: string;
    grade_level: string;
    academic_year: string;
    homeroom_teacher: Teacher | null;
}

interface Props extends PageProps {
    classroom:  Classroom;
    assigned:   Student[];
    unassigned: Student[];
    filters:    { search?: string };
}

function initials(name: string) {
    return name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
}

const GENDER_LABEL: Record<string, string> = { L: 'Laki-laki', P: 'Perempuan' };

export default function ClassroomShow() {
    const { classroom, assigned, unassigned, filters } = usePage<Props>().props;
    const { active } = useActiveRole();
    const { confirm, dialog } = useConfirm();
    const [search, setSearch] = useState(filters.search ?? '');
    const debouncedSearch     = useDebounce(search);

    const canManage = active === 'super_admin' || active === 'wali_kelas';

    useDebounceEffect(debouncedSearch, () =>
        router.get(`/classrooms/${classroom.id}`, { search: debouncedSearch }, { preserveState: true, replace: true })
    );

    const handleAssign = (student: Student) => {
        router.post(`/classrooms/${classroom.id}/assign`, { student_id: student.id });
    };

    const handleRemove = (student: Student) => {
        confirm({
            title: 'Lepas santri dari kelas?',
            message: `"${student.name}" akan dilepas dari ${classroom.name}.`,
            tone: 'warning',
            confirmLabel: 'Lepas',
            onConfirm: (done) =>
                router.delete(`/classrooms/${classroom.id}/students/${student.id}`, { onFinish: done }),
        });
    };

    return (
        <AuthenticatedLayout header={classroom.name}>
            <Head title={`Kelas ${classroom.name}`} />
            {dialog}

            {/* Back + Header */}
            <div className="mb-8 flex items-center gap-4">
                <Link
                    href="/classrooms"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-high"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-display-lg font-bold text-primary">{classroom.name}</h1>
                    <p className="text-body-sm text-on-surface-variant">
                        Kelas {classroom.grade_level} · {classroom.academic_year}
                    </p>
                </div>
            </div>

            {/* Info card */}
            <div className="mb-8 grid grid-cols-2 gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 md:grid-cols-4">
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Tingkat</p>
                    <p className="mt-1 text-body-base font-bold text-on-surface">Kelas {classroom.grade_level}</p>
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Tahun Ajaran</p>
                    <p className="mt-1 text-body-base font-bold text-on-surface">{classroom.academic_year}</p>
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Wali Kelas</p>
                    <p className="mt-1 text-body-base font-bold text-on-surface">
                        {classroom.homeroom_teacher?.name ?? '— Belum ditentukan —'}
                    </p>
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Total Santri</p>
                    <p className="mt-1 text-body-base font-bold text-primary">{assigned.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                {/* ── Assigned students ── */}
                <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
                    <div className="border-b border-outline-variant px-6 py-4">
                        <h2 className="text-headline-md font-bold text-on-surface">Santri di Kelas Ini</h2>
                        <p className="text-body-sm text-on-surface-variant">{assigned.length} santri terdaftar</p>
                    </div>

                    {assigned.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">group</span>
                            <p className="mt-2 text-body-sm text-on-surface-variant">Belum ada santri di kelas ini.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-outline-variant/30">
                            {assigned.map((s) => (
                                <div key={s.id} className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-surface-container-low">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                            {initials(s.name)}
                                        </div>
                                        <div>
                                            <p className="text-body-base font-semibold text-on-surface">{s.name}</p>
                                            <p className="text-xs text-on-surface-variant">{s.nis} · {GENDER_LABEL[s.gender]}</p>
                                        </div>
                                    </div>
                                    {canManage && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(s)}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-all hover:bg-error/10 hover:text-error"
                                            aria-label="Lepas dari kelas"
                                            title="Lepas dari kelas"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">person_remove</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ── Assign unassigned students ── */}
                {canManage && (
                    <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
                        <div className="border-b border-outline-variant px-6 py-4">
                            <h2 className="text-headline-md font-bold text-on-surface">Tambah Santri ke Kelas</h2>
                            <p className="text-body-sm text-on-surface-variant">Santri yang belum memiliki kelas</p>
                        </div>

                        {/* Search */}
                        <div className="border-b border-outline-variant px-6 py-3">
                            <div className="relative">
                                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                                    search
                                </span>
                                <input
                                    type="search"
                                    placeholder="Cari NIS / nama..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        {unassigned.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">
                                    {search ? 'search_off' : 'how_to_reg'}
                                </span>
                                <p className="mt-2 text-body-sm text-on-surface-variant">
                                    {search ? 'Tidak ada hasil pencarian.' : 'Semua santri sudah memiliki kelas.'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-outline-variant/30">
                                {unassigned.map((s) => (
                                    <div key={s.id} className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-surface-container-low">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/10 text-xs font-bold text-secondary">
                                                {initials(s.name)}
                                            </div>
                                            <div>
                                                <p className="text-body-base font-semibold text-on-surface">{s.name}</p>
                                                <p className="text-xs text-on-surface-variant">{s.nis} · {GENDER_LABEL[s.gender]}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleAssign(s)}
                                            className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-on-primary"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">person_add</span>
                                            Tambahkan
                                        </button>
                                    </div>
                                ))}
                                {unassigned.length === 50 && (
                                    <p className="px-6 py-3 text-center text-xs text-on-surface-variant">
                                        Menampilkan 50 pertama. Gunakan pencarian untuk filter lebih lanjut.
                                    </p>
                                )}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
