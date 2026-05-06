import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FormActions, FormField, SelectField, TextField } from '@/Components/FormField';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
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
    homeroom_teacher_id: number | null;
}
interface Props extends PageProps {
    classroom?: Classroom;
    teachers: Teacher[];
}

export default function ClassroomForm() {
    const { classroom, teachers } = usePage<Props>().props;
    const isEdit = !!classroom;

    const { data, setData, post, put, processing, errors } = useForm({
        name:                classroom?.name ?? '',
        grade_level:         classroom?.grade_level ?? '',
        academic_year:       classroom?.academic_year ?? '',
        homeroom_teacher_id: classroom?.homeroom_teacher_id ? String(classroom.homeroom_teacher_id) : '',
    });

    const [zodErrors, setZodErrors] = useState<Record<string, string>>({});

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const result = schema.safeParse(data);
        if (!result.success) {
            const errs: Record<string, string> = {};
            result.error.issues.forEach((err) => {
                if (err.path[0]) errs[String(err.path[0])] = err.message;
            });
            setZodErrors(errs);
            return;
        }
        setZodErrors({});
        if (isEdit) put(`/classrooms/${classroom!.id}`);
        else        post('/classrooms');
    };

    const err = (field: string) => zodErrors[field] ?? errors[field as keyof typeof errors];

    return (
        <AuthenticatedLayout header={isEdit ? 'Edit Kelas' : 'Tambah Kelas'}>
            <Head title={isEdit ? 'Edit Kelas' : 'Tambah Kelas'} />

            <div className="mx-auto max-w-2xl">
                <div className="mb-section-margin flex items-center gap-3">
                    <a
                        href="/classrooms"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-high"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </a>
                    <div>
                        <h1 className="text-display-lg font-bold text-primary">
                            {isEdit ? 'Edit Kelas' : 'Tambah Kelas Baru'}
                        </h1>
                        <p className="text-body-sm text-on-surface-variant">
                            {isEdit ? `Perbarui detail untuk ${classroom!.name}` : 'Buat entitas kelas baru untuk tahun akademik.'}
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-sm"
                >
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
                        <SelectField
                            id="homeroom_teacher_id"
                            value={data.homeroom_teacher_id}
                            onChange={(e) => setData('homeroom_teacher_id', e.target.value)}
                        >
                            <option value="">— Belum ditentukan —</option>
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </SelectField>
                    </FormField>

                    <FormActions cancelHref="/classrooms" processing={processing} />
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
