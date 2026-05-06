import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTable from '@/Components/DataTable';
import { useActiveRole } from '@/hooks/useActiveRole';
import { Link, router, usePage } from '@inertiajs/react';
import { createColumnHelper } from '@tanstack/react-table';
import { useState } from 'react';
import type { PageProps } from '@/types';

const STATE_LABELS: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Diajukan',
    verified: 'Terverifikasi',
    rejected: 'Ditolak',
    published: 'Dipublikasi',
};

const STATE_COLORS: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    submitted: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-700',
    published: 'bg-green-100 text-green-800',
};

interface Assessment {
    id: number;
    academic_year: string;
    semester: number;
    state: string;
    classroom: { id: number; name: string };
    subject: { id: number; name: string; code: string };
    teacher: { id: number; name: string };
    items_count: number;
    updated_at: string;
}

interface Paginated {
    data: Assessment[];
    meta: { current_page: number; last_page: number; total: number; per_page: number };
}

interface Props extends PageProps {
    assessments: Paginated;
    filters: { state?: string; academic_year?: string; semester?: string };
}

const col = createColumnHelper<Assessment>();

export default function AssessmentsIndex() {
    const { assessments, filters } = usePage<Props>().props;
    const { active } = useActiveRole();

    const [state, setState] = useState(filters.state ?? '');
    const [year, setYear] = useState(filters.academic_year ?? '');
    const [semester, setSemester] = useState(filters.semester ?? '');

    const applyFilter = (params: object) => {
        router.get('/assessments', { state, academic_year: year, semester, ...params }, {
            preserveState: true,
            replace: true,
        });
    };

    const columns = [
        col.accessor('classroom', {
            header: 'Kelas',
            cell: i => i.getValue().name,
        }),
        col.accessor('subject', {
            header: 'Mata Pelajaran',
            cell: i => `[${i.getValue().code}] ${i.getValue().name}`,
        }),
        col.accessor('academic_year', { header: 'Tahun Ajaran' }),
        col.accessor('semester', { header: 'Semester', cell: i => `Semester ${i.getValue()}` }),
        col.accessor('teacher', {
            header: 'Guru',
            cell: i => i.getValue().name,
        }),
        col.accessor('items_count', { header: 'Santri', cell: i => `${i.getValue()} siswa` }),
        col.accessor('state', {
            header: 'Status',
            cell: i => (
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATE_COLORS[i.getValue()] ?? ''}`}>
                    {STATE_LABELS[i.getValue()] ?? i.getValue()}
                </span>
            ),
        }),
        col.display({
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const a = row.original;
                return (
                    <div className="flex gap-2">
                        <Link href={`/assessments/${a.id}`} className="text-indigo-600 hover:underline text-xs">
                            Detail
                        </Link>
                        {(a.state === 'draft' || a.state === 'rejected') && active === 'guru_mapel' && (
                            <Link href={`/assessments/${a.id}/edit`} className="text-amber-600 hover:underline text-xs">
                                Edit
                            </Link>
                        )}
                    </div>
                );
            },
        }),
    ];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Penilaian</h2>}>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={state}
                        onChange={e => { setState(e.target.value); applyFilter({ state: e.target.value }); }}
                        className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="">-- Semua Status --</option>
                        {Object.entries(STATE_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Tahun Ajaran (mis. 2024/2025)"
                        value={year}
                        onChange={e => setYear(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilter({ academic_year: year })}
                        className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 w-52"
                    />

                    <select
                        value={semester}
                        onChange={e => { setSemester(e.target.value); applyFilter({ semester: e.target.value }); }}
                        className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="">-- Semua Semester --</option>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                    </select>

                    {active === 'guru_mapel' && (
                        <Link
                            href="/assessments/create"
                            className="ml-auto rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                        >
                            + Buat Penilaian
                        </Link>
                    )}
                </div>

                <DataTable
                    data={assessments.data}
                    columns={columns}
                    meta={assessments.meta}
                    onPrev={() => applyFilter({ page: assessments.meta.current_page - 1 })}
                    onNext={() => applyFilter({ page: assessments.meta.current_page + 1 })}
                />
            </div>
        </AuthenticatedLayout>
    );
}
