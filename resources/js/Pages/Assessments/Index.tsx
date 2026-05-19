import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHero from '@/Components/PageHero';
import Pagination from '@/Components/Pagination';
import StatCard from '@/Components/StatCard';
import { FormField, TextField } from '@/Components/FormField';
import { Select } from '@/Components/Select';
import { useConfirm } from '@/hooks/useConfirm';
import { useActiveRole } from '@/hooks/useActiveRole';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { z } from 'zod';
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

const TYPE_LABELS: Record<string, string> = { harian: 'Harian', uts: 'UTS', uas: 'UAS' };
const TYPE_BADGE: Record<string, string> = {
    harian: 'bg-surface-container text-on-surface-variant',
    uts:    'bg-secondary-container text-on-secondary-container',
    uas:    'bg-primary/10 text-primary',
};

interface Assessment {
    id: number;
    academic_year: string;
    semester: number;
    type: 'harian' | 'uts' | 'uas' | 'final';
    state: 'draft' | 'submitted' | 'verified' | 'rejected' | 'published';
    classroom: { id: number; name: string };
    subject: { id: number; name: string; code: string };
    teacher: { id: number; name: string };
    items_count: number;
    updated_at: string;
}

interface Classroom { id: number; name: string; academic_year: string }
interface Subject   { id: number; code: string; name: string; classrooms: Classroom[] }

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
    subjects?:   Subject[];
    classrooms?: Classroom[];
}

// ── Assessment Types ──────────────────────────────────────────────────────
const ASSESSMENT_TYPES = [
    { value: 'harian', label: 'Harian', icon: 'edit_note', desc: 'Nilai tugas dan kegiatan sehari-hari' },
    { value: 'uts',    label: 'UTS',    icon: 'quiz',      desc: 'Ujian Tengah Semester' },
    { value: 'uas',    label: 'UAS',    icon: 'school',    desc: 'Ujian Akhir Semester' },
] as const;

const createSchema = z.object({
    classroom_id:  z.string().min(1, 'Kelas wajib dipilih'),
    subject_id:    z.string().min(1, 'Mata pelajaran wajib dipilih'),
    academic_year: z.string().regex(/^\d{4}\/\d{4}$/, 'Format: YYYY/YYYY'),
    semester:      z.string().min(1, 'Semester wajib dipilih'),
    type:          z.string().min(1, 'Jenis penilaian wajib dipilih'),
});

