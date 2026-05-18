import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useConfirm } from '@/hooks/useConfirm';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps } from '@/types';

interface TypeInfo {
    id: number;
    state: string;
    filled: number;
    total: number;
}

interface FinalScore {
    student_id: number;
    nis: string;
    name: string;
    harian: number | null;
    uts: number | null;
    uas: number | null;
    final: number | null;
}

interface Group {
    classroom:        { id: number; name: string };
    subject:          { id: number; name: string; code: string };
    academic_year:    string;
    semester:         number;
    by_type: {
        harian: TypeInfo | null;
        uts:    TypeInfo | null;
        uas:    TypeInfo | null;
    };
    final_scores:     FinalScore[];
    final_assessment: { id: number; state: string } | null;
    can_submit:       boolean;
}

interface Weights { harian: number; uts: number; uas: number }

interface Props extends PageProps {
    group:   Group;
    weights: Weights;
}

const STATE_BADGE: Record<string, string> = {
    draft:     'bg-surface-container-high text-on-surface-variant',
    submitted: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    verified:  'bg-secondary-container text-on-secondary-container',
    rejected:  'bg-error-container text-on-error-container',
    published: 'bg-primary/10 text-primary',
};
const STATE_LABELS: Record<string, string> = {
    draft: 'Draft', submitted: 'Diajukan', verified: 'Terverifikasi',
    rejected: 'Ditolak', published: 'Dipublikasi',
};

function scoreColor(score: number | null): string {
    if (score === null) return 'text-on-surface-variant';
    if (score >= 80) return 'text-primary font-semibold';
    if (score >= 60) return 'text-secondary font-semibold';
    return 'text-error font-semibold';
}

function TypeChip({ label, info }: { label: string; info: TypeInfo | null }) {
    if (!info) {
        return (
            <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-outline-variant px-3 py-2 text-label-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">remove</span>
                {label}: Belum dibuat
            </div>
        );
    }
    const allFilled = info.filled === info.total && info.total > 0;
    return (
        <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2">
            <span className={`rounded-full px-2 py-0.5 text-label-caps ${STATE_BADGE[info.state] ?? ''}`}>
                {STATE_LABELS[info.state] ?? info.state}
            </span>
            <span className="text-label-sm font-semibold text-on-surface">{label}</span>
            <span className={`ml-auto text-label-sm ${allFilled ? 'text-primary' : 'text-tertiary'}`}>
                {info.filled}/{info.total}
            </span>
        </div>
    );
}

