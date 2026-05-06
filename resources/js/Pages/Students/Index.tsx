import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHero from '@/Components/PageHero';
import Pagination from '@/Components/Pagination';
import StatCard from '@/Components/StatCard';
import { useConfirm } from '@/hooks/useConfirm';
import { useActiveRole } from '@/hooks/useActiveRole';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps } from '@/types';

interface Classroom { id: number; name: string }

interface Student {
    id: number;
    nis: string;
    name: string;
    gender: 'L' | 'P';
    birth_place: string | null;
    wali_phone: string | null;
    classroom: Classroom | null;
}

interface Paginated {
    data: Student[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from: number | null;
    to: number | null;
}

interface Props extends PageProps {
    students: Paginated;
    classrooms: Classroom[];
    filters: { search?: string; classroom_id?: string };
}

function initials(name: string): string {
    return name
        .split(' ')
        .map((s) => s.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export default function StudentsIndex() {
    const { students, classrooms, filters } = usePage<Props>().props;
    const { active } = useActiveRole();
    const [search, setSearch] = useState(filters.search ?? '');
    const [classroomId, setClassroomId] = useState(filters.classroom_id ?? '');
    const { confirm, dialog } = useConfirm();

    const canEdit   = active === 'super_admin' || active === 'wali_kelas';
    const canDelete = active === 'super_admin';

    const applyFilter = (params: object) => {
        router.get('/students', { search, classroom_id: classroomId, ...params }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (s: Student) => {
        confirm({
            title: 'Hapus santri?',
            message: `Data "${s.name}" akan dihapus.`,
            tone: 'danger',
            confirmLabel: 'Hapus',
            onConfirm: (done) => router.delete(`/students/${s.id}`, { onFinish: done }),
        });
    };

    const putra = students.data.filter((s) => s.gender === 'L').length;
    const putri = students.data.filter((s) => s.gender === 'P').length;

    return (
        <AuthenticatedLayout header="Database Santri">
            <Head title="Santri" />
            {dialog}

            <PageHero
                icon="group"
                title="Database Santri"
                subtitle="Kelola data akademik dan profil santri secara real-time."
            />

            {/* Stats */}
            <section className="mb-section-margin grid grid-cols-2 gap-card-gap lg:grid-cols-4">
                <StatCard label="Total Santri" value={students.total} icon="group"        tone="primary" />
                <StatCard label="Halaman ini"  value={students.data.length} icon="check_circle" tone="secondary" badge={`Page ${students.current_page}/${students.last_page}`} />
                <StatCard label="Putra"        value={putra}                icon="man"          tone="neutral" />
                <StatCard label="Putri"        value={putri}                icon="woman"        tone="neutral" />
            </section>

            {/* Table card */}
            <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
                <div className="flex flex-col items-stretch justify-between gap-4 border-b border-outline-variant bg-surface-container-lowest p-6 md:flex-row md:items-center">
                    <div>
                        <h3 className="text-headline-md font-bold text-primary">Daftar Santri</h3>
                        <p className="text-body-sm text-on-surface-variant">
                            {students.total.toLocaleString('id-ID')} santri terdaftar.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={classroomId}
                            onChange={(e) => {
                                setClassroomId(e.target.value);
                                applyFilter({ classroom_id: e.target.value });
                            }}
                            className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">Semua kelas</option>
                            {classrooms.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <div className="relative">
                            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                                search
                            </span>
                            <input
                                type="search"
                                placeholder="Cari NIS / nama..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilter({ search })}
                                className="rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        {canEdit && (
                            <Link
                                href="/students/create"
                                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-button font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
                            >
                                <span className="material-symbols-outlined text-[20px]">add</span>
                                Tambah
                            </Link>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface-container-low text-on-surface-variant">
                            <tr>
                                <th className="px-6 py-4 text-label-caps tracking-wider">NIS</th>
                                <th className="px-6 py-4 text-label-caps tracking-wider">Nama Lengkap</th>
                                <th className="px-6 py-4 text-label-caps tracking-wider">Gender</th>
                                <th className="px-6 py-4 text-label-caps tracking-wider">Kelas</th>
                                <th className="px-6 py-4 text-label-caps tracking-wider">No. Wali</th>
                                {(canEdit || canDelete) && (
                                    <th className="px-6 py-4 text-right text-label-caps tracking-wider">Aksi</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/30">
                            {students.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">
                                            inbox
                                        </span>
                                        <p className="mt-2 text-body-sm text-on-surface-variant">
                                            Tidak ada santri ditemukan.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                students.data.map((s) => (
                                    <tr key={s.id} className="transition-colors hover:bg-surface-container-lowest">
                                        <td className="px-6 py-4 text-body-sm font-semibold text-primary">
                                            {s.nis}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-container/30 text-xs font-bold text-secondary">
                                                    {initials(s.name)}
                                                </div>
                                                <div>
                                                    <p className="text-body-base font-bold text-on-surface">{s.name}</p>
                                                    {s.birth_place && (
                                                        <p className="text-xs text-on-surface-variant">{s.birth_place}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-body-sm text-on-surface-variant">
                                            {s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {s.classroom ? (
                                                <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold text-on-surface-variant">
                                                    {s.classroom.name}
                                                </span>
                                            ) : (
                                                <span className="text-body-sm text-on-surface-variant/60">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-body-sm text-on-surface-variant">
                                            {s.wali_phone ?? '—'}
                                        </td>
                                        {(canEdit || canDelete) && (
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    {canEdit && (
                                                        <Link
                                                            href={`/students/${s.id}/edit`}
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg text-outline transition-all hover:bg-primary/5 hover:text-primary"
                                                            aria-label="Edit"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                                        </Link>
                                                    )}
                                                    {canDelete && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(s)}
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg text-outline transition-all hover:bg-error/5 hover:text-error"
                                                            aria-label="Hapus"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {students.last_page > 1 && (
                    <Pagination
                        meta={students}
                        onPage={(page) => applyFilter({ page })}
                        label="santri"
                    />
                )}
            </section>
        </AuthenticatedLayout>
    );
}
