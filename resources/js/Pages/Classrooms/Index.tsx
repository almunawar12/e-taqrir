import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CrudModal from '@/Components/CrudModal';
import PageHero from '@/Components/PageHero';
import Pagination from '@/Components/Pagination';
import StatCard from '@/Components/StatCard';
import { FormField, TextField } from '@/Components/FormField';
import { Select } from '@/Components/Select';
import { useConfirm } from '@/hooks/useConfirm';
import { useActiveRole } from '@/hooks/useActiveRole';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { useDebounce, useDebounceEffect } from '@/hooks/useDebounce';
import { z } from 'zod';
import type { PageProps } from '@/types';

const schema = z.object({
    name:                z.string().min(1, 'Nama kelas wajib diisi').max(100),
    grade_level:         z.string().min(1, 'Tingkat wajib diisi').max(50),
    academic_year:       z.string().regex(/^\d{4}\/\d{4}$/, 'Format: YYYY/YYYY (contoh: 2024/2025)'),
    homeroom_teacher_id: z.string().optional(),
});

interface Teacher { id: number; name: string }

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
    teachers: Teacher[];
    filters: { search?: string };
}

const GRADE_TONE: Record<string, string> = {
    VII:  'bg-primary-fixed text-on-primary-fixed-variant',
    VIII: 'bg-secondary-fixed text-on-secondary-fixed-variant',
    IX:   'bg-tertiary-fixed text-on-tertiary-fixed-variant',
};

// ─── Form inside modal ──────────────────────────────────────────────────────
function ClassroomForm({
    classroom,
    teachers,
    onClose,
}: {
    classroom?: Classroom;
    teachers: Teacher[];
    onClose: () => void;
}) {
    const isEdit = !!classroom;

    const { data, setData, post, put, processing, errors } = useForm({
        name:                classroom?.name ?? '',
        grade_level:         classroom?.grade_level ?? '',
        academic_year:       classroom?.academic_year ?? '',
        homeroom_teacher_id: classroom?.homeroom_teacher?.id ? String(classroom.homeroom_teacher.id) : '',
    });

    const [zodErrors, setZodErrors] = useState<Record<string, string>>({});

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const result = schema.safeParse(data);
        if (!result.success) {
            const errs: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                if (issue.path[0]) errs[String(issue.path[0])] = issue.message;
            });
            setZodErrors(errs);
            return;
        }
        setZodErrors({});
        if (isEdit) {
            put(`/classrooms/${classroom!.id}`, { onSuccess: onClose });
        } else {
            post('/classrooms', { onSuccess: onClose });
        }
    };

    const err = (field: string) => zodErrors[field] ?? errors[field as keyof typeof errors];

    return (
        <form onSubmit={submit} className="space-y-5">
            <FormField label="Nama Kelas" htmlFor="name" error={err('name')}>
                <TextField
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Contoh: Umar Bin Khattab A"
                />
            </FormField>

            <FormField label="Tingkat" htmlFor="grade_level" error={err('grade_level')}>
                <TextField
                    id="grade_level"
                    value={data.grade_level}
                    onChange={(e) => setData('grade_level', e.target.value)}
                    placeholder="Contoh: VII, VIII, IX"
                />
            </FormField>

            <FormField label="Tahun Ajaran" htmlFor="academic_year" error={err('academic_year')} hint="Format: 2024/2025">
                <TextField
                    id="academic_year"
                    value={data.academic_year}
                    onChange={(e) => setData('academic_year', e.target.value)}
                    placeholder="2024/2025"
                />
            </FormField>

            <FormField label="Wali Kelas" htmlFor="homeroom_teacher_id" error={err('homeroom_teacher_id')}>
                <Select
                    id="homeroom_teacher_id"
                    value={data.homeroom_teacher_id}
                    onChange={(val) => setData('homeroom_teacher_id', val)}
                    placeholder="— Belum ditentukan —"
                    searchable
                    options={teachers.map((t) => ({ value: String(t.id), label: t.name }))}
                />
            </FormField>

            <div className="flex items-center justify-end gap-3 border-t border-outline-variant pt-5">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-outline-variant px-5 py-2.5 text-button text-on-surface-variant transition-colors hover:bg-surface-container-high"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={processing}
                    className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-button font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-60"
                >
                    {processing && (
                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    )}
                    {processing ? 'Menyimpan...' : 'Simpan'}
                </button>
            </div>
        </form>
    );
}

