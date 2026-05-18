import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHero from '@/Components/PageHero';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import type { PageProps } from '@/types';

interface Weights { harian: number; uts: number; uas: number }
interface Props extends PageProps { weights: Weights }

function WeightInput({
    label, desc, value, onChange, error,
}: {
    label: string;
    desc: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
}) {
    const num = parseFloat(value) || 0;
    return (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <p className="text-headline-md font-bold text-on-surface">{label}</p>
                    <p className="text-body-sm text-on-surface-variant">{desc}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-label-lg font-bold text-primary">
                    {num.toFixed(0)}%
                </span>
            </div>

            {/* Visual bar */}
            <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-surface-container-high">
                <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${Math.min(num, 100)}%` }}
                />
            </div>

            <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-2.5 text-body-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {error && <p className="mt-1 text-label-sm text-error">{error}</p>}
        </div>
    );
}

export default function BobotIndex() {
    const { weights } = usePage<Props>().props;
    const { data, setData, put, processing, errors } = useForm({
        harian: String(weights.harian),
        uts:    String(weights.uts),
        uas:    String(weights.uas),
    });

    const total = (parseFloat(data.harian) || 0)
                + (parseFloat(data.uts)    || 0)
                + (parseFloat(data.uas)    || 0);

    const totalOk = Math.abs(total - 100) < 0.001;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put('/bobot');
    };

    return (
        <AuthenticatedLayout header="Bobot Nilai">
            <Head title="Bobot Nilai" />

            <PageHero
                icon="tune"
                title="Pengaturan Bobot Nilai"
                subtitle="Tentukan persentase bobot untuk Nilai Harian, UTS, dan UAS dalam perhitungan Nilai Akhir."
            />

            <div className="mx-auto max-w-2xl">
                <form onSubmit={submit} className="space-y-5">
                    <WeightInput
                        label="Harian (NH)"
                        desc="Nilai tugas, kuis, dan kegiatan harian"
                        value={data.harian}
                        onChange={(v) => setData('harian', v)}
                        error={errors.harian}
                    />
                    <WeightInput
                        label="UTS (NTS)"
                        desc="Ujian Tengah Semester"
                        value={data.uts}
                        onChange={(v) => setData('uts', v)}
                        error={errors.uts}
                    />
                    <WeightInput
                        label="UAS (NAS)"
                        desc="Ujian Akhir Semester"
                        value={data.uas}
                        onChange={(v) => setData('uas', v)}
                        error={errors.uas}
                    />

                    {/* Total indicator */}
                    <div className={`flex items-center justify-between rounded-xl border p-4 ${
                        totalOk
                            ? 'border-primary/30 bg-primary/5'
                            : 'border-error/30 bg-error-container/30'
                    }`}>
                        <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined ${totalOk ? 'text-primary' : 'text-error'}`}>
                                {totalOk ? 'check_circle' : 'error'}
                            </span>
                            <span className="text-body-base font-semibold text-on-surface">
                                Total Bobot
                            </span>
                        </div>
                        <span className={`text-headline-md font-bold ${totalOk ? 'text-primary' : 'text-error'}`}>
                            {total.toFixed(0)}%
                            {!totalOk && <span className="ml-2 text-body-sm font-normal">harus 100%</span>}
                        </span>
                    </div>

                    {/* Formula preview */}
                    <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 text-center">
                        <p className="text-label-sm text-on-surface-variant">Formula Nilai Akhir</p>
                        <p className="mt-1 font-mono text-body-base font-semibold text-on-surface">
                            NA = (NH × {data.harian || '0'}%) + (NTS × {data.uts || '0'}%) + (NAS × {data.uas || '0'}%)
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing || !totalOk}
                            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-button font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
                        >
                            {processing && (
                                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                            )}
                            <span className="material-symbols-outlined text-[18px]">save</span>
                            Simpan Bobot
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
