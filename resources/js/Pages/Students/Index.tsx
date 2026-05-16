import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CrudModal from '@/Components/CrudModal';
import PageHero from '@/Components/PageHero';
import Pagination from '@/Components/Pagination';
import StatCard from '@/Components/StatCard';
import { FormField, SelectField, TextArea, TextField } from '@/Components/FormField';
import { useConfirm } from '@/hooks/useConfirm';
import { useActiveRole } from '@/hooks/useActiveRole';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { toast } from '@/Components/Toast';
import { z } from 'zod';
import type { PageProps } from '@/types';

const schema = z.object({
    nis:          z.string().min(1, 'NIS wajib diisi').max(20),
    name:         z.string().min(1, 'Nama wajib diisi').max(150),
    gender:       z.enum(['L', 'P']),
    birth_date:   z.string().optional(),
    birth_place:  z.string().max(100).optional(),
    address:      z.string().max(500).optional(),
    wali_phone:   z.string().max(20).optional(),
    classroom_id: z.string().optional(),
});

interface Classroom { id: number; name: string }

interface Student {
    id: number;
    nis: string;
    name: string;
    gender: 'L' | 'P';
    birth_date: string | null;
    birth_place: string | null;
    address: string | null;
    wali_phone: string | null;
    classroom: Classroom | null;
    classroom_id: number | null;
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
    return name.split(' ').map((s) => s.charAt(0)).slice(0, 2).join('').toUpperCase();
}

