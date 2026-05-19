import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHero from '@/Components/PageHero';
import { FormField, TextArea, TextField } from '@/Components/FormField';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useRef, useState } from 'react';
import type { PageProps } from '@/types';

interface SchoolProfile {
    name:         string;
    foundation:   string;
    address:      string;
    city:         string;
    postal_code:  string;
    phone:        string;
    email:        string;
    website:      string;
    logo_url:     string | null;
    opening_text: string;
}

interface Props extends PageProps {
    profile: SchoolProfile;
}

export default function SchoolSettingsIndex() {
    const { profile } = usePage<Props>().props;

    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        name:         profile.name,
        foundation:   profile.foundation,
        address:      profile.address,
        city:         profile.city,
        postal_code:  profile.postal_code,
        phone:        profile.phone,
        email:        profile.email,
        website:      profile.website,
        opening_text: profile.opening_text,
    });

    const [logoUploading, setLogoUploading] = useState(false);
    const [logoDeleting,  setLogoDeleting]  = useState(false);
    const [logoPreview,   setLogoPreview]   = useState<string | null>(profile.logo_url);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put('/pengaturan/sekolah');
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        setLogoPreview(objectUrl);

        setLogoUploading(true);
        const form = new FormData();
        form.append('logo', file);
        router.post('/pengaturan/sekolah/logo', form, {
            forceFormData: true,
            onFinish: () => setLogoUploading(false),
            onError: () => setLogoPreview(profile.logo_url),
        });
    };

    const handleLogoDelete = () => {
        setLogoDeleting(true);
        router.delete('/pengaturan/sekolah/logo', {
            onSuccess: () => setLogoPreview(null),
            onFinish:  () => setLogoDeleting(false),
        });
    };

    return (
        <AuthenticatedLayout header="Pengaturan Sekolah">
            <Head title="Pengaturan Sekolah" />

            <PageHero
                icon="account_balance"
                title="Identitas Sekolah"
                subtitle="Atur kop raport: logo, identitas pesantren, dan kalimat pembuka."
            />

            <div className="mx-auto max-w-3xl space-y-8">

                {/* Logo section */}
                <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
                    <h2 className="mb-4 text-headline-md font-bold text-on-surface">Logo Pesantren</h2>

                    <div className="flex items-start gap-6">
                        <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="h-full w-full object-contain p-2" />
                            ) : (
                                <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">image</span>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <p className="text-body-sm text-on-surface-variant">
                                Format: JPG, PNG, atau SVG. Ukuran maksimum 2 MB.
                                <br />Logo akan ditampilkan di kop raport.
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={logoUploading}
                                    className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 text-button text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-60"
                                >
                                    {logoUploading ? (
                                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-[18px]">upload</span>
                                    )}
                                    {logoUploading ? 'Mengunggah...' : 'Unggah Logo'}
                                </button>
                                {logoPreview && (
                                    <button
                                        type="button"
                                        onClick={handleLogoDelete}
                                        disabled={logoDeleting}
                                        className="flex items-center gap-2 rounded-lg border border-error/30 px-4 py-2 text-button text-error transition-colors hover:bg-error/5 disabled:opacity-60"
                                    >
                                        {logoDeleting ? (
                                            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                        ) : (
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        )}
                                        Hapus
                                    </button>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/svg+xml"
                                className="hidden"
                                onChange={handleLogoChange}
                            />
                        </div>
                    </div>
                </section>

                {/* Identity + Opening text form */}
                <form onSubmit={submit} className="space-y-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
                    <h2 className="text-headline-md font-bold text-on-surface">Identitas Pesantren</h2>

                    <FormField label="Nama Pesantren" htmlFor="name" error={errors.name}>
                        <TextField
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Pondok Pesantren ..."
                        />
                    </FormField>

                    <FormField label="Nama Yayasan" htmlFor="foundation" error={errors.foundation}>
                        <TextField
                            id="foundation"
                            value={data.foundation}
                            onChange={(e) => setData('foundation', e.target.value)}
                            placeholder="Yayasan ..."
                        />
                    </FormField>

                    <FormField label="Alamat" htmlFor="address" error={errors.address}>
                        <TextField
                            id="address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder="Jl. ..."
                        />
                    </FormField>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <FormField label="Kota / Kabupaten" htmlFor="city" error={errors.city}>
                                <TextField
                                    id="city"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    placeholder="Kota ..."
                                />
                            </FormField>
                        </div>
                        <FormField label="Kode Pos" htmlFor="postal_code" error={errors.postal_code}>
                            <TextField
                                id="postal_code"
                                value={data.postal_code}
                                onChange={(e) => setData('postal_code', e.target.value)}
                                placeholder="00000"
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormField label="No. Telepon" htmlFor="phone" error={errors.phone}>
                            <TextField
                                id="phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="(0xx) xxxx-xxxx"
                            />
                        </FormField>
                        <FormField label="Email" htmlFor="email" error={errors.email}>
                            <TextField
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="info@pesantren.ac.id"
                            />
                        </FormField>
                    </div>

                    <FormField label="Website" htmlFor="website" error={errors.website}>
                        <TextField
                            id="website"
                            value={data.website}
                            onChange={(e) => setData('website', e.target.value)}
                            placeholder="https://pesantren.ac.id"
                        />
                    </FormField>

                    <hr className="border-outline-variant" />

                    <h2 className="text-headline-md font-bold text-on-surface">Kalimat Pembuka Raport</h2>

                    <FormField label="Kalimat Pembuka" htmlFor="opening_text" error={errors.opening_text}
                        hint="Ditampilkan di bawah judul raport. Kosongkan jika tidak diperlukan.">
                        <TextArea
                            id="opening_text"
                            rows={3}
                            value={data.opening_text}
                            onChange={(e) => setData('opening_text', e.target.value)}
                            placeholder="Bismillahirrahmanirrahim. Dengan rahmat Allah SWT..."
                        />
                    </FormField>

                    <div className="flex items-center justify-end gap-3 border-t border-outline-variant pt-5">
                        {recentlySuccessful && (
                            <span className="flex items-center gap-1.5 text-body-sm text-primary">
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                Tersimpan
                            </span>
                        )}
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-button font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-60"
                        >
                            {processing && (
                                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                            )}
                            <span className="material-symbols-outlined text-[18px]">save</span>
                            Simpan Identitas
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
