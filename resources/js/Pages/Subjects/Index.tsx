import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CrudModal from '@/Components/CrudModal';
import PageHero from '@/Components/PageHero';
import Pagination from '@/Components/Pagination';
import StatCard from '@/Components/StatCard';
import { FormField, TextField } from '@/Components/FormField';
import { useConfirm } from '@/hooks/useConfirm';
import { useActiveRole } from '@/hooks/useActiveRole';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { useDebounce, useDebounceEffect } from '@/hooks/useDebounce';
import { z } from 'zod';
import type { PageProps } from '@/types';

const schema = z.object({
    code:         z.string().min(1, 'Kode wajib diisi').max(20),
    name:         z.string().min(1, 'Nama mapel wajib diisi').max(150),
    category:     z.string().min(1, 'Kategori wajib diisi').max(100),
    credit_hours: z.number().int('Harus bilangan bulat').min(1, 'Minimal 1').max(8, 'Maksimal 8'),
});

interface Teacher   { id: number; name: string; }
interface Classroom { id: number; name: string; grade_level: string; }

interface Subject {
    id: number;
    code: string;
    name: string;
    category: string;
    credit_hours: number;
    teachers: Teacher[];
    classrooms: Classroom[];
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
    subjects:   Paginated;
    teachers:   Teacher[];
    classrooms: Classroom[];
    filters:    { search?: string };
    canManage:  boolean;
}

// ─── Subject form ────────────────────────────────────────────────────────────
function SubjectForm({ subject, onClose }: { subject?: Subject; onClose: () => void }) {
    const isEdit = !!subject;
    const { data, setData, post, put, processing, errors } = useForm({
        code:         subject?.code ?? '',
        name:         subject?.name ?? '',
        category:     subject?.category ?? '',
        credit_hours: subject?.credit_hours ?? 1,
    });
    const [zodErrors, setZodErrors] = useState<Record<string, string>>({});

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const result = schema.safeParse({ ...data, credit_hours: Number(data.credit_hours) });
        if (!result.success) {
            const errs: Record<string, string> = {};
            result.error.issues.forEach((i) => { if (i.path[0]) errs[String(i.path[0])] = i.message; });
            setZodErrors(errs);
            return;
        }
        setZodErrors({});
        if (isEdit) put(`/subjects/${subject!.id}`, { onSuccess: onClose });
        else        post('/subjects', { onSuccess: onClose });
    };

    const err = (f: string) => zodErrors[f] ?? errors[f as keyof typeof errors];

    return (
        <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                    <FormField label="Kode" htmlFor="code" error={err('code')}>
                        <TextField id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} placeholder="MAT-101" />
                    </FormField>
                </div>
                <div className="col-span-2">
                    <FormField label="Nama Mata Pelajaran" htmlFor="name" error={err('name')}>
                        <TextField id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Contoh: Fiqih Ibadah" />
                    </FormField>
                </div>
            </div>
            <FormField label="Kategori" htmlFor="category" error={err('category')}>
                <TextField id="category" value={data.category} onChange={(e) => setData('category', e.target.value)} placeholder="Contoh: Pendidikan Agama" />
            </FormField>
            <FormField label="Jam Pelajaran (SKS)" htmlFor="credit_hours" error={err('credit_hours')} hint="Antara 1 sampai 8 jam">
                <TextField id="credit_hours" type="number" min={1} max={8} value={data.credit_hours} onChange={(e) => setData('credit_hours', Number(e.target.value))} className="w-32" />
            </FormField>
            <div className="flex items-center justify-end gap-3 border-t border-outline-variant pt-5">
                <button type="button" onClick={onClose} className="rounded-lg border border-outline-variant px-5 py-2.5 text-button text-on-surface-variant transition-colors hover:bg-surface-container-high">Batal</button>
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-button font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-60">
                    {processing && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                    {processing ? 'Menyimpan...' : 'Simpan'}
                </button>
            </div>
        </form>
    );
}

