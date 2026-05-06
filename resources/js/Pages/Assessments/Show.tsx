import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useConfirm } from '@/hooks/useConfirm';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps } from '@/types';

const STATE_LABELS: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Diajukan',
    verified: 'Terverifikasi',
    rejected: 'Ditolak',
    published: 'Dipublikasi',
};

const STATE_COLORS: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    submitted: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-700',
    published: 'bg-green-100 text-green-800',
};

interface Student {
    id: number;
    nis: string;
    name: string;
}

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

interface Assessment {
    id: number;
    academic_year: string;
    semester: number;
    state: string;
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

function ActionPanel({ assessment, can }: { assessment: Assessment; can: Can }) {
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const { confirm, dialog } = useConfirm();

    const TRANSITION_META: Record<string, { title: string; message: string; tone: 'primary' | 'danger'; icon: string; confirmLabel: string }> = {
        verify:  { title: 'Verifikasi penilaian?', message: 'Penilaian akan dinaikkan ke status terverifikasi.',  tone: 'primary', icon: 'verified',         confirmLabel: 'Verifikasi' },
        reject:  { title: 'Tolak penilaian?',      message: 'Penilaian akan dikembalikan ke guru pengajar.',        tone: 'danger',  icon: 'cancel',           confirmLabel: 'Tolak' },
        publish: { title: 'Publikasikan penilaian?', message: 'Penilaian akan dipublikasikan dan terlihat oleh wali santri.', tone: 'primary', icon: 'publish', confirmLabel: 'Publikasikan' },
    };

    const doTransition = (action: string) => {
        if (action === 'reject' && !comment.trim()) {
            alert('Alasan penolakan wajib diisi.');
            return;
        }
        const meta = TRANSITION_META[action] ?? {
            title: 'Konfirmasi tindakan',
            message: 'Lanjutkan tindakan ini?',
            tone: 'primary' as const,
            icon: 'check',
            confirmLabel: 'Lanjut',
        };
        confirm({
            ...meta,
            onConfirm: (done) => {
                setLoading(true);
                router.post(`/assessments/${assessment.id}/transition`, { action, comment: comment || null }, {
                    onFinish: () => { setLoading(false); done(); },
                });
            },
        });
    };

    const hasActions = can.verify || can.reject || can.publish;
    if (!hasActions) return null;

    return (
        <>
        {dialog}
        <div className="rounded-lg border bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Tindakan</h3>
            <textarea
                rows={2}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={can.reject ? 'Catatan / alasan penolakan (wajib jika tolak)' : 'Catatan (opsional)'}
                className="block w-full rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <div className="flex flex-wrap gap-3">
                {can.verify && (
                    <button
                        onClick={() => doTransition('verify')}
                        disabled={loading}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        Verifikasi
                    </button>
                )}
                {can.publish && (
                    <button
                        onClick={() => doTransition('publish')}
                        disabled={loading}
                        className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                        Publikasi
                    </button>
                )}
                {can.reject && (
                    <button
                        onClick={() => doTransition('reject')}
                        disabled={loading}
                        className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-60"
                    >
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
        <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Riwayat Persetujuan</h3>
            <ol className="relative border-l border-gray-200 space-y-6 ml-3">
                {approvals.map(a => (
                    <li key={a.id} className="ml-4">
                        <div className="absolute -left-1.5 h-3 w-3 rounded-full bg-indigo-500 border-2 border-white" />
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATE_COLORS[a.from_state] ?? 'bg-gray-100 text-gray-700'}`}>
                                {STATE_LABELS[a.from_state] ?? a.from_state}
                            </span>
                            <span className="text-gray-400 text-xs">→</span>
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATE_COLORS[a.to_state] ?? 'bg-gray-100 text-gray-700'}`}>
                                {STATE_LABELS[a.to_state] ?? a.to_state}
                            </span>
                            <span className="text-xs text-gray-500">oleh {a.user.name}</span>
                            <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleString('id-ID')}</span>
                        </div>
                        {a.comment && (
                            <p className="mt-1 text-xs text-gray-600 bg-gray-50 rounded px-3 py-2">{a.comment}</p>
                        )}
                    </li>
                ))}
            </ol>
        </div>
    );
}

export default function AssessmentShow() {
    const { assessment, can } = usePage<Props>().props;

    const scored = assessment.items.filter(i => i.score !== null).length;
    const avg = assessment.items.length > 0
        ? assessment.items.reduce((sum, i) => sum + (parseFloat(i.score ?? '0') || 0), 0) / assessment.items.length
        : 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Detail Penilaian — {assessment.classroom.name}
                    </h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATE_COLORS[assessment.state] ?? ''}`}>
                        {STATE_LABELS[assessment.state] ?? assessment.state}
                    </span>
                </div>
            }
        >
            <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
                {/* Meta info */}
                <div className="rounded-lg border bg-white p-6 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Mata Pelajaran</p>
                        <p className="font-medium">[{assessment.subject.code}] {assessment.subject.name}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Guru</p>
                        <p className="font-medium">{assessment.teacher.name}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Tahun / Semester</p>
                        <p className="font-medium">{assessment.academic_year} · Sem {assessment.semester}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Nilai Rata-rata</p>
                        <p className="font-medium">{scored > 0 ? avg.toFixed(1) : '—'} ({scored}/{assessment.items.length} terisi)</p>
                    </div>
                    {assessment.evidence_path && (
                        <div>
                            <p className="text-gray-500">Berkas Pendukung</p>
                            <a
                                href={`/assessments/${assessment.id}/evidence`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline text-sm font-medium truncate block max-w-xs"
                            >
                                {assessment.evidence_name ?? 'Lihat berkas'}
                            </a>
                        </div>
                    )}
                </div>

                {can.update && (
                    <div className="flex">
                        <a
                            href={`/assessments/${assessment.id}/edit`}
                            className="rounded-md bg-amber-500 px-4 py-2 text-sm text-white hover:bg-amber-600"
                        >
                            Edit Nilai
                        </a>
                    </div>
                )}

                <ActionPanel assessment={assessment} can={can} />

                {/* Grade table */}
                <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-3 border-b bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-700">Daftar Nilai Santri</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-8">#</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIS</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Nilai</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catatan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {assessment.items.map((item, idx) => (
                                    <tr key={item.student_id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 text-sm text-gray-500">{idx + 1}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">{item.student.nis}</td>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.student.name}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                            {item.score !== null
                                                ? <span className="font-semibold">{parseFloat(item.score).toFixed(1)}</span>
                                                : <span className="text-gray-400">—</span>
                                            }
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600">{item.notes || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <ApprovalTimeline approvals={assessment.approvals} />

                <div className="text-right">
                    <a href="/assessments" className="text-sm text-gray-500 hover:underline">← Kembali ke daftar</a>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