// ─── Form inside modal ──────────────────────────────────────────────────────
function StudentForm({
    student,
    classrooms,
    onClose,
}: {
    student?: Student;
    classrooms: Classroom[];
    onClose: () => void;
}) {
    const isEdit = !!student;

    const { data, setData, post, put, processing, errors } = useForm({
        nis:          student?.nis ?? '',
        name:         student?.name ?? '',
        gender:       student?.gender ?? ('L' as 'L' | 'P'),
        birth_date:   student?.birth_date ?? '',
        birth_place:  student?.birth_place ?? '',
        address:      student?.address ?? '',
        wali_phone:   student?.wali_phone ?? '',
        classroom_id: student?.classroom_id ? String(student.classroom_id) : '',
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
            put(`/students/${student!.id}`, { onSuccess: onClose });
        } else {
            post('/students', { onSuccess: onClose });
        }
    };

    const err = (field: string) => zodErrors[field] ?? errors[field as keyof typeof errors];

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* Identitas */}
            <fieldset className="space-y-4">
                <legend className="text-label-caps font-semibold uppercase tracking-wider text-on-surface-variant">
                    Identitas Santri
                </legend>

                <div className="grid grid-cols-2 gap-4">
                    <FormField label="NIS" htmlFor="nis" error={err('nis')}>
                        <TextField
                            id="nis"
                            value={data.nis}
                            onChange={(e) => setData('nis', e.target.value)}
                            placeholder="2024001"
                        />
                    </FormField>
                    <FormField label="Jenis Kelamin" htmlFor="gender" error={err('gender')}>
                        <SelectField
                            id="gender"
                            value={data.gender}
                            onChange={(e) => setData('gender', e.target.value as 'L' | 'P')}
                        >
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                        </SelectField>
                    </FormField>
                </div>

                <FormField label="Nama Lengkap" htmlFor="name" error={err('name')}>
                    <TextField
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Nama lengkap santri"
                    />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Tempat Lahir" htmlFor="birth_place" error={err('birth_place')}>
                        <TextField
                            id="birth_place"
                            value={data.birth_place ?? ''}
                            onChange={(e) => setData('birth_place', e.target.value)}
                            placeholder="Jakarta"
                        />
                    </FormField>
                    <FormField label="Tanggal Lahir" htmlFor="birth_date" error={err('birth_date')}>
                        <TextField
                            id="birth_date"
                            type="date"
                            value={data.birth_date ?? ''}
                            onChange={(e) => setData('birth_date', e.target.value)}
                        />
                    </FormField>
                </div>
            </fieldset>

            {/* Akademik & kontak */}
            <fieldset className="space-y-4 border-t border-outline-variant pt-4">
                <legend className="text-label-caps font-semibold uppercase tracking-wider text-on-surface-variant">
                    Akademik &amp; Kontak
                </legend>

                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Kelas" htmlFor="classroom_id" error={err('classroom_id')}>
                        <SelectField
                            id="classroom_id"
                            value={data.classroom_id}
                            onChange={(e) => setData('classroom_id', e.target.value)}
                        >
                            <option value="">— Belum ada kelas —</option>
                            {classrooms.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </SelectField>
                    </FormField>
                    <FormField label="No. HP Wali" htmlFor="wali_phone" error={err('wali_phone')}>
                        <TextField
                            id="wali_phone"
                            value={data.wali_phone ?? ''}
                            onChange={(e) => setData('wali_phone', e.target.value)}
                            placeholder="08123456789"
                        />
                    </FormField>
                </div>

                <FormField label="Alamat" htmlFor="address" error={err('address')}>
                    <TextArea
                        id="address"
                        rows={3}
                        value={data.address ?? ''}
                        onChange={(e) => setData('address', e.target.value)}
                        placeholder="Alamat lengkap santri"
                    />
                </FormField>
            </fieldset>

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

// ─── Page ────────────────────────────────────────────────────────────────────
export default function StudentsIndex() {
    const { students, classrooms, filters } = usePage<Props>().props;
    const { active } = useActiveRole();
    const [search, setSearch]           = useState(filters.search ?? '');
    const [classroomId, setClassroomId] = useState(filters.classroom_id ?? '');
    const { confirm, dialog }           = useConfirm();

    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem]   = useState<Student | undefined>(undefined);

    const canEdit   = active === 'super_admin' || active === 'wali_kelas';
    const canDelete = active === 'super_admin';

    const applyFilter = (params: object) => {
        router.get('/students', { search, classroom_id: classroomId, ...params }, {
            preserveState: true,
            replace: true,
        });
    };

    const openCreate = () => { setEditItem(undefined); setModalOpen(true); };
    const openEdit   = (s: Student) => { setEditItem(s); setModalOpen(true); };
    const closeModal = () => setModalOpen(false);

    const handleDelete = (s: Student) => {
        confirm({
            title: 'Hapus santri?',
            message: `Data "${s.name}" akan dihapus.`,
            tone: 'danger',
            confirmLabel: 'Hapus',
            onConfirm: (done) =>
                router.delete(`/students/${s.id}`, {
                    onSuccess: () => toast.success('Data santri berhasil dihapus.'),
                    onFinish: done,
                }),
        });
    };

    const putra = students.data.filter((s) => s.gender === 'L').length;
    const putri = students.data.filter((s) => s.gender === 'P').length;

    return (
        <AuthenticatedLayout header="Database Santri">
            <Head title="Santri" />
            {dialog}

            <CrudModal
                show={modalOpen}
                title={editItem ? `Edit ${editItem.name}` : 'Tambah Santri Baru'}
                onClose={closeModal}
                maxWidth="xl"
            >
                <StudentForm
                    key={editItem?.id ?? 'create'}
                    student={editItem}
                    classrooms={classrooms}
                    onClose={closeModal}
                />
            </CrudModal>

            <PageHero
                icon="group"
                title="Database Santri"
                subtitle="Kelola data akademik dan profil santri secara real-time."
            />

            {/* Stats */}
            <section className="mb-section-margin grid grid-cols-2 gap-card-gap lg:grid-cols-4">
                <StatCard label="Total Santri" value={students.total}        icon="group"        tone="primary" />
                <StatCard label="Halaman ini"  value={students.data.length}  icon="check_circle" tone="secondary" badge={`Page ${students.current_page}/${students.last_page}`} />
                <StatCard label="Putra"        value={putra}                 icon="man"          tone="neutral" />
                <StatCard label="Putri"        value={putri}                 icon="woman"        tone="neutral" />
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
                            <button
                                type="button"
                                onClick={openCreate}
                                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-button font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
                            >
                                <span className="material-symbols-outlined text-[20px]">add</span>
                                Tambah
                            </button>
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
                                        <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">inbox</span>
                                        <p className="mt-2 text-body-sm text-on-surface-variant">Tidak ada santri ditemukan.</p>
                                    </td>
                                </tr>
                            ) : (
                                students.data.map((s) => (
                                    <tr key={s.id} className="transition-colors hover:bg-surface-container-lowest">
                                        <td className="px-6 py-4 text-body-sm font-semibold text-primary">{s.nis}</td>
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
                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(s)}
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg text-outline transition-all hover:bg-primary/5 hover:text-primary"
                                                            aria-label="Edit"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                                        </button>
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
