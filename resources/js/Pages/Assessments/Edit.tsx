import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useConfirm } from '@/hooks/useConfirm';
import { Head, router, usePage } from '@inertiajs/react';
import { FormEvent, useRef, useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import 'filepond/dist/filepond.min.css';
import type { PageProps } from '@/types';

registerPlugin(FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

interface Student { id: number; nis: string; name: string; gender: 'L' | 'P' }

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
    type: string;
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
}

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

export default function AssessmentEdit() {
    const { assessment } = usePage<Props>().props;

    const [scores, setScores] = useState<Record<number, string>>(
        Object.fromEntries(assessment.items.map((i) => [i.student_id, i.score ?? ''])),
    );
    const [notes, setNotes] = useState<Record<number, string>>(
        Object.fromEntries(assessment.items.map((i) => [i.student_id, i.notes ?? ''])),
    );
    const [saving, setSaving] = useState(false);
    const importRef      = useRef<HTMLInputElement>(null);
    const [importError, setImportError] = useState<string | null>(null);
    const [evidenceName, setEvidenceName] = useState<string | null>(assessment.evidence_name);
    const [pondFiles, setPondFiles] = useState<unknown[]>([]);
    const { confirm, dialog } = useConfirm();

    const persistScores = () => {
        setSaving(true);
        const items = assessment.items.map((item) => ({
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
            onConfirm: (done) => { persistScores(); done(); },
        });
    };

    const handleDeleteEvidence = () => {
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
    };

    const handleImport = (file: File) => {
        setImportError(null);
        confirm({
            title: 'Upload nilai dari Excel?',
            message: 'Nilai dan catatan akan diperbarui sesuai isi file. Data yang sudah ada akan ditimpa.',
            tone: 'primary',
            icon: 'upload_file',
            confirmLabel: 'Upload & Perbarui',
            onConfirm: (done) => {
                const fd = new FormData();
                fd.append('scores_file', file);
                router.post(`/assessments/${assessment.id}/scores/import`, fd, {
                    onSuccess: () => { router.reload({ only: ['assessment'] }); done(); },
                    onError: (errs) => { setImportError(String(errs.scores_file ?? 'Upload gagal.')); done(); },
                });
            },
        });
    };

    const isRejected = assessment.state === 'rejected';
    const lastRejection = isRejected
        ? [...assessment.approvals].reverse().find((a) => a.to_state === 'rejected')
        : null;

    return (
        <AuthenticatedLayout header="Input Nilai">
            <Head title="Input Nilai" />
            {dialog}

            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header card */}
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
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-label-caps ${STATE_BADGE[assessment.state] ?? ''}`}>
                        {STATE_LABELS[assessment.state] ?? assessment.state}
                    </span>
                </div>

                {/* Rejection notice */}
                {isRejected && lastRejection && (
                    <div className="flex items-start gap-3 rounded-xl border border-error/20 bg-error-container/40 p-4">
                        <span className="material-symbols-outlined text-error">error</span>
                        <div>
                            <p className="text-body-base font-semibold text-on-error-container">
                                Penilaian ditolak oleh {lastRejection.user.name}
                            </p>
                            {lastRejection.comment && (
                                <p className="mt-1 text-body-sm text-on-surface">{lastRejection.comment}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Score input table */}
                <form onSubmit={handleSave} className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-low px-6 py-4">
                        <div>
                            <h3 className="text-headline-md text-on-surface">Daftar Nilai</h3>
                            <span className="text-body-sm text-on-surface-variant">{assessment.items.length} santri</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={`/assessments/${assessment.id}/scores/template`}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-primary px-4 py-2 text-button font-semibold text-primary transition-colors hover:bg-primary/5"
                            >
                                <span className="material-symbols-outlined text-[18px]">download</span>
                                Download Template
                            </a>
                            <button
                                type="button"
                                onClick={() => importRef.current?.click()}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-secondary-container px-4 py-2 text-button font-semibold text-on-secondary-container transition-colors hover:brightness-95"
                            >
                                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                                Upload Excel
                            </button>
                            <input
                                ref={importRef}
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) { handleImport(file); e.target.value = ''; }
                                }}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-surface-container-low text-on-surface-variant">
                                <tr>
                                    <th className="w-12 px-4 py-3 text-label-caps">#</th>
                                    <th className="px-4 py-3 text-label-caps">NIS</th>
                                    <th className="px-4 py-3 text-label-caps">Nama Santri</th>
                                    <th className="w-32 px-4 py-3 text-label-caps">Nilai (0-100)</th>
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
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={scores[item.student_id]}
                                                onChange={(e) =>
                                                    setScores((p) => ({ ...p, [item.student_id]: e.target.value }))
                                                }
                                                placeholder="—"
                                                className="w-24 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                value={notes[item.student_id]}
                                                onChange={(e) =>
                                                    setNotes((p) => ({ ...p, [item.student_id]: e.target.value }))
                                                }
                                                placeholder="Opsional"
                                                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-outline-variant bg-surface-container-low px-6 py-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-button font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-60"
                        >
                            {saving && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                            <span className="material-symbols-outlined text-[18px]">save</span>
                            {saving ? 'Menyimpan...' : 'Simpan Nilai'}
                        </button>
                    </div>
                </form>

                {importError && (
                    <div className="flex items-center gap-2 rounded-xl border border-error/20 bg-error-container/40 px-4 py-3 text-body-sm text-on-error-container">
                        <span className="material-symbols-outlined text-error">error</span>
                        {importError}
                    </div>
                )}

                {/* Evidence upload */}
                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
                    <h3 className="text-headline-md text-on-surface">Berkas Pendukung</h3>
                    <p className="text-body-sm text-on-surface-variant">PDF, JPG, PNG, WebP — maks 10 MB. Opsional.</p>

                    {evidenceName ? (
                        <div className="mt-4 flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3">
                            <span className="material-symbols-outlined text-primary">attach_file</span>
                            <span className="flex-1 truncate text-body-sm text-on-surface">{evidenceName}</span>
                            <a
                                href={`/assessments/${assessment.id}/evidence`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg px-3 py-1.5 text-button font-semibold text-primary transition-colors hover:bg-primary/10"
                            >
                                Lihat
                            </a>
                            <button
                                type="button"
                                onClick={handleDeleteEvidence}
                                className="rounded-lg px-3 py-1.5 text-button font-semibold text-error transition-colors hover:bg-error/10"
                            >
                                Hapus
                            </button>
                        </div>
                    ) : (
                        <div className="mt-4">
                            <FilePond
                                files={pondFiles as never}
                                onupdatefiles={setPondFiles as never}
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
                                            const file = (formData as FormData).get('filepond');
                                            const newForm = new FormData();
                                            if (file) newForm.append('evidence', file);
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
                                        onload: (response) => {
                                            setEvidenceName(null);
                                            return response;
                                        },
                                    },
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Submission is done via menu Nilai Akhir, not here */}
            </div>
        </AuthenticatedLayout>
    );
}