// ─── Assign teachers form ─────────────────────────────────────────────────────
function AssignTeachersForm({
    subject,
    allTeachers,
    onClose,
}: {
    subject: Subject;
    allTeachers: Teacher[];
    onClose: () => void;
}) {
    const { data, setData, put, processing } = useForm({
        teacher_ids: subject.teachers.map((t) => t.id),
    });

    const toggle = (id: number) => {
        setData('teacher_ids',
            data.teacher_ids.includes(id)
                ? data.teacher_ids.filter((x) => x !== id)
                : [...data.teacher_ids, id],
        );
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/subjects/${subject.id}/teachers`, { onSuccess: onClose });
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <p className="text-sm text-on-surface-variant">
                Pilih guru yang mengajar <span className="font-semibold text-on-surface">{subject.name}</span>
            </p>

            <div className="max-h-64 overflow-y-auto rounded-xl border border-outline-variant">
                {allTeachers.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-on-surface-variant">Belum ada guru mapel terdaftar.</p>
                ) : (
                    allTeachers.map((t) => (
                        <label key={t.id} className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-container-low border-b border-outline-variant/30 last:border-0">
                            <input
                                type="checkbox"
                                checked={data.teacher_ids.includes(t.id)}
                                onChange={() => toggle(t.id)}
                                className="h-4 w-4 rounded accent-primary"
                            />
                            <span className="text-sm text-on-surface">{t.name}</span>
                        </label>
                    ))
                )}
            </div>

            <p className="text-xs text-on-surface-variant">
                {data.teacher_ids.length} guru dipilih
            </p>

            <div className="flex items-center justify-end gap-3 border-t border-outline-variant pt-4">
                <button type="button" onClick={onClose} className="rounded-lg border border-outline-variant px-5 py-2.5 text-button text-on-surface-variant transition-colors hover:bg-surface-container-high">Batal</button>
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-button font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-60">
                    {processing && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                    {processing ? 'Menyimpan...' : 'Simpan'}
                </button>
            </div>
        </form>
    );
}

// ─── Assign classrooms form ───────────────────────────────────────────────────
function AssignClassroomsForm({
    subject,
    allClassrooms,
    onClose,
}: {
    subject: Subject;
    allClassrooms: Classroom[];
    onClose: () => void;
}) {
    const { data, setData, put, processing } = useForm({
        classroom_ids: subject.classrooms.map((c) => c.id),
    });

    const toggle = (id: number) => {
        setData('classroom_ids',
            data.classroom_ids.includes(id)
                ? data.classroom_ids.filter((x) => x !== id)
                : [...data.classroom_ids, id],
        );
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/subjects/${subject.id}/classrooms`, { onSuccess: onClose });
    };

    const grouped = allClassrooms.reduce<Record<string, Classroom[]>>((acc, c) => {
        (acc[c.grade_level] ??= []).push(c);
        return acc;
    }, {});

    return (
        <form onSubmit={submit} className="space-y-4">
            <p className="text-sm text-on-surface-variant">
                Pilih kelas yang mempelajari <span className="font-semibold text-on-surface">{subject.name}</span>
            </p>

            <div className="max-h-64 overflow-y-auto rounded-xl border border-outline-variant divide-y divide-outline-variant/30">
                {allClassrooms.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-on-surface-variant">Belum ada kelas terdaftar.</p>
                ) : Object.entries(grouped).map(([grade, classes]) => (
                    <div key={grade}>
                        <p className="bg-surface-container-low px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                            Tingkat {grade}
                        </p>
                        {classes.map((c) => (
                            <label key={c.id} className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-container-low">
                                <input
                                    type="checkbox"
                                    checked={data.classroom_ids.includes(c.id)}
                                    onChange={() => toggle(c.id)}
                                    className="h-4 w-4 rounded accent-primary"
                                />
                                <span className="text-sm text-on-surface">{c.name}</span>
                            </label>
                        ))}
                    </div>
                ))}
            </div>

            <p className="text-xs text-on-surface-variant">{data.classroom_ids.length} kelas dipilih</p>

            <div className="flex items-center justify-end gap-3 border-t border-outline-variant pt-4">
                <button type="button" onClick={onClose} className="rounded-lg border border-outline-variant px-5 py-2.5 text-button text-on-surface-variant transition-colors hover:bg-surface-container-high">Batal</button>
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-button font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-60">
                    {processing && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                    {processing ? 'Menyimpan...' : 'Simpan'}
                </button>
            </div>
        </form>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function SubjectsIndex() {
    const { subjects, teachers, classrooms, filters, canManage } = usePage<Props>().props;
    const { active } = useActiveRole();
    const [search, setSearch]           = useState(filters.search ?? '');
    const debouncedSearch               = useDebounce(search);
    const { confirm, dialog }           = useConfirm();

    const [modalOpen, setModalOpen]               = useState(false);
    const [editItem, setEditItem]                 = useState<Subject | undefined>(undefined);
    const [assignItem, setAssignItem]             = useState<Subject | undefined>(undefined);
    const [assignModalOpen, setAssignModal]       = useState(false);
    const [classroomItem, setClassroomItem]       = useState<Subject | undefined>(undefined);
    const [classroomModalOpen, setClassroomModal] = useState(false);

    const isAdmin = canManage;

    const applyFilter = (params: object) => {
        router.get('/subjects', { search, ...params }, { preserveState: true, replace: true });
    };

    useDebounceEffect(debouncedSearch, () => applyFilter({ search: debouncedSearch }));

    const openCreate       = () => { setEditItem(undefined); setModalOpen(true); };
    const openEdit         = (s: Subject) => { setEditItem(s); setModalOpen(true); };
    const openAssign       = (s: Subject) => { setAssignItem(s); setAssignModal(true); };
    const openClassrooms   = (s: Subject) => { setClassroomItem(s); setClassroomModal(true); };
    const closeModal       = () => setModalOpen(false);
    const closeAssign      = () => setAssignModal(false);
    const closeClassrooms  = () => setClassroomModal(false);

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
    const totalSks   = subjects.data.reduce((sum, s) => sum + s.credit_hours, 0);

    return (
        <AuthenticatedLayout header="Mata Pelajaran">
            <Head title="Mata Pelajaran" />
            {dialog}

            <CrudModal show={modalOpen} title={editItem ? `Edit ${editItem.name}` : 'Tambah Mata Pelajaran'} onClose={closeModal}>
                <SubjectForm key={editItem?.id ?? 'create'} subject={editItem} onClose={closeModal} />
            </CrudModal>

            <CrudModal show={assignModalOpen} title="Assign Pengajar" onClose={closeAssign}>
                {assignItem && (
                    <AssignTeachersForm
                        key={assignItem.id}
                        subject={assignItem}
                        allTeachers={teachers}
                        onClose={closeAssign}
                    />
                )}
            </CrudModal>

            <CrudModal show={classroomModalOpen} title="Assign Kelas" onClose={closeClassrooms}>
                {classroomItem && (
                    <AssignClassroomsForm
                        key={classroomItem.id}
                        subject={classroomItem}
                        allClassrooms={classrooms}
                        onClose={closeClassrooms}
                    />
                )}
            </CrudModal>

            <PageHero icon="auto_stories" title="Kurikulum" subtitle="Kelola mata pelajaran dan assign guru pengajar." />

            {/* Stats */}
            <section className="mb-section-margin grid grid-cols-1 gap-card-gap md:grid-cols-3">
                <StatCard label="Total Mata Pelajaran" value={subjects.total} icon="auto_stories" inverse />
                <StatCard label="Kategori"             value={categories.size}     icon="category"     tone="secondary" />
                <StatCard label="Total SKS (Halaman)"  value={totalSks}            icon="schedule"     tone="tertiary" />
            </section>

            {/* Table */}
            <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
                <div className="flex flex-col items-stretch justify-between gap-4 border-b border-outline-variant p-6 md:flex-row md:items-center">
                    <div className="flex items-center gap-3">
                        {isAdmin && (
                            <button type="button" onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-button font-semibold text-on-primary shadow-sm transition-all hover:brightness-110">
                                <span className="material-symbols-outlined">add</span>
                                Tambah Pelajaran
                            </button>
                        )}
                        <p className="text-body-sm text-on-surface-variant">
                            Total <span className="font-bold text-on-surface">{subjects.total}</span> entri
                        </p>
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                        <input type="search" placeholder="Cari kode / nama mapel..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2.5 pl-10 pr-4 text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20 md:w-72" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface-container-low text-on-surface-variant">
                            <tr>
                                <th className="px-6 py-4 text-label-caps">Kode</th>
                                <th className="px-6 py-4 text-label-caps">Mata Pelajaran</th>
                                <th className="px-6 py-4 text-label-caps">Kategori</th>
                                <th className="px-6 py-4 text-label-caps">SKS</th>
                                <th className="px-6 py-4 text-label-caps">Kelas</th>
                                <th className="px-6 py-4 text-label-caps">Pengajar</th>
                                {isAdmin && <th className="px-6 py-4 text-right text-label-caps">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                            {subjects.data.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 7 : 6} className="px-6 py-16 text-center">
                                        <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">inbox</span>
                                        <p className="mt-2 text-body-sm text-on-surface-variant">Tidak ada mata pelajaran.</p>
                                    </td>
                                </tr>
                            ) : subjects.data.map((s) => (
                                <tr key={s.id} className="transition-colors hover:bg-surface-container/50">
                                    <td className="px-6 py-5">
                                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{s.code}</span>
                                    </td>
                                    <td className="px-6 py-5 text-body-base font-semibold text-on-surface">{s.name}</td>
                                    <td className="px-6 py-5 text-body-sm text-on-surface-variant">{s.category}</td>
                                    <td className="px-6 py-5 text-body-sm text-on-surface-variant">{s.credit_hours} jam</td>
                                    <td className="px-6 py-5">
                                        {s.classrooms.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {s.classrooms.map((c) => (
                                                    <span key={c.id} className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary">
                                                        {c.name}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs italic text-on-surface-variant/50">Belum diassign</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        {s.teachers.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {s.teachers.map((t) => (
                                                    <span key={t.id} className="rounded-full bg-tertiary/10 px-2.5 py-0.5 text-xs font-medium text-tertiary">
                                                        {t.name}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-on-surface-variant/50 italic">Belum diassign</span>
                                        )}
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button type="button" onClick={() => openClassrooms(s)}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-outline transition-all hover:bg-tertiary/5 hover:text-tertiary"
                                                    aria-label="Assign kelas" title="Assign Kelas">
                                                    <span className="material-symbols-outlined text-[20px]">meeting_room</span>
                                                </button>
                                                <button type="button" onClick={() => openAssign(s)}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-outline transition-all hover:bg-secondary/5 hover:text-secondary"
                                                    aria-label="Assign guru" title="Assign Pengajar">
                                                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                                                </button>
                                                <button type="button" onClick={() => openEdit(s)}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-outline transition-all hover:bg-primary/5 hover:text-primary"
                                                    aria-label="Edit">
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button type="button" onClick={() => handleDelete(s)}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-outline transition-all hover:bg-error/5 hover:text-error"
                                                    aria-label="Hapus">
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {subjects.last_page > 1 && (
                    <Pagination meta={subjects} onPage={(page) => applyFilter({ page })} label="mapel" />
                )}
            </section>
        </AuthenticatedLayout>
    );
}