// ── Create Modal ──────────────────────────────────────────────────────────
function CreateModal({ open, onClose, subjects, classrooms }: {
    open: boolean;
    onClose: () => void;
    subjects: Subject[];
    classrooms: Classroom[];
}) {
    const { context } = usePage<Props>().props;
    const [zodErrors, setZodErrors] = useState<Record<string, string>>({});
    const contextIsSet = !!context.academic_year && !!context.semester;

    const { data, setData, post, processing, errors, reset } = useForm({
        classroom_id:  '',
        subject_id:    '',
        academic_year: context.academic_year ?? '',
        semester:      context.semester ? String(context.semester) : '',
        type:          '',
    });

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            reset();
            setZodErrors({});
            setData({
                classroom_id:  '',
                subject_id:    '',
                academic_year: context.academic_year ?? '',
                semester:      context.semester ? String(context.semester) : '',
                type:          '',
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (open) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    const availableClassrooms = data.subject_id
        ? (subjects.find((s) => String(s.id) === data.subject_id)?.classrooms ?? [])
        : classrooms;

    const err = (field: string) => zodErrors[field] ?? errors[field as keyof typeof errors];

    const onSubjectChange = (id: string) => {
        setData((prev) => ({ ...prev, subject_id: id, classroom_id: '' }));
    };

    const onClassroomChange = (id: string) => {
        setData('classroom_id', id);
        const cls = availableClassrooms.find((c) => String(c.id) === id);
        if (cls?.academic_year) setData('academic_year', cls.academic_year);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const result = createSchema.safeParse(data);
        if (!result.success) {
            const errs: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                if (issue.path[0]) errs[String(issue.path[0])] = issue.message;
            });
            setZodErrors(errs);
            return;
        }
        setZodErrors({});
        post('/assessments');
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-outline-variant px-6 py-5">
                    <div>
                        <h2 className="text-headline-md font-bold text-primary">Buat Penilaian Baru</h2>
                        <p className="text-body-sm text-on-surface-variant">Pilih mapel, kelas, dan jenis penilaian.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-5 p-6">
                    {/* Period badge */}
                    {contextIsSet && (
                        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
                            <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
                            <span className="text-body-sm text-on-surface">
                                Periode: <strong>{context.academic_year} · Semester {context.semester}</strong>
                            </span>
                            <a href="/dashboard" className="ml-auto text-body-sm text-primary hover:underline">Ubah</a>
                        </div>
                    )}

                    <FormField label="Mata Pelajaran" htmlFor="subject_id" error={err('subject_id')}>
                        <Select
                            id="subject_id"
                            value={data.subject_id}
                            onChange={onSubjectChange}
                            placeholder="— Pilih Mapel —"
                            searchable
                            options={subjects.map((s) => ({ value: String(s.id), label: `[${s.code}] ${s.name}` }))}
                        />
                    </FormField>

                    <FormField
                        label="Kelas"
                        htmlFor="classroom_id"
                        error={err('classroom_id')}
                        hint={data.subject_id && availableClassrooms.length === 0 ? 'Mapel ini belum diassign ke kelas manapun.' : undefined}
                    >
                        <Select
                            id="classroom_id"
                            value={data.classroom_id}
                            onChange={onClassroomChange}
                            placeholder="— Pilih Kelas —"
                            disabled={!data.subject_id}
                            searchable
                            options={availableClassrooms.map((c) => ({ value: String(c.id), label: c.name }))}
                        />
                    </FormField>

                    {!contextIsSet && (
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Tahun Ajaran" htmlFor="academic_year" error={err('academic_year')} hint="YYYY/YYYY">
                                <TextField
                                    id="academic_year"
                                    value={data.academic_year}
                                    onChange={(e) => setData('academic_year', e.target.value)}
                                    placeholder="2024/2025"
                                />
                            </FormField>
                            <FormField label="Semester" htmlFor="semester" error={err('semester')}>
                                <Select
                                    id="semester"
                                    value={data.semester}
                                    onChange={(val) => setData('semester', val)}
                                    placeholder="— Pilih —"
                                    options={[
                                        { value: '1', label: 'Semester 1' },
                                        { value: '2', label: 'Semester 2' },
                                    ]}
                                />
                            </FormField>
                        </div>
                    )}

                    {/* Type picker */}
                    <div>
                        <p className="mb-2 text-label-md font-semibold text-on-surface">
                            Jenis Penilaian
                            {err('type') && <span className="ml-2 text-label-sm font-normal text-error">{err('type')}</span>}
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            {ASSESSMENT_TYPES.map((t) => (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => setData('type', t.value)}
                                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-4 text-center transition-all ${
                                        data.type === t.value
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-primary/40 hover:bg-primary/5'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[24px]">{t.icon}</span>
                                    <span className="text-label-lg font-bold">{t.label}</span>
                                    <span className="text-label-sm leading-snug opacity-80">{t.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 border-t border-outline-variant pt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-outline-variant px-5 py-2.5 text-button font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-button font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-60"
                        >
                            {processing && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Buat & Input Nilai
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AssessmentsIndex() {
    const { assessments, filters, subjects = [], classrooms = [] } = usePage<Props>().props;
    const { active } = useActiveRole();
    const { confirm, dialog } = useConfirm();
    const [createOpen, setCreateOpen] = useState(false);

    const [state, setState] = useState(filters.state ?? '');
    const [year, setYear] = useState(filters.academic_year ?? '');
    const [semester, setSemester] = useState(filters.semester ?? '');

    const importRef     = useRef<HTMLInputElement>(null);
    const [uploadTarget, setUploadTarget] = useState<Assessment | null>(null);
    const [importError, setImportError] = useState<string | null>(null);

    const openImport = (a: Assessment) => {
        setUploadTarget(a);
        importRef.current?.click();
    };

    const handleFileSelected = (file: File) => {
        if (!uploadTarget) return;
        const target = uploadTarget;
        setUploadTarget(null);
        confirm({
            title: 'Upload nilai dari Excel?',
            message: `Nilai untuk ${target.subject.name} — ${target.classroom.name} (${TYPE_LABELS[target.type] ?? target.type}) akan diperbarui.`,
            tone: 'primary',
            icon: 'upload_file',
            confirmLabel: 'Upload & Perbarui',
            onConfirm: (done) => {
                const fd = new FormData();
                fd.append('scores_file', file);
                router.post(`/assessments/${target.id}/scores/import`, fd, {
                    onSuccess: () => { setImportError(null); router.reload({ only: ['assessments'] }); done(); },
                    onError: (errs) => { setImportError(String(errs.scores_file ?? 'Upload gagal.')); done(); },
                });
            },
        });
    };

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
            {dialog}
            <CreateModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                subjects={subjects}
                classrooms={classrooms}
            />
            <input
                ref={importRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { handleFileSelected(file); e.target.value = ''; }
                }}
            />

            <PageHero
                icon="assessment"
                title="Penilaian Akademik"
                subtitle="Kelola progres santri, lacak milestone kurikulum, dan publikasikan hasil penilaian."
                action={
                    active === 'guru_mapel' && (
                        <button
                            type="button"
                            onClick={() => setCreateOpen(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-5 py-2.5 text-button font-semibold text-on-primary backdrop-blur-sm transition-all hover:bg-white/25"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Buat Penilaian
                        </button>
                    )
                }
            />

            {importError && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-error/20 bg-error-container/40 px-4 py-3 text-body-sm text-on-error-container">
                    <span className="material-symbols-outlined text-error">error</span>
                    {importError}
                    <button type="button" onClick={() => setImportError(null)} className="ml-auto">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            )}

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
                        <Select
                            size="sm"
                            value={state}
                            onChange={(val) => { setState(val); applyFilter({ state: val }); }}
                            options={[
                                { value: '', label: 'Semua status' },
                                ...Object.entries(STATE_LABELS).map(([k, v]) => ({ value: k, label: v })),
                            ]}
                            className="w-40"
                        />
                        <input
                            type="text"
                            placeholder="Tahun ajaran"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilter({ academic_year: year })}
                            className="w-40 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1.5 text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <Select
                            size="sm"
                            value={semester}
                            onChange={(val) => { setSemester(val); applyFilter({ semester: val }); }}
                            options={[
                                { value: '', label: 'Semua semester' },
                                { value: '1', label: 'Semester 1' },
                                { value: '2', label: 'Semester 2' },
                            ]}
                            className="w-40"
                        />
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
                                        <td className="px-6 py-4">
                                            <div className="text-body-sm text-on-surface-variant">{a.academic_year} · Sem {a.semester}</div>
                                            <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-label-caps ${TYPE_BADGE[a.type] ?? ''}`}>
                                                {TYPE_LABELS[a.type] ?? a.type}
                                            </span>
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
                                                    <>
                                                        <a
                                                            href={`/assessments/${a.id}/scores/template`}
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg text-outline transition-all hover:bg-primary/5 hover:text-primary"
                                                            aria-label="Download template nilai"
                                                            title="Download template nilai"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">download</span>
                                                        </a>
                                                        <button
                                                            type="button"
                                                            onClick={() => openImport(a)}
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg text-outline transition-all hover:bg-secondary/10 hover:text-secondary"
                                                            aria-label="Upload nilai dari Excel"
                                                            title="Upload nilai dari Excel"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">upload_file</span>
                                                        </button>
                                                        <Link
                                                            href={`/assessments/${a.id}/edit`}
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg text-outline transition-all hover:bg-tertiary/10 hover:text-tertiary"
                                                            aria-label="Edit"
                                                            title="Edit nilai manual"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">edit_square</span>
                                                        </Link>
                                                    </>
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
