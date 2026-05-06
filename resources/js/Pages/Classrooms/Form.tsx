import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { z } from 'zod';
import type { PageProps } from '@/types';

const schema = z.object({
    name: z.string().min(1, 'Nama kelas wajib diisi').max(100),
    grade_level: z.string().min(1, 'Tingkat wajib diisi').max(50),
    academic_year: z
        .string()
        .min(1, 'Tahun ajaran wajib diisi')
        .regex(/^\d{4}\/\d{4}$/, 'Format tahun ajaran harus YYYY/YYYY, contoh: 2024/2025'),
    homeroom_teacher_id: z.string().optional(),
});

interface Teacher {
    id: number;
    name: string;
}

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
        name: classroom?.name ?? '',
        grade_level: classroom?.grade_level ?? '',
        academic_year: classroom?.academic_year ?? '',
        homeroom_teacher_id: classroom?.homeroom_teacher_id ? String(classroom.homeroom_teacher_id) : '',
    });

    const [zodErrors, setZodErrors] = useState<Record<string, string>>({});

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const result = schema.safeParse(data);
        if (!result.success) {
            const errs: Record<string, string> = {};
            result.error.issues.forEach(err => {
                if (err.path[0]) errs[String(err.path[0])] = err.message;
            });
            setZodErrors(errs);
            return;
        }
        setZodErrors({});
        if (isEdit) {
            put(`/classrooms/${classroom!.id}`);
        } else {
            post('/classrooms');
        }
    };

    const err = (field: string) => zodErrors[field] ?? errors[field as keyof typeof errors];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    {isEdit ? 'Edit Kelas' : 'Tambah Kelas'}
                </h2>
            }
        >
            <div className="mx-auto max-w-2xl px-4 py-8">
                <form onSubmit={submit} className="space-y-5 rounded-lg border bg-white p-6 shadow-sm">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Kelas</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {err('name') && <p className="mt-1 text-xs text-red-600">{err('name')}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tingkat</label>
                        <input
                            type="text"
                            value={data.grade_level}
                            onChange={e => setData('grade_level', e.target.value)}
                            placeholder="Contoh: VII, VIII, IX"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {err('grade_level') && (
                            <p className="mt-1 text-xs text-red-600">{err('grade_level')}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tahun Ajaran</label>
                        <input
                            type="text"
                            value={data.academic_year}
                            onChange={e => setData('academic_year', e.target.value)}
                            placeholder="Contoh: 2024/2025"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {err('academic_year') && (
                            <p className="mt-1 text-xs text-red-600">{err('academic_year')}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Wali Kelas</label>
                        <select
                            value={data.homeroom_teacher_id}
                            onChange={e => setData('homeroom_teacher_id', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">-- Belum ditentukan --</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                        {err('homeroom_teacher_id') && (
                            <p className="mt-1 text-xs text-red-600">{err('homeroom_teacher_id')}</p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-indigo-600 px-5 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <a
                            href="/classrooms"
                            className="rounded-md border px-5 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Batal
                        </a>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