// ─── Card ────────────────────────────────────────────────────────────────────
function ClassroomCard({
    classroom,
    canEdit,
    canDelete,
    onEdit,
    onDelete,
}: {
    classroom: Classroom;
    canEdit: boolean;
    canDelete: boolean;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const tone = GRADE_TONE[classroom.grade_level] ?? 'bg-surface-container-high text-on-surface-variant';
    const cap   = 30;
    const ratio = classroom.students_count / cap;
    const status = ratio >= 1
        ? { label: '(PENUH)',        color: 'text-error' }
        : ratio >= 0.85
        ? { label: '(Hampir penuh)', color: 'text-primary' }
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
                <Link
                    href={`/classrooms/${classroom.id}`}
                    className="flex items-center gap-1.5 text-label-caps text-on-surface-variant transition-colors hover:text-primary"
                >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    Detail
                </Link>
                <div className="flex items-center gap-1">
                    {canEdit && (
                        <button
                            type="button"
                            onClick={onEdit}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-all hover:bg-primary/10 hover:text-primary"
                            aria-label="Edit"
                        >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
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

function AddClassroomCard({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
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
        </button>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ClassroomsIndex() {
    const { classrooms, teachers, filters } = usePage<Props>().props;
    const { active } = useActiveRole();
    const [search, setSearch] = useState(filters.search ?? '');
    const debouncedSearch     = useDebounce(search);
    const { confirm, dialog } = useConfirm();

    const [modalOpen, setModalOpen]   = useState(false);
    const [editItem, setEditItem]     = useState<Classroom | undefined>(undefined);

    const canCreate = active === 'super_admin';
    const canEdit   = active === 'super_admin';
    const canDelete = active === 'super_admin';

    const applyFilter = (params: object) => {
        router.get('/classrooms', { search, ...params }, { preserveState: true, replace: true });
    };

    useDebounceEffect(debouncedSearch, () => applyFilter({ search: debouncedSearch }));

    const openCreate = () => { setEditItem(undefined); setModalOpen(true); };
    const openEdit   = (c: Classroom) => { setEditItem(c); setModalOpen(true); };
    const closeModal = () => setModalOpen(false);

    const handleDelete = (c: Classroom) => {
        confirm({
            title: 'Hapus kelas?',
            message: `Kelas "${c.name}" akan dihapus. Tindakan ini tidak bisa dibatalkan.`,
            tone: 'danger',
            confirmLabel: 'Hapus',
            onConfirm: (done) =>
                router.delete(`/classrooms/${c.id}`, { onFinish: done }),
        });
    };

    const totalStudents = classrooms.data.reduce((sum, c) => sum + c.students_count, 0);
    const teacherSet    = new Set(classrooms.data.map((c) => c.homeroom_teacher?.id).filter(Boolean));

    return (
        <AuthenticatedLayout header="Manajemen Kelas">
            <Head title="Kelas" />
            {dialog}

            <CrudModal
                show={modalOpen}
                title={editItem ? `Edit ${editItem.name}` : 'Tambah Kelas Baru'}
                onClose={closeModal}
            >
                <ClassroomForm
                    key={editItem?.id ?? 'create'}
                    classroom={editItem}
                    teachers={teachers}
                    onClose={closeModal}
                />
            </CrudModal>

            <PageHero
                icon="school"
                title="Struktur Kelas"
                subtitle="Kelola daftar kelas, wali kelas, dan pantau kapasitas santri secara real-time."
            />

            {/* Stats */}
            <section className="mb-section-margin grid grid-cols-1 gap-card-gap md:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Kelas"  value={classrooms.total}  icon="meeting_room"       tone="secondary" />
                <StatCard label="Total Santri" value={totalStudents}      icon="person"             tone="primary"  badge={`Avg ${Math.round(totalStudents / Math.max(classrooms.data.length, 1))}/kelas`} />
                <StatCard label="Wali Kelas"   value={teacherSet.size}    icon="supervisor_account" tone="tertiary" />
                <StatCard label="Tahun Ajaran" value={classrooms.data[0]?.academic_year ?? '—'} icon="calendar_today" tone="neutral" />
            </section>

            {/* Toolbar */}
            <div className="mb-6 flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-2">
                    {canCreate && (
                        <button
                            type="button"
                            onClick={openCreate}
                            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-button font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            Tambah Kelas
                        </button>
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
                        onEdit={() => openEdit(c)}
                        onDelete={() => handleDelete(c)}
                    />
                ))}
                {canCreate && classrooms.current_page === classrooms.last_page && (
                    <AddClassroomCard onClick={openCreate} />
                )}
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
