import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FormActions, FormField, TextField } from '@/Components/FormField';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { z } from 'zod';
import type { PageProps } from '@/types';

const schema = z.object({
    code:         z.string().min(1, 'Kode wajib diisi').max(20),
    name:         z.string().min(1, 'Nama mapel wajib diisi').max(150),
    category:     z.string().min(1, 'Kategori wajib diisi').max(100),
    credit_hours: z.number().int('Harus bilangan bulat').min(1, 'Minimal 1').max(8, 'Maksimal 8'),
});

interface Subject {
    id: number;
    code: string;
    name: string;
    category: string;
    credit_hours: number;
}
interface Props extends PageProps { subject?: Subject }

export default function SubjectForm() {
    const { subject } = usePage<Props>().props;
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
            result.error.issues.forEach((err) => {
                if (err.path[0]) errs[String(err.path[0])] = err.message;
            });
            setZodErrors(errs);
            return;
        }
        setZodErrors({});
        if (isEdit) put(`/subjects/${subject!.id}`);
        else        post('/subjects');
    };

    const err = (field: string) => zodErrors[field] ?? errors[field as keyof typeof errors];

    return (
        <AuthenticatedLayout header={isEdit ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}>
            <Head title={isEdit ? 'Edit Mapel' : 'Tambah Mapel'} />

            <div className="mx-auto max-w-2xl">
                <div className="mb-section-margin flex items-center gap-3">
                    <a
                        href="/subjects"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-high"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </a>
                    <div>
                        <h1 className="text-display-lg font-bold text-primary">
                            {isEdit ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
                        </h1>
                        <p className="text-body-sm text-on-surface-variant">
                            {isEdit ? subject!.name : 'Tambah entri baru ke kurikulum.'}
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-sm"
                >
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="md:col-span-1">
                            <FormField label="Kode" htmlFor="code" error={err('code')}>
                                <TextField
                                    id="code"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    placeholder="MAT-101"
                                />
                            </FormField>
                        </div>
                        <div className="md:col-span-2">
                            <FormField label="Nama Mata Pelajaran" htmlFor="name" error={err('name')}>
                                <TextField
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Fiqih Ibadah"
                                />
                            </FormField>
                        </div>
                    </div>

                    <FormField label="Kategori" htmlFor="category" error={err('category')}>
                        <TextField
                            id="category"
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                            placeholder="Contoh: Pendidikan Agama, Sains & Teknologi"
                        />
                    </FormField>

                    <FormField
                        label="Jam Pelajaran (SKS)"
                        htmlFor="credit_hours"
                        error={err('credit_hours')}
                        hint="Antara 1 sampai 8 jam"
                    >
                        <TextField
                            id="credit_hours"
                            type="number"
                            min={1}
                            max={8}
                            value={data.credit_hours}
                            onChange={(e) => setData('credit_hours', Number(e.target.value))}
                            className="w-32"
                        />
                    </FormField>

                    <FormActions cancelHref="/subjects" processing={processing} />
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
