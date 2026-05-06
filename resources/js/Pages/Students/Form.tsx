import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FormActions, FormField, SelectField, TextArea, TextField } from '@/Components/FormField';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
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
            result.error.issues.forEach((err) => {
                if (err.path[0]) errs[String(err.path[0])] = err.message;
            });
            setZodErrors(errs);
            return;
        }
        setZodErrors({});
        if (isEdit) put(`/students/${student!.id}`);
        else        post('/students');
    };

    const err = (field: string) => zodErrors[field] ?? errors[field as keyof typeof errors];

    return (
        <AuthenticatedLayout header={isEdit ? 'Edit Santri' : 'Tambah Santri'}>
            <Head title={isEdit ? 'Edit Santri' : 'Tambah Santri'} />

            <div className="mx-auto max-w-3xl">
                <div className="mb-section-margin flex items-center gap-3">
                    <a
                        href="/students"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-high"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </a>
                    <div>
                        <h1 className="text-display-lg font-bold text-primary">
                            {isEdit ? 'Edit Santri' : 'Tambah Santri'}
                        </h1>
                        <p className="text-body-sm text-on-surface-variant">
                            {isEdit ? student!.name : 'Daftarkan santri baru ke database.'}
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-8 rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-sm"
                >
                    {/* Identitas */}
                    <fieldset className="space-y-6">
                        <legend className="text-headline-md font-semibold text-on-surface">Identitas Santri</legend>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    <fieldset className="space-y-6 border-t border-outline-variant pt-6">
                        <legend className="text-headline-md font-semibold text-on-surface">Akademik & Kontak</legend>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

                    <FormActions cancelHref="/students" processing={processing} />
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
