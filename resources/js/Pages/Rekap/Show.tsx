import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHero from '@/Components/PageHero';
import { Select } from '@/Components/Select';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps } from '@/types';

const GRADE_OPTIONS = [
    { value: 'A', label: 'A — Sangat Baik' },
    { value: 'B', label: 'B — Baik' },
    { value: 'C', label: 'C — Cukup' },
];

interface EkskulEntry { name: string; grade: string }

interface StudentData {
    id: number;
    nis: string;
    name: string;
    absence: { sakit: number; izin: number; alpha: number; notes: string };
    ekskul: EkskulEntry[];
}

interface Props extends PageProps {
    classroom: { id: number; name: string; grade_level: string | null };
    students: StudentData[];
    year: string;
    semester: number;
}

type Tab = 'absensi' | 'ekskul';

export default function RekapShow() {
    const { classroom, students, year, semester } = usePage<Props>().props;
    const [tab, setTab] = useState<Tab>('absensi');

    // ── Absensi state ──────────────────────────────────────────────
    const [absences, setAbsences] = useState<Record<number, { sakit: string; izin: string; alpha: string; notes: string }>>(() =>
        Object.fromEntries(
            students.map((s) => [
                s.id,
                { sakit: String(s.absence.sakit), izin: String(s.absence.izin), alpha: String(s.absence.alpha), notes: s.absence.notes },
            ])
        )
    );
    const [absensiSaving, setAbsensiSaving] = useState(false);
    const [absensiOk,     setAbsensiOk]     = useState(false);

    const setAbsence = (studentId: number, field: 'sakit' | 'izin' | 'alpha' | 'notes', val: string) => {
        setAbsences((prev) => ({ ...prev, [studentId]: { ...prev[studentId], [field]: val } }));
        setAbsensiOk(false);
    };

    const saveAbsensi = () => {
        setAbsensiSaving(true);
        router.put(
            `/rekap/${classroom.id}/absensi`,
            {
                year,
                semester,
                absences: Object.fromEntries(
                    Object.entries(absences).map(([id, v]) => [
                        id,
                        { sakit: parseInt(v.sakit) || 0, izin: parseInt(v.izin) || 0, alpha: parseInt(v.alpha) || 0, notes: v.notes },
                    ])
                ),
            },
            {
                onSuccess: () => setAbsensiOk(true),
                onFinish:  () => setAbsensiSaving(false),
                preserveScroll: true,
            }
        );
    };

    // ── Ekskul state ───────────────────────────────────────────────
    const [ekskuls, setEkskuls] = useState<Record<string, EkskulEntry[]>>(() =>
        Object.fromEntries(students.map((s) => [String(s.id), s.ekskul.length > 0 ? [...s.ekskul] : []]))
    );
    const [ekskulSaving, setEkskulSaving] = useState(false);
    const [ekskulOk,     setEkskulOk]     = useState(false);

    const addEkskul = (studentId: number) => {
        const key = String(studentId);
        setEkskuls((prev) => ({ ...prev, [key]: [...prev[key], { name: '', grade: 'B' }] }));
        setEkskulOk(false);
    };

    const removeEkskul = (studentId: number, idx: number) => {
        const key = String(studentId);
        setEkskuls((prev) => {
            const list = [...prev[key]];
            list.splice(idx, 1);
            return { ...prev, [key]: list };
        });
        setEkskulOk(false);
    };

    const updateEkskul = (studentId: number, idx: number, field: 'name' | 'grade', val: string) => {
        const key = String(studentId);
        setEkskuls((prev) => {
            const list = prev[key].map((e, i) => (i === idx ? { ...e, [field]: val } : e));
            return { ...prev, [key]: list };
        });
        setEkskulOk(false);
    };

    const saveEkskul = () => {
        setEkskulSaving(true);
        router.put(
            `/rekap/${classroom.id}/ekskul`,
            { year, semester, students: ekskuls as unknown as Record<string, { name: string; grade: string }[]> },
            {
                onSuccess: () => setEkskulOk(true),
                onFinish:  () => setEkskulSaving(false),
                preserveScroll: true,
            }
        );
    };

    return (
        <AuthenticatedLayout header="Absensi & Ekskul">
            <Head title={`Rekap — ${classroom.name}`} />

            {/* Back + title */}
            <div className="mb-section-margin flex items-center gap-3">
                <a
                    href="/rekap"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-high"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </a>
                <div>
                    <h1 className="text-display-lg font-bold text-primary">{classroom.name}</h1>
                    <p className="text-body-sm text-on-surface-variant">
                        {year} · Semester {semester}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-1 rounded-xl border border-outline-variant bg-surface-container-low p-1">
                {(['absensi', 'ekskul'] as Tab[]).map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setTab(t)}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-button font-semibold transition-all ${
                            tab === t
                                ? 'bg-primary text-on-primary shadow-sm'
                                : 'text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {t === 'absensi' ? 'event_busy' : 'sports'}
                        </span>
                        {t === 'absensi' ? 'Kehadiran' : 'Ekskul'}
                    </button>
                ))}
            </div>

            {/* ── Absensi Tab ─────────────────────────────────────────────── */}
            {tab === 'absensi' && (
                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-outline-variant bg-surface-container-low">
                                    <th className="px-4 py-3 text-left text-label-caps font-semibold uppercase tracking-wider text-on-surface-variant">
                                        Santri
                                    </th>
                                    {(['sakit', 'izin', 'alpha'] as const).map((f) => (
                                        <th key={f} className="w-28 px-4 py-3 text-center text-label-caps font-semibold uppercase tracking-wider text-on-surface-variant">
                                            {f.charAt(0).toUpperCase() + f.slice(1)}
                                        </th>
                                    ))}
                                    <th className="w-20 px-4 py-3 text-center text-label-caps font-semibold uppercase tracking-wider text-on-surface-variant">
                                        Total
                                    </th>
                                    <th className="px-4 py-3 text-left text-label-caps font-semibold uppercase tracking-wider text-on-surface-variant">
                                        Catatan Wali Kelas
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant">
                                {students.map((s, idx) => {
                                    const abs = absences[s.id];
                                    const total = (parseInt(abs.sakit) || 0) + (parseInt(abs.izin) || 0) + (parseInt(abs.alpha) || 0);
                                    return (
                                        <tr key={s.id} className={idx % 2 === 0 ? '' : 'bg-surface-container-low/40'}>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-on-surface">{s.name}</p>
                                                <p className="text-label-sm text-on-surface-variant">{s.nis}</p>
                                            </td>
                                            {(['sakit', 'izin', 'alpha'] as const).map((f) => (
                                                <td key={f} className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="999"
                                                        value={abs[f]}
                                                        onChange={(e) => setAbsence(s.id, f, e.target.value)}
                                                        className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-center text-body-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    />
                                                </td>
                                            ))}
                                            <td className="px-4 py-3 text-center font-bold text-on-surface">
                                                {total}
                                            </td>
                                            <td className="px-4 py-3">
                                                <textarea
                                                    rows={2}
                                                    value={abs.notes}
                                                    onChange={(e) => setAbsence(s.id, 'notes', e.target.value)}
                                                    placeholder="Catatan untuk santri ini..."
                                                    className="w-full min-w-[200px] rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-outline-variant px-4 py-4">
                        {absensiOk && (
                            <span className="flex items-center gap-1.5 text-body-sm text-primary">
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                Tersimpan
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={saveAbsensi}
                            disabled={absensiSaving}
                            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-button font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-60"
                        >
                            {absensiSaving && (
                                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                            )}
                            <span className="material-symbols-outlined text-[18px]">save</span>
                            Simpan Kehadiran
                        </button>
                    </div>
                </div>
            )}

            {/* ── Ekskul Tab ──────────────────────────────────────────────── */}
            {tab === 'ekskul' && (
                <div className="space-y-4">
                    {students.map((s) => (
                        <div key={s.id} className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
                            <div className="flex items-center justify-between border-b border-outline-variant px-5 py-3">
                                <div>
                                    <p className="font-semibold text-on-surface">{s.name}</p>
                                    <p className="text-label-sm text-on-surface-variant">{s.nis}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => addEkskul(s.id)}
                                    className="flex items-center gap-1.5 rounded-lg border border-primary/40 px-3 py-1.5 text-label-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                                >
                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                    Tambah Ekskul
                                </button>
                            </div>

                            <div className="p-4">
                                {ekskuls[String(s.id)].length === 0 ? (
                                    <p className="text-center text-body-sm text-on-surface-variant/60 py-4">
                                        Belum ada ekskul. Klik "Tambah Ekskul" untuk menambah.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {ekskuls[String(s.id)].map((e, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-surface-container-high text-[11px] font-bold text-on-surface-variant">
                                                    {idx + 1}
                                                </span>
                                                <input
                                                    type="text"
                                                    value={e.name}
                                                    onChange={(ev) => updateEkskul(s.id, idx, 'name', ev.target.value)}
                                                    placeholder="Nama ekskul..."
                                                    className="min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                                <div className="w-44 flex-shrink-0">
                                                    <Select
                                                        size="sm"
                                                        value={e.grade}
                                                        onChange={(v) => updateEkskul(s.id, idx, 'grade', v)}
                                                        options={GRADE_OPTIONS}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeEkskul(s.id, idx)}
                                                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        {ekskulOk && (
                            <span className="flex items-center gap-1.5 text-body-sm text-primary">
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                Tersimpan
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={saveEkskul}
                            disabled={ekskulSaving}
                            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-button font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-60"
                        >
                            {ekskulSaving && (
                                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                            )}
                            <span className="material-symbols-outlined text-[18px]">save</span>
                            Simpan Semua Ekskul
                        </button>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
