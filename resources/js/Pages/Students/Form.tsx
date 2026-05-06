import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { z } from 'zod';
import type { PageProps } from '@/types';

const schema = z.object({
    nis: z.string().min(1, 'NIS wajib diisi').max(20),
    name: z.string().min(1, 'Nama wajib diisi').max(150),
    gender: z.enum(['L', 'P']),
    birth_date: z.string().optional(),
    birth_place: z.string().max(100).optional(),
    address: z.string().max(500).optional(),
    wali_phone: z.string().max(20).optional(),
    classroom_id: z.string().optional(),
});

interface Classroom {
    id: number;
    name: string;
}

interface Student {
    id: number;
    nis: string;
    name: string;
    gender: 'L' | 'P';
    birth_date: string | null;
    birth_place: string | null;
    address: string | null;
    wali_phone: string | null;
    classroom_id: number | null;
}

interface Props extends PageProps {
    student?: Student;
    classrooms: Classroom[];
}

export default function StudentForm() {
    const { student, classrooms } = usePage<Props>().props;
    const isEdit = !!student;

    const { data, setData, post, put, processing, errors } = useForm({
        nis: student?.nis ?? '',
        name: student?.name ?? '',
        gender: student?.gender ?? ('L' as 'L' | 'P'),
        birth_date: student?.birth_date ?? '',
        birth_place: student?.birth_place ?? '',
        address: student?.address ?? '',
        wali_phone: student?.wali_phone ?? '',
        classroom_id: student?.classroom_id ? String(student.classroom_id) : '',
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
            put(`/students/${student!.id}`);
        } else {
            post('/students');
        }
    };

    const err = (field: string) => zodErrors[field] ?? errors[field as keyof typeof errors];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    {isEdit ? 'Edit Santri' : 'Tambah Santri'}
                </h2>
            }
        >
            <div className="mx-auto max-w-2xl px-4 py-8">
                <form onSubmit={submit} className="space-y-5 rounded-lg border bg-white p-6 shadow-sm">
                    {(
                        [
                            { label: 'NIS', field: 'nis', type: 'text' },
                            { label: 'Nama Lengkap', field: 'name', type: 'text' },
                            { label: 'Tanggal Lahir', field: 'birth_date', type: 'date' },
                            { label: 'Tempat Lahir', field: 'birth_place', type: 'text' },
                            { label: 'No. HP Wali', field: 'wali_phone', type: 'text' },
                        ] as const
                    ).map(({ label, field, type }) => (
                        <div key={field}>
                            <label className="block text-sm font-medium text-gray-700">{label}</label>
                            <input
                                type={type}
                                value={data[field as keyof typeof data] as string}
                                onChange={e => setData(field as any, e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            {err(field) && <p className="mt-1 text-xs text-red-600">{err(field)}</p>}
                        </div>
                    ))}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                        <select
                            value={data.gender}
                            onChange={e => setData('gender', e.target.value as 'L' | 'P')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                        </select>
                        {err('gender') && <p className="mt-1 text-xs text-red-600">{err('gender')}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kelas</label>
                        <select
                            value={data.classroom_id}
                            onChange={e => setData('classroom_id', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">-- Belum ada kelas --</option>
                            {classrooms.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Alamat</label>
                        <textarea
                            value={data.address}
                            onChange={e => setData('address', e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
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
                            href="/students"
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
