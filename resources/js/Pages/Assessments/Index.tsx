import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHero from '@/Components/PageHero';
import Pagination from '@/Components/Pagination';
import StatCard from '@/Components/StatCard';
import { useActiveRole } from '@/hooks/useActiveRole';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps } from '@/types';

const STATE_LABELS: Record<string, string> = {
    draft:     'Draft',
    submitted: 'Diajukan',
    verified:  'Terverifikasi',
    rejected:  'Ditolak',
    published: 'Dipublikasi',
};

const STATE_BADGE: Record<string, string> = {
    draft:     'bg-surface-container-high text-on-surface-variant',
    submitted: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    verified:  'bg-secondary-container text-on-secondary-container',
    rejected:  'bg-error-container text-on-error-container',
    published: 'bg-primary/10 text-primary',
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
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from: number | null;
    to: number | null;
}

interface Props extends PageProps {
    assessments: Paginated;
    filters: { state?: string; academic_year?: string; semester?: string };
}

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

    const counts = assessments.data.reduce<Record<string, number>>((acc, a) => {
        acc[a.state] = (acc[a.state] ?? 0) + 1;
        return acc;
    }, {});

    return (
        <AuthenticatedLayout header="Penilaian">
            <Head title="Penilaian" />

            <PageHero
                icon="assessment"
                title="Penilaian Akademik"
                subtitle="Kelola progres santri, lacak milestone kurikulum, dan publikasikan hasil penilaian."
                action={
                    active === 'guru_mapel' && (
                        <Link
                            href="/assessments/create"
                            className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-5 py-2.5 text-button font-semibold text-on-primary backdrop-blur-sm transition-all hover:bg-white/25"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Buat Penilaian
                        </Link>
                    )
                }
            />

            {/* Stats */}
            <section className="mb-section-margin grid grid-cols-2 gap-card-gap lg:grid-cols-4">
                <StatCard label="Total Halaman ini" value={assessments.data.length}        icon="assignment_turned_in" tone="primary" />
                <StatCard label="Diajukan"          value={counts.submitted ?? 0}          icon="hourglass_top"        tone="tertiary" />
                <StatCard label="Terverifikasi"     value={counts.verified ?? 0}           icon="verified"             tone="secondary" />
                <StatCard label="Dipublikasi"       value={counts.published ?? 0}          icon="publish"              inverse />
            </section>

            <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
                <div className="flex flex-col items-stretch justify-between gap-4 border-b border-outline-variant p-6 md:flex-row md:items-center">
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-headline-md text-on-surface">Daftar Penilaian</h3>
                        <select
                            value={state}
                            onChange={(e) => { setState(e.target.value); applyFilter({ state: e.target.value }); }}
                            className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1.5 text-body-sm text-on-surface-variant transition-colors hover:border-primary"
                        >
                            <option value="">Semua status</option>
                            {Object.entries(STATE_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Tahun ajaran"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilter({ academic_year: year })}
                            className="w-40 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1.5 text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <select
                            value={semester}
                            onChange={(e) => { setSemester(e.target.value); applyFilter({ semester: e.target.value }); }}
                            className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1.5 text-body-sm text-on-surface-variant transition-colors hover:border-primary"
                        >
                            <option value="">Semua semester</option>
                            <option value="1">Semester 1</option>
                            <option value="2">Semester 2</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-outline-variant bg-surface-container-low">
                            <tr>
                                <th className="px-6 py-4 text-label-caps text-on-surface-variant">Kelas</th>
                                <th className="px-6 py-4 text-label-caps text-on-surface-variant">Mata Pelajaran</th>
                                <th className="px-6 py-4 text-label-caps text-on-surface-variant">Periode</th>
                                <th className="px-6 py-4 text-label-caps text-on-surface-variant">Guru</th>
                                <th className="px-6 py-4 text-label-caps text-on-surface-variant">Santri</th>
                                <th className="px-6 py-4 text-label-caps text-on-surface-variant">Status</th>
                                <th className="px-6 py-4 text-right text-label-caps text-on-surface-variant">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                            {assessments.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">
                                            inbox
                                        </span>
                                        <p className="mt-2 text-body-sm text-on-surface-variant">
                                            Tidak ada penilaian ditemukan.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                assessments.data.map((a) => (
                                    <tr key={a.id} className="transition-colors hover:bg-surface-container-lowest">
                                        <td className="px-6 py-4 text-body-base font-semibold text-on-surface">
                                            {a.classroom.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                                                    {a.subject.code}
                                                </span>
                                                <span className="text-body-base text-on-surface">{a.subject.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-body-sm text-on-surface-variant">
                                            {a.academic_year} · Sem {a.semester}
                                        </td>
                                        <td className="px-6 py-4 text-body-sm text-on-surface-variant">
                                            {a.teacher.name}
                                        </td>
                                        <td className="px-6 py-4 text-body-sm text-on-surface-variant">
                                            {a.items_count} siswa
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-label-caps ${STATE_BADGE[a.state] ?? ''}`}>
                                                {STATE_LABELS[a.state] ?? a.state}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Link
                                                    href={`/assessments/${a.id}`}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-outline transition-all hover:bg-primary/5 hover:text-primary"
                                                    aria-label="Detail"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                </Link>
                                                {(a.state === 'draft' || a.state === 'rejected') && active === 'guru_mapel' && (
                                                    <Link
                                                        href={`/assessments/${a.id}/edit`}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-outline transition-all hover:bg-tertiary/10 hover:text-tertiary"
                                                        aria-label="Edit"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">edit_square</span>
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {assessments.last_page > 1 && (
                    <Pagination
                        meta={assessments}
                        onPage={(page) => applyFilter({ page })}
                        label="penilaian"
                    />
                )}
            </section>
        </AuthenticatedLayout>
    );
}
