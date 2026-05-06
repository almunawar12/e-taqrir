import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { z } from 'zod';
import type { PageProps } from '@/types';

const schema = z.object({
    classroom_id: z.string().min(1, 'Kelas wajib dipilih'),
    subject_id: z.string().min(1, 'Mata pelajaran wajib dipilih'),
    academic_year: z.string().regex(/^\d{4}\/\d{4}$/, 'Format: YYYY/YYYY'),
    semester: z.string().min(1, 'Semester wajib dipilih'),
});

interface Classroom {
    id: number;
    name: string;
    academic_year: string;
}

interface Subject {
    id: number;
    code: string;
    name: string;
}

interface Props extends PageProps {
    classrooms: Classroom[];
    subjects: Subject[];
}

export default function AssessmentCreate() {
    const { classrooms, subjects } = usePage<Props>().props;
    const [zodErrors, setZodErrors] = useState<Record<string, string>>({});

    const { data, setData, post, processing, errors } = useForm({
        classroom_id: '',
        subject_id: '',
        academic_year: '',
        semester: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const result = schema.safeParse(data);
        if (!result.success) {
            const errs: Record<string, string> = {};
            result.error.issues.forEach(issue => {
                if (issue.path[0]) errs[String(issue.path[0])] = issue.message;
            });
            setZodErrors(errs);
            return;
        }
        setZodErrors({});
        post('/assessments');
    };

    const err = (field: string) => zodErrors[field] ?? errors[field as keyof typeof errors];

    // auto-fill academic_year when classroom selected
    const onClassroomChange = (id: string) => {
        setData('classroom_id', id);
        const cls = classrooms.find(c => String(c.id) === id);
        if (cls?.academic_year) setData('academic_year', cls.academic_year);
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Buat Penilaian</h2>}>
            <div className="mx-auto max-w-xl px-4 py-8">
                <form onSubmit={submit} className="space-y-5 rounded-lg border bg-white p-6 shadow-sm">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kelas</label>
                        <select
                            value={data.classroom_id}
                            onChange={e => onClassroomChange(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">-- Pilih Kelas --</option>
                            {classrooms.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {err('classroom_id') && <p className="mt-1 text-xs text-red-600">{err('classroom_id')}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mata Pelajaran</label>
                        <select
                            value={data.subject_id}
                            onChange={e => setData('subject_id', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">-- Pilih Mapel --</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>[{s.code}] {s.name}</option>
                            ))}
                        </select>
                        {err('subject_id') && <p className="mt-1 text-xs text-red-600">{err('subject_id')}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tahun Ajaran</label>
                        <input
                            type="text"
                            placeholder="2024/2025"
                            value={data.academic_year}
                            onChange={e => setData('academic_year', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {err('academic_year') && <p className="mt-1 text-xs text-red-600">{err('academic_year')}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Semester</label>
                        <select
                            value={data.semester}
                            onChange={e => setData('semester', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">-- Pilih Semester --</option>
                            <option value="1">Semester 1</option>
                            <option value="2">Semester 2</option>
                        </select>
                        {err('semester') && <p className="mt-1 text-xs text-red-600">{err('semester')}</p>}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-indigo-600 px-5 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {processing ? 'Membuat...' : 'Buat & Input Nilai'}
                        </button>
                        <a
                            href="/assessments"
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
