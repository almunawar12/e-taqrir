import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHero from '@/Components/PageHero';
import Pagination from '@/Components/Pagination';
import StatCard from '@/Components/StatCard';
import { useConfirm } from '@/hooks/useConfirm';
import { useActiveRole } from '@/hooks/useActiveRole';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps } from '@/types';

interface Subject {
    id: number;
    code: string;
    name: string;
    category: string;
    credit_hours: number;
}

interface Paginated {
    data: Subject[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from: number | null;
    to: number | null;
}

interface Props extends PageProps {
    subjects: Paginated;
    filters: { search?: string };
}

export default function SubjectsIndex() {
    const { subjects, filters } = usePage<Props>().props;
    const { active } = useActiveRole();
    const [search, setSearch] = useState(filters.search ?? '');
    const { confirm, dialog } = useConfirm();

    const isAdmin = active === 'super_admin';

    const applyFilter = (params: object) => {
        router.get('/subjects', { search, ...params }, { preserveState: true, replace: true });
    };

    const handleDelete = (s: Subject) => {
        confirm({
            title: 'Hapus mata pelajaran?',
            message: `Mapel "${s.name}" akan dihapus.`,
            tone: 'danger',
            confirmLabel: 'Hapus',
            onConfirm: (done) => router.delete(`/subjects/${s.id}`, { onFinish: done }),
        });
    };

    const categories = new Set(subjects.data.map((s) => s.category));
    const totalSks = subjects.data.reduce((sum, s) => sum + s.credit_hours, 0);

    return (
        <AuthenticatedLayout header="Mata Pelajaran">
            <Head title="Mata Pelajaran" />
            {dialog}

            <PageHero
                icon="auto_stories"
                title="Kurikulum"
                subtitle="Kelola dan atur seluruh mata pelajaran akademik dalam satu sistem terintegrasi."
            />

            {/* Stats */}
            <section className="mb-section-margin grid grid-cols-1 gap-card-gap md:grid-cols-3">
                <StatCard label="Total Mata Pelajaran" value={subjects.total} icon="auto_stories" inverse />
                <StatCard label="Kategori"             value={categories.size}     icon="category"     tone="secondary" />
                <StatCard label="Total SKS (Halaman)"  value={totalSks}            icon="schedule"     tone="tertiary" />
            </section>

            {/* Table card */}
            <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
                {/* Toolbar */}
                <div className="flex flex-col items-stretch justify-between gap-4 border-b border-outline-variant p-6 md:flex-row md:items-center">
                    <div className="flex items-center gap-3">
                        {isAdmin && (
                            <Link
                                href="/subjects/create"
                                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-button font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
                            >
                                <span className="material-symbols-outlined">add</span>
                                Tambah Pelajaran
                            </Link>
                        )}
                        <p className="text-body-sm text-on-surface-variant">
                            Total <span className="font-bold text-on-surface">{subjects.total}</span> entri
                        </p>
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                            search
                        </span>
                        <input
                            type="search"
                            placeholder="Cari kode / nama mapel..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilter({ search })}
                            className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2.5 pl-10 pr-4 text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20 md:w-72"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface-container-low text-on-surface-variant">
                            <tr>
                                <th className="px-6 py-4 text-label-caps">Kode</th>
                                <th className="px-6 py-4 text-label-caps">Mata Pelajaran</th>
                                <th className="px-6 py-4 text-label-caps">Kategori</th>
                                <th className="px-6 py-4 text-label-caps">SKS</th>
                                {isAdmin && <th className="px-6 py-4 text-right text-label-caps">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                            {subjects.data.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 5 : 4} className="px-6 py-16 text-center">
                                        <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">
                                            inbox
                                        </span>
                                        <p className="mt-2 text-body-sm text-on-surface-variant">
                                            Tidak ada mata pelajaran.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                subjects.data.map((s) => (
                                    <tr key={s.id} className="transition-colors hover:bg-surface-container/50">
                                        <td className="px-6 py-5">
                                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                                                {s.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-body-base font-semibold text-on-surface">
                                            {s.name}
                                        </td>
                                        <td className="px-6 py-5 text-body-sm text-on-surface-variant">
                                            {s.category}
                                        </td>
                                        <td className="px-6 py-5 text-body-sm text-on-surface-variant">
                                            {s.credit_hours} jam
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Link
                                                        href={`/subjects/${s.id}/edit`}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-outline transition-all hover:bg-primary/5 hover:text-primary"
                                                        aria-label="Edit"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(s)}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-outline transition-all hover:bg-error/5 hover:text-error"
                                                        aria-label="Hapus"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {subjects.last_page > 1 && (
                    <Pagination
                        meta={subjects}
                        onPage={(page) => applyFilter({ page })}
                        label="mapel"
                    />
                )}
            </section>
        </AuthenticatedLayout>
    );
}
