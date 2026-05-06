import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHero from '@/Components/PageHero';
import Pagination from '@/Components/Pagination';
import StatCard from '@/Components/StatCard';
import { useConfirm } from '@/hooks/useConfirm';
import { useActiveRole } from '@/hooks/useActiveRole';
import { Head, Link, router, usePage } from '@inertiajs/react';
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

interface Paginated {
    data: Classroom[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from: number | null;
    to: number | null;
}

interface Props extends PageProps {
    classrooms: Paginated;
    filters: { search?: string };
}

const GRADE_TONE: Record<string, string> = {
    VII:  'bg-primary-fixed text-on-primary-fixed-variant',
    VIII: 'bg-secondary-fixed text-on-secondary-fixed-variant',
    IX:   'bg-tertiary-fixed text-on-tertiary-fixed-variant',
};

function ClassroomCard({ classroom, canEdit, canDelete, onDelete }: {
    classroom: Classroom;
    canEdit: boolean;
    canDelete: boolean;
    onDelete: () => void;
}) {
    const tone = GRADE_TONE[classroom.grade_level] ?? 'bg-surface-container-high text-on-surface-variant';
    const cap  = 30;
    const ratio = classroom.students_count / cap;
    const status = ratio >= 1
        ? { label: '(PENUH)',         color: 'text-error' }
        : ratio >= 0.85
        ? { label: '(Hampir penuh)',  color: 'text-primary' }
        : null;

    return (
        <div className="group overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest transition-all duration-300 hover:shadow-lg">
            <div className="p-6">
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <span className={`mb-2 inline-block rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${tone}`}>
                            Kelas {classroom.grade_level}
                        </span>
                        <h5 className="text-headline-md text-on-surface">{classroom.name}</h5>
                        <p className="mt-1 text-body-sm text-on-surface-variant">{classroom.academic_year}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-on-surface-variant">
                        <span className="material-symbols-outlined text-secondary">person</span>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Wali Kelas</p>
                            <p className="text-body-base font-semibold text-on-surface">
                                {classroom.homeroom_teacher?.name ?? '— Belum ditentukan —'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-on-surface-variant">
                        <span className="material-symbols-outlined text-primary">group</span>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Jumlah Santri</p>
                            <p className="text-body-base font-semibold text-on-surface">
                                {classroom.students_count} / {cap}
                                {status && (
                                    <span className={`ml-2 text-[10px] font-bold ${status.color}`}>{status.label}</span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low px-6 py-4 transition-colors group-hover:bg-primary-fixed">
                <span className="text-label-caps text-on-surface-variant">ID #{classroom.id}</span>
                <div className="flex items-center gap-1">
                    {canEdit && (
                        <Link
                            href={`/classrooms/${classroom.id}/edit`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-all hover:bg-primary/10 hover:text-primary"
                            aria-label="Edit"
                        >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                        </Link>
                    )}
                    {canDelete && (
                        <button
                            type="button"
                            onClick={onDelete}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-all hover:bg-error/10 hover:text-error"
                            aria-label="Hapus"
                        >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function AddClassroomCard() {
    return (
        <Link
            href="/classrooms/create"
            className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low p-10 transition-all hover:bg-surface-container-high"
        >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface text-outline transition-all group-hover:bg-primary group-hover:text-on-primary">
                <span className="material-symbols-outlined text-[32px]">add</span>
            </div>
            <h5 className="text-body-base font-bold text-on-surface-variant transition-colors group-hover:text-primary">
                Tambah Kelas Baru
            </h5>
            <p className="mt-2 text-center text-body-sm text-on-surface-variant/70">
                Buat entitas kelas baru untuk tahun akademik.
            </p>
        </Link>
    );
}

export default function ClassroomsIndex() {
    const { classrooms, filters } = usePage<Props>().props;
    const { active } = useActiveRole();
    const [search, setSearch] = useState(filters.search ?? '');
    const { confirm, dialog } = useConfirm();

    const canCreate = active === 'super_admin';
    const canEdit   = active === 'super_admin' || active === 'wali_kelas';
    const canDelete = active === 'super_admin';

    const applyFilter = (params: object) => {
        router.get('/classrooms', { search, ...params }, { preserveState: true, replace: true });
    };

    const handleDelete = (c: Classroom) => {
        confirm({
            title: 'Hapus kelas?',
            message: `Kelas "${c.name}" akan dihapus. Tindakan ini tidak bisa dibatalkan.`,
            tone: 'danger',
            confirmLabel: 'Hapus',
            onConfirm: (done) => router.delete(`/classrooms/${c.id}`, { onFinish: done }),
        });
    };

    const totalStudents = classrooms.data.reduce((sum, c) => sum + c.students_count, 0);
    const teachers = new Set(classrooms.data.map((c) => c.homeroom_teacher?.id).filter(Boolean));

    return (
        <AuthenticatedLayout header="Manajemen Kelas">
            <Head title="Kelas" />
            {dialog}

            <PageHero
                icon="school"
                title="Struktur Kelas"
                subtitle="Kelola daftar kelas, wali kelas, dan pantau kapasitas santri secara real-time."
            />

            {/* Stats */}
            <section className="mb-section-margin grid grid-cols-1 gap-card-gap md:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Kelas"   value={classrooms.total} icon="meeting_room"        tone="secondary" />
                <StatCard label="Total Santri"  value={totalStudents}         icon="person"              tone="primary"   badge={`Avg ${Math.round(totalStudents / Math.max(classrooms.data.length, 1))}/kelas`} />
                <StatCard label="Wali Kelas"    value={teachers.size}         icon="supervisor_account"  tone="tertiary" />
                <StatCard label="Tahun Ajaran"  value={classrooms.data[0]?.academic_year ?? '—'} icon="calendar_today" tone="neutral" />
            </section>

            {/* Toolbar */}
            <div className="mb-6 flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-2">
                    {canCreate && (
                        <Link
                            href="/classrooms/create"
                            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-button font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            Tambah Kelas
                        </Link>
                    )}
                </div>
                <div className="relative">
                    <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                        search
                    </span>
                    <input
                        type="search"
                        placeholder="Cari nama kelas..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilter({ search })}
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2.5 pl-10 pr-4 text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20 md:w-72"
                    />
                </div>
            </div>

            {/* Card grid */}
            <div className="grid grid-cols-1 gap-card-gap md:grid-cols-2 xl:grid-cols-3">
                {classrooms.data.map((c) => (
                    <ClassroomCard
                        key={c.id}
                        classroom={c}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        onDelete={() => handleDelete(c)}
                    />
                ))}
                {canCreate && classrooms.current_page === classrooms.last_page && <AddClassroomCard />}
            </div>

            {/* Pagination */}
            {classrooms.last_page > 1 && (
                <div className="mt-section-margin overflow-hidden rounded-xl border border-outline-variant shadow-sm">
                    <Pagination
                        meta={classrooms}
                        onPage={(page) => applyFilter({ page })}
                        label="kelas"
                    />
                </div>
            )}
        </AuthenticatedLayout>
    );
}
