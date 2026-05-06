import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FormActions, FormField, SelectField, TextField } from '@/Components/FormField';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { z } from 'zod';
import type { PageProps } from '@/types';

const schema = z.object({
    classroom_id:  z.string().min(1, 'Kelas wajib dipilih'),
    subject_id:    z.string().min(1, 'Mata pelajaran wajib dipilih'),
    academic_year: z.string().regex(/^\d{4}\/\d{4}$/, 'Format: YYYY/YYYY'),
    semester:      z.string().min(1, 'Semester wajib dipilih'),
});

interface Classroom { id: number; name: string; academic_year: string }
interface Subject   { id: number; code: string; name: string }
interface Props extends PageProps {
    classrooms: Classroom[];
    subjects:   Subject[];
}

export default function AssessmentCreate() {
    const { classrooms, subjects } = usePage<Props>().props;
    const [zodErrors, setZodErrors] = useState<Record<string, string>>({});

    const { data, setData, post, processing, errors } = useForm({
        classroom_id:  '',
        subject_id:    '',
        academic_year: '',
        semester:      '',
    });

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

    const onClassroomChange = (id: string) => {
        setData('classroom_id', id);
        const cls = classrooms.find((c) => String(c.id) === id);
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

                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-sm"
                >
                    <FormField label="Kelas" htmlFor="classroom_id" error={err('classroom_id')}>
                        <SelectField
                            id="classroom_id"
                            value={data.classroom_id}
                            onChange={(e) => onClassroomChange(e.target.value)}
                        >
                            <option value="">— Pilih Kelas —</option>
                            {classrooms.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </SelectField>
                    </FormField>

                    <FormField label="Mata Pelajaran" htmlFor="subject_id" error={err('subject_id')}>
                        <SelectField
                            id="subject_id"
                            value={data.subject_id}
                            onChange={(e) => setData('subject_id', e.target.value)}
                        >
                            <option value="">— Pilih Mapel —</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>[{s.code}] {s.name}</option>
                            ))}
                        </SelectField>
                    </FormField>

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

                    <FormActions cancelHref="/assessments" processing={processing} submitLabel="Buat & Input Nilai" />
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
