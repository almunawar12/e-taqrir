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
}

interface Student {
    id: number;
    nis: string;
    name: string;
    gender: 'L' | 'P';
    birth_date: string | null;
    wali_phone: string | null;
    classroom: Classroom | null;
}

interface PaginatedStudents {
    data: Student[];
    meta: { current_page: number; last_page: number; total: number; per_page: number };
}

interface Props extends PageProps {
    students: PaginatedStudents;
    classrooms: Classroom[];
    filters: { search?: string; classroom_id?: string };
}

const col = createColumnHelper<Student>();

export default function StudentsIndex() {
    const { students, classrooms, filters } = usePage<Props>().props;
    const { active } = useActiveRole();
    const [search, setSearch] = useState(filters.search ?? '');
    const [classroomId, setClassroomId] = useState(filters.classroom_id ?? '');
    const { confirm, dialog } = useConfirm();

    const applyFilter = (params: object) => {
        router.get('/students', { search, classroom_id: classroomId, ...params }, { preserveState: true, replace: true });
    };

    const columns = [
        col.accessor('nis', { header: 'NIS' }),
        col.accessor('name', { header: 'Nama' }),
        col.accessor('gender', {
            header: 'L/P',
            cell: i => (i.getValue() === 'L' ? 'Laki-laki' : 'Perempuan'),
        }),
        col.accessor(r => r.classroom?.name ?? '-', { id: 'classroom', header: 'Kelas' }),
        col.accessor('wali_phone', { header: 'No. Wali', cell: i => i.getValue() ?? '-' }),
        col.display({
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const s = row.original;
                return (
                    <div className="flex gap-2">
                        {['super_admin', 'wali_kelas'].includes(active ?? '') && (
                            <Link
                                href={`/students/${s.id}/edit`}
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
                                        title: 'Hapus santri?',
                                        message: `Data "${s.name}" akan dihapus.`,
                                        tone: 'danger',
                                        confirmLabel: 'Hapus',
                                        onConfirm: (done) => {
                                            router.delete(`/students/${s.id}`, { onFinish: done });
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
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Data Santri</h2>}>
            {dialog}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                    <input
                        type="search"
                        placeholder="Cari NIS / nama..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilter({ search })}
                        className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 w-56"
                    />
                    <select
                        value={classroomId}
                        onChange={e => {
                            setClassroomId(e.target.value);
                            applyFilter({ classroom_id: e.target.value });
                        }}
                        className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="">-- Semua Kelas --</option>
                        {classrooms.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    {['super_admin', 'wali_kelas'].includes(active ?? '') && (
                        <Link
                            href="/students/create"
                            className="ml-auto rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                        >
                            + Tambah Santri
                        </Link>
                    )}
                </div>
                <DataTable
                    data={students.data}
                    columns={columns}
                    meta={students.meta}
                    onPrev={() => applyFilter({ page: students.meta.current_page - 1 })}
                    onNext={() => applyFilter({ page: students.meta.current_page + 1 })}
                />
            </div>
        </AuthenticatedLayout>
    );
}
