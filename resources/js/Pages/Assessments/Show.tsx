import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useConfirm } from '@/hooks/useConfirm';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps } from '@/types';

const STATE_LABELS: Record<string, string> = {
    draft:     'Draft',
    submitted: 'Diajukan',
    verified:  'Terverifikasi',
    rejected:  'Ditolak',
    published: 'Dipublikasi',
};

const STATE_BADGE: Record<string, string> = {
    draft:     'bg-surface-container-high text-on-surface-variant',
    submitted: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    verified:  'bg-secondary-container text-on-secondary-container',
    rejected:  'bg-error-container text-on-error-container',
    published: 'bg-primary/10 text-primary',
};

interface Student { id: number; nis: string; name: string }

interface Item {
    id: number;
    student_id: number;
    score: string | null;
    notes: string | null;
    student: Student;
}

interface Approval {
    id: number;
    from_state: string;
    to_state: string;
    comment: string | null;
    created_at: string;
    user: { id: number; name: string };
}

const TYPE_LABELS: Record<string, string> = { harian: 'Harian', uts: 'UTS', uas: 'UAS' };

interface Assessment {
    id: number;
    academic_year: string;
    semester: number;
    type: 'harian' | 'uts' | 'uas' | 'final';
    state: 'draft' | 'submitted' | 'verified' | 'rejected' | 'published';
    evidence_path: string | null;
    evidence_name: string | null;
    classroom: { id: number; name: string };
    subject: { id: number; name: string; code: string };
    teacher: { id: number; name: string };
    items: Item[];
    approvals: Approval[];
}

interface Can {
    submit: boolean;
    verify: boolean;
    reject: boolean;
    publish: boolean;
    update: boolean;
}

interface Props extends PageProps {
    assessment: Assessment;
    can: Can;
}

interface TransitionMeta {
    title: string;
    message: string;
    tone: 'primary' | 'danger';
    icon: string;
    confirmLabel: string;
}

const TRANSITION_META: Record<string, TransitionMeta> = {
    verify:  { title: 'Verifikasi penilaian?',   message: 'Penilaian akan dinaikkan ke status terverifikasi.',                 tone: 'primary', icon: 'verified', confirmLabel: 'Verifikasi' },
    reject:  { title: 'Tolak penilaian?',        message: 'Penilaian akan dikembalikan ke guru pengajar.',                     tone: 'danger',  icon: 'cancel',   confirmLabel: 'Tolak' },
    publish: { title: 'Publikasikan penilaian?', message: 'Penilaian akan dipublikasikan dan terlihat oleh wali santri.',      tone: 'primary', icon: 'publish',  confirmLabel: 'Publikasikan' },
};