export default function AssessmentFinalShow() {
    const { group, weights } = usePage<Props>().props;
    const { confirm, dialog } = useConfirm();
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const finalState   = group.final_assessment?.state ?? null;
    const isRejected   = finalState === 'rejected';
    const completeCount = group.final_scores.filter((s) => s.final !== null).length;

    const handleSubmit = () => {
        confirm({
            title:        isRejected ? 'Ajukan ulang nilai akhir?' : 'Ajukan nilai akhir?',
            message:      `Nilai akhir ${group.subject.name} — ${group.classroom.name} akan dihitung dan diajukan ke wali kelas.`,
            tone:         'primary',
            icon:         'send',
            confirmLabel: isRejected ? 'Ajukan Ulang' : 'Ajukan',
            onConfirm: (done) => {
                setSubmitting(true);
                router.post('/nilai-akhir/submit', {
                    classroom_id:  group.classroom.id,
                    subject_id:    group.subject.id,
                    academic_year: group.academic_year,
                    semester:      group.semester,
                    comment:       comment || null,
                }, {
                    onSuccess: done,
                    onError:   done,
                    onFinish:  () => setSubmitting(false),
                });
            },
        });
    };

    return (
        <AuthenticatedLayout header="Nilai Akhir">
            <Head title={`Nilai Akhir — ${group.subject.name}`} />
            {dialog}

            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <a
                            href="/nilai-akhir"
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-high"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </a>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                                    {group.subject.code}
                                </span>
                                <h1 className="text-headline-md font-bold text-on-surface">{group.subject.name}</h1>
                            </div>
                            <p className="mt-0.5 text-body-sm text-on-surface-variant">
                                {group.classroom.name} · {group.academic_year} · Semester {group.semester}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-body-sm text-on-surface-variant">
                            Nilai lengkap:{' '}
                            <strong className={completeCount === group.final_scores.length ? 'text-primary' : 'text-tertiary'}>
                                {completeCount}/{group.final_scores.length}
                            </strong>
                        </span>
                        {finalState && !['draft', 'rejected'].includes(finalState) && (
                            <span className={`rounded-full px-3 py-1 text-label-caps ${STATE_BADGE[finalState] ?? ''}`}>
                                {STATE_LABELS[finalState] ?? finalState}
                            </span>
                        )}
                    </div>
                </div>

                {/* Rejection notice */}
                {isRejected && (
                    <div className="flex items-start gap-3 rounded-xl border border-error/20 bg-error-container/40 px-5 py-4">
                        <span className="material-symbols-outlined text-error">error</span>
                        <div>
                            <p className="text-body-base font-semibold text-on-error-container">
                                Nilai akhir ditolak
                            </p>
                            <p className="mt-0.5 text-body-sm text-on-surface">
                                Periksa nilai komponen, lalu ajukan ulang.
                            </p>
                        </div>
                    </div>
                )}

                {/* Type status row */}
                <div className="grid grid-cols-3 gap-3">
                    <TypeChip label="Harian" info={group.by_type.harian} />
                    <TypeChip label="UTS"    info={group.by_type.uts} />
                    <TypeChip label="UAS"    info={group.by_type.uas} />
                </div>

                {/* Score table */}
                <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
                    <div className="border-b border-outline-variant bg-surface-container-low px-6 py-4">
                        <h2 className="text-headline-md font-bold text-on-surface">Rekap Nilai</h2>
                        <p className="text-body-sm text-on-surface-variant">
                            Formula: NA = (NH × {weights.harian}%) + (NTS × {weights.uts}%) + (NAS × {weights.uas}%)
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-surface-container-low text-on-surface-variant">
                                <tr>
                                    <th className="w-10 px-4 py-3 text-label-caps">#</th>
                                    <th className="px-4 py-3 text-label-caps">NIS</th>
                                    <th className="px-4 py-3 text-label-caps">Nama Santri</th>
                                    <th className="px-4 py-3 text-center text-label-caps">
                                        NH <span className="opacity-60">({weights.harian}%)</span>
                                    </th>
                                    <th className="px-4 py-3 text-center text-label-caps">
                                        NTS <span className="opacity-60">({weights.uts}%)</span>
                                    </th>
                                    <th className="px-4 py-3 text-center text-label-caps">
                                        NAS <span className="opacity-60">({weights.uas}%)</span>
                                    </th>
                                    <th className="px-4 py-3 text-center text-label-caps font-bold text-primary">
                                        Nilai Akhir
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant">
                                {group.final_scores.map((s, idx) => (
                                    <tr key={s.student_id} className="transition-colors hover:bg-surface-container-low/40">
                                        <td className="px-4 py-3 text-label-sm text-on-surface-variant">{idx + 1}</td>
                                        <td className="px-4 py-3 font-mono text-label-sm text-on-surface-variant">{s.nis}</td>
                                        <td className="px-4 py-3 text-body-sm font-semibold text-on-surface">{s.name}</td>
                                        <td className={`px-4 py-3 text-center text-body-sm ${scoreColor(s.harian)}`}>
                                            {s.harian ?? <span className="text-on-surface-variant/40">—</span>}
                                        </td>
                                        <td className={`px-4 py-3 text-center text-body-sm ${scoreColor(s.uts)}`}>
                                            {s.uts ?? <span className="text-on-surface-variant/40">—</span>}
                                        </td>
                                        <td className={`px-4 py-3 text-center text-body-sm ${scoreColor(s.uas)}`}>
                                            {s.uas ?? <span className="text-on-surface-variant/40">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {s.final !== null ? (
                                                <span className={`rounded-full px-3 py-1 text-label-sm ${
                                                    s.final >= 80 ? 'bg-primary/10 font-bold text-primary'
                                                    : s.final >= 60 ? 'bg-secondary-container font-bold text-on-secondary-container'
                                                    : 'bg-error-container font-bold text-on-error-container'
                                                }`}>
                                                    {s.final.toFixed(2)}
                                                </span>
                                            ) : (
                                                <span className="text-on-surface-variant/40">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Submit section */}
                {group.can_submit && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
                        <h3 className="flex items-center gap-2 text-headline-md text-on-surface">
                            <span className="material-symbols-outlined text-primary">send</span>
                            {isRejected ? 'Ajukan Ulang ke Wali Kelas' : 'Ajukan ke Wali Kelas'}
                        </h3>
                        <p className="mt-1 text-body-sm text-on-surface-variant">
                            Nilai akhir akan dihitung otomatis dan dikirim ke wali kelas untuk diverifikasi.
                        </p>
                        <input
                            type="text"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Catatan pengajuan (opsional)"
                            className="mt-4 block w-full rounded-lg border border-outline-variant bg-surface px-4 py-2.5 text-body-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-button font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-60"
                        >
                            {submitting
                                ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                : <span className="material-symbols-outlined text-[18px]">send</span>
                            }
                            {submitting ? 'Mengajukan...' : (isRejected ? 'Ajukan Ulang' : 'Ajukan Nilai Akhir')}
                        </button>
                    </div>
                )}

                {/* Already submitted/verified/published */}
                {finalState && !['draft', 'rejected'].includes(finalState) && (
                    <div className="flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-low px-5 py-4">
                        <span className="material-symbols-outlined text-on-surface-variant">info</span>
                        <p className="text-body-sm text-on-surface-variant">
                            Nilai akhir sudah <strong>{STATE_LABELS[finalState] ?? finalState}</strong> — tidak dapat diubah.
                        </p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
