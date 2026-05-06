import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTable from '@/Components/DataTable';
import { useConfirm } from '@/hooks/useConfirm';
import { useActiveRole } from '@/hooks/useActiveRole';
import { Link, router, usePage } from '@inertiajs/react';
import { createColumnHelper } from '@tanstack/react-table';
import { useState } from 'react';
import type { PageProps } from '@/types';

interface Classroom {
    id: number;
    name: string;
    grade_level: string;
    academic_year: string;
    students_count: number;
    homeroom_teacher: { id: number; name: string } | null;
    deleted_at: string | null;
}

interface PaginatedClassrooms {
    data: Classroom[];
    meta: { current_page: number; last_page: number; total: number; per_page: number };
}

interface Props extends PageProps {
    classrooms: PaginatedClassrooms;
    filters: { search?: string };
}

const col = createColumnHelper<Classroom>();

export default function ClassroomsIndex() {
    const { classrooms, filters } = usePage<Props>().props;
    const { active } = useActiveRole();
    const [search, setSearch] = useState(filters.search ?? '');
    const { confirm, dialog } = useConfirm();

    const applyFilter = (params: object) => {
        router.get('/classrooms', { search, ...params }, { preserveState: true, replace: true });
    };

    const columns = [
        col.accessor('name', { header: 'Nama Kelas' }),
        col.accessor('grade_level', { header: 'Tingkat' }),
        col.accessor('academic_year', { header: 'Tahun Ajaran' }),
        col.accessor(r => r.homeroom_teacher?.name ?? '-', { id: 'homeroom_teacher', header: 'Wali Kelas' }),
        col.accessor('students_count', { header: 'Jumlah Santri' }),
        col.display({
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const c = row.original;
                return (
                    <div className="flex gap-2">
                        {['super_admin', 'wali_kelas'].includes(active ?? '') && (
                            <Link
                                href={`/classrooms/${c.id}/edit`}
                                className="text-indigo-600 hover:underline text-xs"
                            >
                                Edit
                            </Link>
                        )}
                        {active === 'super_admin' && (
                            <button
                                className="text-red-500 hover:underline text-xs"
                                onClick={() => {
                                    confirm({
                                        title: 'Hapus kelas?',
                                        message: `Kelas "${c.name}" akan dihapus. Tindakan ini tidak bisa dibatalkan.`,
                                        tone: 'danger',
                                        confirmLabel: 'Hapus',
                                        onConfirm: (done) => {
                                            router.delete(`/classrooms/${c.id}`, { onFinish: done });
                                        },
                                    });
                                }}
                            >
                                Hapus
                            </button>
                        )}
                    </div>
                );
            },
        }),
    ];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Data Kelas</h2>}>
            {dialog}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                    <input
                        type="search"
                        placeholder="Cari nama kelas..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilter({ search })}
                        className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 w-56"
                    />
                    {active === 'super_admin' && (
                        <Link
                            href="/classrooms/create"
                            className="ml-auto rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                        >
                            + Tambah Kelas
                        </Link>
                    )}
                </div>
                <DataTable
                    data={classrooms.data}
                    columns={columns}
                    meta={classrooms.meta}
                    onPrev={() => applyFilter({ page: classrooms.meta.current_page - 1 })}
                    onNext={() => applyFilter({ page: classrooms.meta.current_page + 1 })}
                />
            </div>
        </AuthenticatedLayout>
    );
}
