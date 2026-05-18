import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FormActions, FormField, SelectField, TextField } from '@/Components/FormField';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { z } from 'zod';
import type { PageProps } from '@/types';

const ASSESSMENT_TYPES = [
    { value: 'harian', label: 'Harian',  icon: 'edit_note',  desc: 'Nilai tugas dan kegiatan sehari-hari' },
    { value: 'uts',    label: 'UTS',     icon: 'quiz',       desc: 'Ujian Tengah Semester' },
    { value: 'uas',    label: 'UAS',     icon: 'school',     desc: 'Ujian Akhir Semester' },
] as const;

const schema = z.object({
    classroom_id:  z.string().min(1, 'Kelas wajib dipilih'),
    subject_id:    z.string().min(1, 'Mata pelajaran wajib dipilih'),
    academic_year: z.string().regex(/^\d{4}\/\d{4}$/, 'Format: YYYY/YYYY'),
    semester:      z.string().min(1, 'Semester wajib dipilih'),
    type:          z.string().min(1, 'Jenis penilaian wajib dipilih'),
});

interface Classroom { id: number; name: string; academic_year: string }
interface Subject   { id: number; code: string; name: string; classrooms: Classroom[] }
interface Props extends PageProps {
    classrooms: Classroom[];
    subjects:   Subject[];
}

export default function AssessmentCreate() {
    const { classrooms, subjects, context } = usePage<Props>().props;
    const [zodErrors, setZodErrors] = useState<Record<string, string>>({});

    const { data, setData, post, processing, errors } = useForm({
        classroom_id:  '',
        subject_id:    '',
        academic_year: context.academic_year ?? '',
        semester:      context.semester ? String(context.semester) : '',
        type:          '',
    });

    const contextIsSet = !!context.academic_year && !!context.semester;

    // classrooms filtered by selected subject's assigned classrooms
    const availableClassrooms = data.subject_id
        ? (subjects.find((s) => String(s.id) === data.subject_id)?.classrooms ?? [])
        : classrooms;

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
        post('/assessments');
    };

    const err = (field: string) => zodErrors[field] ?? errors[field as keyof typeof errors];

    const onSubjectChange = (id: string) => {
        setData((prev) => ({ ...prev, subject_id: id, classroom_id: '' }));
    };

    const onClassroomChange = (id: string) => {
        setData('classroom_id', id);
        const cls = availableClassrooms.find((c) => String(c.id) === id);
        if (cls?.academic_year) setData('academic_year', cls.academic_year);
    };

    return (
        <AuthenticatedLayout header="Buat Penilaian">
            <Head title="Buat Penilaian" />

            <div className="mx-auto max-w-2xl">
                <div className="mb-section-margin flex items-center gap-3">
                    <a
                        href="/assessments"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-high"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </a>
                    <div>
                        <h1 className="text-display-lg font-bold text-primary">Buat Penilaian Baru</h1>
                        <p className="text-body-sm text-on-surface-variant">
                            Pilih kelas dan mata pelajaran untuk membuat penilaian baru.
                        </p>
                    </div>
                </div>

                {contextIsSet && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-5 py-3">
                        <span className="material-symbols-outlined text-primary">calendar_month</span>
                        <span className="text-body-sm text-on-surface">
                            Periode: <strong>{context.academic_year} · Semester {context.semester}</strong>
                        </span>
                        <a href="/dashboard" className="ml-auto text-body-sm text-primary hover:underline">Ubah</a>
                    </div>
                )}

                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-sm"
                >
                    <FormField label="Mata Pelajaran" htmlFor="subject_id" error={err('subject_id')}>
                        <SelectField
                            id="subject_id"
                            value={data.subject_id}
                            onChange={(e) => onSubjectChange(e.target.value)}
                        >
                            <option value="">— Pilih Mapel —</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>[{s.code}] {s.name}</option>
                            ))}
                        </SelectField>
                    </FormField>

                    <FormField label="Kelas" htmlFor="classroom_id" error={err('classroom_id')}
                        hint={data.subject_id && availableClassrooms.length === 0 ? 'Mapel ini belum diassign ke kelas manapun.' : undefined}>
                        <SelectField
                            id="classroom_id"
                            value={data.classroom_id}
                            onChange={(e) => onClassroomChange(e.target.value)}
                            disabled={!data.subject_id}
                        >
                            <option value="">— Pilih Kelas —</option>
                            {availableClassrooms.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </SelectField>
                    </FormField>

                    {!contextIsSet && (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormField label="Tahun Ajaran" htmlFor="academic_year" error={err('academic_year')} hint="Format: YYYY/YYYY">
                                <TextField
                                    id="academic_year"
                                    value={data.academic_year}
                                    onChange={(e) => setData('academic_year', e.target.value)}
                                    placeholder="2024/2025"
                                />
                            </FormField>

                            <FormField label="Semester" htmlFor="semester" error={err('semester')}>
                                <SelectField
                                    id="semester"
                                    value={data.semester}
                                    onChange={(e) => setData('semester', e.target.value)}
                                >
                                    <option value="">— Pilih Semester —</option>
                                    <option value="1">Semester 1</option>
                                    <option value="2">Semester 2</option>
                                </SelectField>
                            </FormField>
                        </div>
                    )}

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
                                    className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-5 text-center transition-all ${
                                        data.type === t.value
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-primary/40 hover:bg-primary/5'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[28px]">{t.icon}</span>
                                    <span className="text-label-lg font-bold">{t.label}</span>
                                    <span className="text-label-sm leading-snug opacity-80">{t.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <FormActions cancelHref="/assessments" processing={processing} submitLabel="Buat & Input Nilai" />
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