function ActionPanel({ assessment, can }: { assessment: Assessment; can: Can }) {
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [rejectError, setRejectError] = useState(false);
    const { confirm, dialog } = useConfirm();

    const doTransition = (action: keyof typeof TRANSITION_META) => {
        if (action === 'reject' && !comment.trim()) {
            setRejectError(true);
            return;
        }
        setRejectError(false);
        const meta = TRANSITION_META[action];
        confirm({
            ...meta,
            onConfirm: (done) => {
                setLoading(true);
                router.post(`/assessments/${assessment.id}/transition`, {
                    action,
                    comment: comment || null,
                }, { onFinish: () => { setLoading(false); done(); } });
            },
        });
    };

    if (!can.verify && !can.reject && !can.publish) return null;

    return (
        <>
            {dialog}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-headline-md text-on-surface">
                    <span className="material-symbols-outlined text-primary">task_alt</span>
                    Tindakan
                </h3>
                <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => { setComment(e.target.value); if (rejectError) setRejectError(false); }}
                    placeholder={can.reject ? 'Catatan / alasan penolakan (wajib jika tolak)' : 'Catatan (opsional)'}
                    className={`mt-4 block w-full rounded-lg border bg-surface-container-lowest px-4 py-2.5 text-body-sm focus:ring-2 focus:ring-primary/20 ${rejectError ? 'border-error focus:border-error' : 'border-outline-variant focus:border-primary'}`}
                />
                {rejectError && (
                    <p className="mt-1 text-label-sm text-error">Alasan penolakan wajib diisi.</p>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                    {can.verify && (
                        <button
                            type="button"
                            onClick={() => doTransition('verify')}
                            disabled={loading}
                            className="flex items-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-button font-semibold text-on-secondary shadow-sm transition-all hover:brightness-110 disabled:opacity-60"
                        >
                            <span className="material-symbols-outlined text-[18px]">verified</span>
                            Verifikasi
                        </button>
                    )}
                    {can.publish && (
                        <button
                            type="button"
                            onClick={() => doTransition('publish')}
                            disabled={loading}
                            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-button font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-60"
                        >
                            <span className="material-symbols-outlined text-[18px]">publish</span>
                            Publikasi
                        </button>
                    )}
                    {can.reject && (
                        <button
                            type="button"
                            onClick={() => doTransition('reject')}
                            disabled={loading}
                            className="flex items-center gap-2 rounded-lg bg-error px-5 py-2.5 text-button font-semibold text-on-error shadow-sm transition-all hover:brightness-110 disabled:opacity-60"
                        >
                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                            Tolak
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}

function ApprovalTimeline({ approvals }: { approvals: Approval[] }) {
    if (!approvals.length) return null;

    return (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-headline-md text-on-surface">
                <span className="material-symbols-outlined text-primary">history</span>
                Riwayat Persetujuan
            </h3>
            <ol className="relative ml-3 mt-6 space-y-6 border-l-2 border-outline-variant pl-6">
                {approvals.map((a) => (
                    <li key={a.id} className="relative">
                        <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-4 border-surface-container-lowest bg-primary" />
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2.5 py-0.5 text-label-caps ${STATE_BADGE[a.from_state] ?? ''}`}>
                                {STATE_LABELS[a.from_state] ?? a.from_state}
                            </span>
                            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">arrow_forward</span>
                            <span className={`rounded-full px-2.5 py-0.5 text-label-caps ${STATE_BADGE[a.to_state] ?? ''}`}>
                                {STATE_LABELS[a.to_state] ?? a.to_state}
                            </span>
                            <span className="text-body-sm text-on-surface-variant">oleh {a.user.name}</span>
                            <span className="text-body-sm text-on-surface-variant/60">
                                {new Date(a.created_at).toLocaleString('id-ID')}
                            </span>
                        </div>
                        {a.comment && (
                            <p className="mt-2 rounded-lg bg-surface-container-low px-4 py-3 text-body-sm text-on-surface">
                                {a.comment}
                            </p>
                        )}
                    </li>
                ))}
            </ol>
        </div>
    );
}

function MetaTile({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="rounded-lg bg-surface-container-low p-4">
            <p className="text-label-caps uppercase text-on-surface-variant">{label}</p>
            <p className="mt-1 text-body-base font-semibold text-on-surface">{value}</p>
        </div>
    );
}

export default function AssessmentShow() {
    const { assessment, can } = usePage<Props>().props;

    const scored = assessment.items.filter((i) => i.score !== null).length;
    const avg = assessment.items.length > 0
        ? assessment.items.reduce((sum, i) => sum + (parseFloat(i.score ?? '0') || 0), 0) / assessment.items.length
        : 0;

    return (
        <AuthenticatedLayout header="Detail Penilaian">
            <Head title="Detail Penilaian" />

            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm md:flex-row md:items-center">
                    <div className="flex items-center gap-3">
                        <a
                            href="/assessments"
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-high"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </a>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                                    {assessment.subject.code}
                                </span>
                                <h1 className="text-headline-md font-bold text-on-surface">
                                    {assessment.subject.name}
                                </h1>
                            </div>
                            <p className="text-body-sm text-on-surface-variant">
                                {assessment.classroom.name} · {assessment.academic_year} · Semester {assessment.semester} · {TYPE_LABELS[assessment.type] ?? assessment.type}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-label-caps ${STATE_BADGE[assessment.state] ?? ''}`}>
                            {STATE_LABELS[assessment.state] ?? assessment.state}
                        </span>
                        {can.update && (
                            <a
                                href={`/assessments/${assessment.id}/edit`}
                                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-button font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
                            >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                Edit Nilai
                            </a>
                        )}
                    </div>
                </div>

                {/* Meta tiles */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <MetaTile label="Guru" value={assessment.teacher.name} />
                    <MetaTile label="Santri Terisi" value={`${scored} / ${assessment.items.length}`} />
                    <MetaTile
                        label="Rata-rata"
                        value={scored > 0 ? avg.toFixed(1) : '—'}
                    />
                    <MetaTile
                        label="Berkas"
                        value={
                            assessment.evidence_path ? (
                                <a
                                    href={`/assessments/${assessment.id}/evidence`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                    <span className="material-symbols-outlined text-[16px]">attach_file</span>
                                    Lihat
                                </a>
                            ) : '—'
                        }
                    />
                </div>

                <ActionPanel assessment={assessment} can={can} />

                {/* Score table */}
                <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
                    <div className="border-b border-outline-variant bg-surface-container-low px-6 py-4">
                        <h3 className="text-headline-md text-on-surface">Daftar Nilai Santri</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-surface-container-low text-on-surface-variant">
                                <tr>
                                    <th className="w-12 px-4 py-3 text-label-caps">#</th>
                                    <th className="px-4 py-3 text-label-caps">NIS</th>
                                    <th className="px-4 py-3 text-label-caps">Nama Santri</th>
                                    <th className="w-28 px-4 py-3 text-label-caps">Nilai</th>
                                    <th className="px-4 py-3 text-label-caps">Catatan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant">
                                {assessment.items.map((item, idx) => (
                                    <tr key={item.student_id} className="transition-colors hover:bg-surface-container-low/50">
                                        <td className="px-4 py-3 text-body-sm text-on-surface-variant">{idx + 1}</td>
                                        <td className="px-4 py-3 text-body-sm font-mono text-on-surface-variant">
                                            {item.student.nis}
                                        </td>
                                        <td className="px-4 py-3 text-body-base font-semibold text-on-surface">
                                            {item.student.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.score !== null ? (
                                                <span className="text-body-base font-bold text-primary">
                                                    {parseFloat(item.score).toFixed(1)}
                                                </span>
                                            ) : (
                                                <span className="text-body-sm text-on-surface-variant/60">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-body-sm text-on-surface-variant">
                                            {item.notes || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <ApprovalTimeline approvals={assessment.approvals} />
            </div>
        </AuthenticatedLayout>
    );
}
