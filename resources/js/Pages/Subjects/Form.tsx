import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { z } from 'zod';
import type { PageProps } from '@/types';

const schema = z.object({
    code: z.string().min(1, 'Kode wajib diisi').max(20),
    name: z.string().min(1, 'Nama mapel wajib diisi').max(150),
    category: z.string().min(1, 'Kategori wajib diisi').max(100),
    credit_hours: z.number().int('Jam pelajaran harus bilangan bulat').min(1, 'Minimal 1').max(8, 'Maksimal 8'),
});

interface Subject {
    id: number;
    code: string;
    name: string;
    category: string;
    credit_hours: number;
}

interface Props extends PageProps {
    subject?: Subject;
}

export default function SubjectForm() {
    const { subject } = usePage<Props>().props;
    const isEdit = !!subject;

    const { data, setData, post, put, processing, errors } = useForm({
        code: subject?.code ?? '',
        name: subject?.name ?? '',
        category: subject?.category ?? '',
        credit_hours: subject?.credit_hours ?? 1,
    });

    const [zodErrors, setZodErrors] = useState<Record<string, string>>({});

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const result = schema.safeParse({
            ...data,
            credit_hours: Number(data.credit_hours),
        });
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
            put(`/subjects/${subject!.id}`);
        } else {
            post('/subjects');
        }
    };

    const err = (field: string) => zodErrors[field] ?? errors[field as keyof typeof errors];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    {isEdit ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
                </h2>
            }
        >
            <div className="mx-auto max-w-2xl px-4 py-8">
                <form onSubmit={submit} className="space-y-5 rounded-lg border bg-white p-6 shadow-sm">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kode Mapel</label>
                        <input
                            type="text"
                            value={data.code}
                            onChange={e => setData('code', e.target.value)}
                            placeholder="Contoh: MTK, BIN, PAI"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {err('code') && <p className="mt-1 text-xs text-red-600">{err('code')}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Mata Pelajaran</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {err('name') && <p className="mt-1 text-xs text-red-600">{err('name')}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kategori</label>
                        <input
                            type="text"
                            value={data.category}
                            onChange={e => setData('category', e.target.value)}
                            placeholder="Contoh: Umum, Agama, Muatan Lokal"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {err('category') && <p className="mt-1 text-xs text-red-600">{err('category')}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Jam Pelajaran <span className="text-gray-400 font-normal">(1–8)</span>
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={8}
                            value={data.credit_hours}
                            onChange={e => setData('credit_hours', Number(e.target.value))}
                            className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {err('credit_hours') && (
                            <p className="mt-1 text-xs text-red-600">{err('credit_hours')}</p>
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
                            href="/subjects"
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
