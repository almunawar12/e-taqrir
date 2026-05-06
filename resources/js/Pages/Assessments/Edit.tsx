import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useConfirm } from '@/hooks/useConfirm';
import { router, usePage } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import 'filepond/dist/filepond.min.css';
import type { PageProps } from '@/types';

registerPlugin(FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

interface Student {
    id: number;
    nis: string;
    name: string;
    gender: 'L' | 'P';
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
    comment: string | null;
    evidence_path: string | null;
    evidence_name: string | null;
    classroom: { id: number; name: string };
    subject: { id: number; name: string; code: string };
    items: Item[];
    approvals: Approval[];
}

interface Props extends PageProps {
    assessment: Assessment;
    canSubmit: boolean;
}

const STATE_LABELS: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Diajukan',
    verified: 'Terverifikasi',
    rejected: 'Ditolak',
    published: 'Dipublikasi',
};

export default function AssessmentEdit() {
    const { assessment, canSubmit } = usePage<Props>().props;

    const [scores, setScores] = useState<Record<number, string>>(
        Object.fromEntries(assessment.items.map(i => [i.student_id, i.score ?? '']))
    );
    const [notes, setNotes] = useState<Record<number, string>>(
        Object.fromEntries(assessment.items.map(i => [i.student_id, i.notes ?? '']))
    );
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitComment, setSubmitComment] = useState('');
    const [evidenceName, setEvidenceName] = useState<string | null>(assessment.evidence_name);
    const [pondFiles, setPondFiles] = useState<any[]>([]);
    const { confirm, dialog } = useConfirm();

    const persistScores = () => {
        setSaving(true);
        const items = assessment.items.map(item => ({
            student_id: item.student_id,
            score: scores[item.student_id] === '' ? null : scores[item.student_id],
            notes: notes[item.student_id] || null,
        }));
        router.put(`/assessments/${assessment.id}`, { items }, {
            onFinish: () => setSaving(false),
        });
    };

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        confirm({
            title: 'Simpan perubahan nilai?',
            message: 'Nilai dan catatan untuk seluruh santri akan diperbarui.',
            tone: 'primary',
            icon: 'save',
            confirmLabel: 'Simpan',
            onConfirm: (done) => {
                persistScores();
                done();
            },
        });
    };

    const handleSubmit = () => {
        confirm({
            title: 'Ajukan penilaian?',
            message: 'Penilaian akan dikirim ke wali kelas untuk diverifikasi. Pastikan semua data sudah benar.',
            tone: 'primary',
            icon: 'send',
            confirmLabel: 'Ajukan',
            onConfirm: (done) => {
                setSubmitting(true);
                router.post(`/assessments/${assessment.id}/transition`, {
                    action: 'submit',
                    comment: submitComment || null,
                }, { onFinish: () => { setSubmitting(false); done(); } });
            },
        });
    };

    const isRejected = assessment.state === 'rejected';
    const lastRejection = isRejected
        ? [...assessment.approvals].reverse().find(a => a.to_state === 'rejected')
        : null;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Input Nilai — {assessment.classroom.name} · [{assessment.subject.code}] {assessment.subject.name}
                    </h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        isRejected ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                        {STATE_LABELS[assessment.state] ?? assessment.state}
                    </span>
                </div>
            }
        >
            {dialog}
            <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
                {isRejected && lastRejection && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <p className="font-medium">Penilaian ditolak oleh {lastRejection.user.name}</p>
                        {lastRejection.comment && <p className="mt-1">{lastRejection.comment}</p>}
                    </div>
                )}

                <form onSubmit={handleSave} className="rounded-lg border bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            {assessment.academic_year} · Semester {assessment.semester}
                        </div>
                        <div className="text-sm text-gray-500">{assessment.items.length} santri</div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-8">#</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIS</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-28">Nilai (0-100)</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catatan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {assessment.items.map((item, idx) => (
                                    <tr key={item.student_id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 text-sm text-gray-500">{idx + 1}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">{item.student.nis}</td>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.student.name}</td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={scores[item.student_id]}
                                                onChange={e => setScores(prev => ({ ...prev, [item.student_id]: e.target.value }))}
                                                className="block w-24 rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                placeholder="—"
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="text"
                                                value={notes[item.student_id]}
                                                onChange={e => setNotes(prev => ({ ...prev, [item.student_id]: e.target.value }))}
                                                className="block w-full rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                placeholder="Opsional"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-md bg-indigo-600 px-5 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {saving ? 'Menyimpan...' : 'Simpan Nilai'}
                        </button>
                        <a href="/assessments" className="text-sm text-gray-500 hover:underline">Kembali</a>
                    </div>
                </form>

                {/* Evidence Upload */}
                <div className="rounded-lg border bg-white p-6 shadow-sm space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Berkas Pendukung (Opsional)</h3>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG, WebP — maks 10 MB</p>

                    {evidenceName && (
                        <div className="flex items-center gap-3 rounded-md bg-gray-50 border px-3 py-2 text-sm">
                            <span className="flex-1 truncate text-gray-700">{evidenceName}</span>
                            <a
                                href={`/assessments/${assessment.id}/evidence`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline text-xs"
                            >
                                Lihat
                            </a>
                            <button
                                type="button"
                                onClick={() => {
                                    confirm({
                                        title: 'Hapus berkas?',
                                        message: 'Berkas pendukung akan dihapus permanen.',
                                        tone: 'danger',
                                        confirmLabel: 'Hapus',
                                        onConfirm: (done) => {
                                            router.delete(`/assessments/${assessment.id}/evidence`, {
                                                onSuccess: () => setEvidenceName(null),
                                                onFinish: done,
                                            });
                                        },
                                    });
                                }}
                                className="text-red-500 hover:underline text-xs"
                            >
                                Hapus
                            </button>
                        </div>
                    )}

                    {!evidenceName && (
                        <FilePond
                            files={pondFiles}
                            onupdatefiles={setPondFiles}
                            allowMultiple={false}
                            acceptedFileTypes={['application/pdf', 'image/jpeg', 'image/png', 'image/webp']}
                            maxFileSize="10MB"
                            labelIdle='Seret & lepas berkas atau <span class="filepond--label-action">Pilih File</span>'
                            server={{
                                process: {
                                    url: `/assessments/${assessment.id}/evidence`,
                                    method: 'POST',
                                    withCredentials: true,
                                    ondata: (formData) => {
                                        // FilePond sends as 'filepond' key; rename to 'evidence'
                                        const file = (formData as any).get('filepond');
                                        const newForm = new FormData();
                                        newForm.append('evidence', file);
                                        return newForm;
                                    },
                                    onload: (response) => {
                                        const data = JSON.parse(response);
                                        setEvidenceName(data.name);
                                        return data.path;
                                    },
                                },
                                revert: {
                                    url: `/assessments/${assessment.id}/evidence`,
                                    method: 'DELETE',
                                    withCredentials: true,
                                    onload: (response: any) => {
                                        setEvidenceName(null);
                                        return response;
                                    },
                                },
                            }}
                        />
                    )}
                </div>

                {canSubmit && (
                    <div className="rounded-lg border bg-white p-6 shadow-sm space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700">Ajukan ke Wali Kelas</h3>
                        <textarea
                            rows={2}
                            value={submitComment}
                            onChange={e => setSubmitComment(e.target.value)}
                            placeholder="Catatan pengajuan (opsional)"
                            className="block w-full rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="rounded-md bg-emerald-600 px-5 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                            {submitting ? 'Mengajukan...' : 'Ajukan Penilaian'}
                        </button>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
