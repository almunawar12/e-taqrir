import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTable from '@/Components/DataTable';
import { useConfirm } from '@/hooks/useConfirm';
import { useActiveRole } from '@/hooks/useActiveRole';
import { Link, router, usePage } from '@inertiajs/react';
import { createColumnHelper } from '@tanstack/react-table';
import { useState } from 'react';
import type { PageProps } from '@/types';

interface Subject {
    id: number;
    code: string;
    name: string;
    category: string;
    credit_hours: number;
}

interface PaginatedSubjects {
    data: Subject[];
    meta: { current_page: number; last_page: number; total: number; per_page: number };
}

interface Props extends PageProps {
    subjects: PaginatedSubjects;
    filters: { search?: string };
}

const col = createColumnHelper<Subject>();

export default function SubjectsIndex() {
    const { subjects, filters } = usePage<Props>().props;
    const { active } = useActiveRole();
    const [search, setSearch] = useState(filters.search ?? '');
    const { confirm, dialog } = useConfirm();

    const applyFilter = (params: object) => {
        router.get('/subjects', { search, ...params }, { preserveState: true, replace: true });
    };

    const columns = [
        col.accessor('code', { header: 'Kode' }),
        col.accessor('name', { header: 'Nama Mapel' }),
        col.accessor('category', { header: 'Kategori' }),
        col.accessor('credit_hours', { header: 'Jam Pelajaran' }),
        col.display({
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const s = row.original;
                return (
                    <div className="flex gap-2">
                        {active === 'super_admin' && (
                            <>
                                <Link
                                    href={`/subjects/${s.id}/edit`}
                                    className="text-indigo-600 hover:underline text-xs"
                                >
                                    Edit
                                </Link>
                                <button
                                    className="text-red-500 hover:underline text-xs"
                                    onClick={() => {
                                        confirm({
                                            title: 'Hapus mata pelajaran?',
                                            message: `Mapel "${s.name}" akan dihapus.`,
                                            tone: 'danger',
                                            confirmLabel: 'Hapus',
                                            onConfirm: (done) => {
                                                router.delete(`/subjects/${s.id}`, { onFinish: done });
                                            },
                                        });
                                    }}
                                >
                                    Hapus
                                </button>
                            </>
                        )}
                    </div>
                );
            },
        }),
    ];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Data Mata Pelajaran</h2>}>
            {dialog}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                    <input
                        type="search"
                        placeholder="Cari kode / nama mapel..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilter({ search })}
                        className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 w-56"
                    />
                    {active === 'super_admin' && (
                        <Link
                            href="/subjects/create"
                            className="ml-auto rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                        >
                            + Tambah Mapel
                        </Link>
                    )}
                </div>
                <DataTable
                    data={subjects.data}
                    columns={columns}
                    meta={subjects.meta}
                    onPrev={() => applyFilter({ page: subjects.meta.current_page - 1 })}
                    onNext={() => applyFilter({ page: subjects.meta.current_page + 1 })}
                />
            </div>
        </AuthenticatedLayout>
    );
}
