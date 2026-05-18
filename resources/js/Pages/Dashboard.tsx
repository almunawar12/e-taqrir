import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHero from '@/Components/PageHero';
import StatCard from '@/Components/StatCard';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { ActiveContext, PageProps } from '@/types';

// ── TYPES ──────────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = { harian: 'Harian', uts: 'UTS', uas: 'UAS' };

interface AssessmentRow {
    id: number;
    state: string;
    academic_year: string;
    semester: number;
    type: string;
    classroom: { id: number; name: string };
    subject: { id: number; name: string; code: string };
    teacher?: { id: number; name: string };
}

interface AdminStats {
    totals: { classrooms: number; students: number; subjects: number; assessments: number };
    by_state: Record<string, number>;
    recent_assessments: AssessmentRow[];
}

interface WaliKelasStats {
    pending_verification: number;
    verified: number;
    published: number;
    queue: AssessmentRow[];
}

interface GuruStats {
    by_state: Record<string, number>;
    my_assessments: AssessmentRow[];
}

interface Props extends PageProps {
    stats: AdminStats | WaliKelasStats | GuruStats | Record<string, never>;
    role: string;
}

// ── CONSTANTS ──────────────────────────────────────────────────────────────
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

const STATE_DOT: Record<string, string> = {
    draft:     'bg-outline',
    submitted: 'bg-tertiary',
    verified:  'bg-secondary',
    rejected:  'bg-error',
    published: 'bg-primary',
};

// ── REUSABLE UI ────────────────────────────────────────────────────────────
function Card({ title, icon, children, action }: {
    title: string;
    icon?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant p-6">
                <h3 className="flex items-center gap-2 text-headline-md text-on-surface">
                    {icon && <span className="material-symbols-outlined text-primary">{icon}</span>}
                    {title}
                </h3>
                {action}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

function StateBadge({ state }: { state: string }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-label-caps ${STATE_BADGE[state] ?? ''}`}>
            {STATE_LABELS[state] ?? state}
        </span>
    );
}

function AssessmentTable({ rows, showTeacher = false }: { rows: AssessmentRow[]; showTeacher?: boolean }) {
    if (!rows.length) {
        return (
            <div className="rounded-lg border border-dashed border-outline-variant py-12 text-center">
                <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">inbox</span>
                <p className="mt-2 text-body-sm text-on-surface-variant">Belum ada data.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-surface-container-low">
                    <tr>
                        <Th>Kelas</Th>
                        <Th>Mata Pelajaran</Th>
                        <Th>Periode</Th>
                        {showTeacher && <Th>Guru</Th>}
                        <Th>Status</Th>
                        <Th />
                    </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                    {rows.map((row) => (
                        <tr key={row.id} className="transition-colors hover:bg-surface-container-low/50">
                            <Td className="font-semibold text-on-surface">{row.classroom.name}</Td>
                            <Td>
                                <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                                    {row.subject.code}
                                </span>{' '}
                                <span className="text-on-surface-variant">{row.subject.name}</span>
                            </Td>
                            <Td className="text-on-surface-variant">{row.academic_year} · Sem {row.semester} · {TYPE_LABELS[row.type] ?? row.type}</Td>
                            {showTeacher && <Td className="text-on-surface-variant">{row.teacher?.name ?? '—'}</Td>}
                            <Td><StateBadge state={row.state} /></Td>
                            <Td>
                                <Link
                                    href={`/assessments/${row.id}`}
                                    className="inline-flex items-center gap-1 text-button font-semibold text-primary hover:underline"
                                >
                                    Detail
                                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </Link>
                            </Td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Th({ children }: { children?: React.ReactNode }) {
    return <th className="px-4 py-3 text-label-caps uppercase text-on-surface-variant">{children}</th>;
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <td className={`px-4 py-3 text-body-sm ${className}`}>{children}</td>;
}

function ViewAllLink({ href }: { href: string }) {
    return (
        <Link href={href} className="inline-flex items-center gap-1 text-button font-semibold text-primary hover:underline">
            Lihat semua
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
    );
}

function StateDistribution({ counts }: { counts: Record<string, number> }) {
    return (
        <div className="space-y-3">
            {(['draft', 'submitted', 'verified', 'rejected', 'published'] as const).map((s) => (
                <div
                    key={s}
                    className="flex items-center justify-between rounded-lg bg-surface-container-low p-3 transition-colors hover:bg-surface-container"
                >
                    <div className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full ${STATE_DOT[s]}`} />
                        <span className="text-body-base font-medium text-on-surface">{STATE_LABELS[s]}</span>
                    </div>
                    <span className="font-bold text-on-surface">{counts[s] ?? 0}</span>
                </div>
            ))}
        </div>
    );
}

// ── CONTEXT PICKER ─────────────────────────────────────────────────────────
function generateYears(): string[] {
    const current = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => {
        const y = current - 2 + i;
        return `${y}/${y + 1}`;
    });
}

function ContextPicker({ context }: { context: ActiveContext }) {
    const { data, setData, post, processing } = useForm({
        academic_year: context.academic_year ?? '',
        semester:      String(context.semester ?? ''),
    });

    const isSet = !!context.academic_year && !!context.semester;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/context');
    };

    return (
        <div className={`mb-section-margin rounded-xl border p-5 ${
            isSet
                ? 'border-primary/30 bg-primary/5'
                : 'border-tertiary-fixed-dim bg-tertiary-fixed/30'
        }`}>
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">calendar_month</span>
                    <span className="text-body-base font-semibold text-on-surface">
                        {isSet ? 'Periode Aktif' : 'Pilih Periode Terlebih Dahulu'}
                    </span>
                    {isSet && (
                        <span className="rounded-full bg-primary px-3 py-0.5 text-label-caps font-bold text-on-primary">
                            {context.academic_year} · Sem {context.semester}
                        </span>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3 md:ml-auto">
                    <select
                        value={data.academic_year}
                        onChange={(e) => setData('academic_year', e.target.value)}
                        className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="">— Tahun Ajaran —</option>
                        {generateYears().map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>

                    <select
                        value={data.semester}
                        onChange={(e) => setData('semester', e.target.value)}
                        className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="">— Semester —</option>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                    </select>

                    <button
                        type="submit"
                        disabled={processing || !data.academic_year || !data.semester}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-button font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                        <span className="material-symbols-outlined text-[18px]">check</span>
                        {isSet ? 'Ubah' : 'Terapkan'}
                    </button>
                </form>
            </div>

            {!isSet && (
                <p className="mt-2 text-body-sm text-on-surface-variant">
                    Periode aktif digunakan sebagai default saat membuat penilaian baru.
                </p>
            )}
        </div>
    );
}

// ── ROLE DASHBOARDS ────────────────────────────────────────────────────────
function AdminDashboard({ stats, firstName }: { stats: AdminStats; firstName: string }) {
    return (
        <>
            <PageHero
                icon="dashboard"
                title={`Selamat datang, ${firstName}`}
                subtitle="Pantau performa akademik dan manajemen institusi secara real-time."
                action={
                    <Link
                        href="/assessments"
                        className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-5 py-2.5 text-button font-semibold text-on-primary backdrop-blur-sm transition-all hover:bg-white/25"
                    >
                        <span className="material-symbols-outlined">visibility</span>
                        Lihat Penilaian
                    </Link>
                }
            />

            <section className="mb-section-margin grid grid-cols-1 gap-card-gap md:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Kelas"          value={stats.totals.classrooms}  icon="domain"     tone="primary"   badge={`${stats.totals.classrooms} kelas`} />
                <StatCard label="Total Santri"         value={stats.totals.students}    icon="group"      tone="secondary" badge="Aktif" />
                <StatCard label="Total Mata Pelajaran" value={stats.totals.subjects}    icon="menu_book"  tone="tertiary" />
                <StatCard label="Total Penilaian"     value={stats.totals.assessments} icon="fact_check" inverse />
            </section>

            <section className="grid grid-cols-1 gap-card-gap lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <Card title="Status Penilaian" icon="pie_chart">
                        <StateDistribution counts={stats.by_state} />
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card title="Penilaian Terbaru" icon="history" action={<ViewAllLink href="/assessments" />}>
                        <AssessmentTable rows={stats.recent_assessments} showTeacher />
                    </Card>
                </div>
            </section>
        </>
    );
}

function WaliKelasDashboard({ stats, firstName, context }: { stats: WaliKelasStats; firstName: string; context: ActiveContext }) {
    return (
        <>
            <PageHero
                icon="verified"
                title={`Selamat datang, ${firstName}`}
                subtitle="Verifikasi penilaian dari guru pengajar dan publikasikan hasil."
            />

            <ContextPicker context={context} />

            <section className="mb-section-margin grid grid-cols-1 gap-card-gap md:grid-cols-3">
                <StatCard label="Menunggu Verifikasi" value={stats.pending_verification} icon="pending"  tone="tertiary" />
                <StatCard label="Sudah Terverifikasi" value={stats.verified}             icon="verified" tone="secondary" />
                <StatCard label="Dipublikasi"         value={stats.published}            icon="publish"  inverse />
            </section>

            {stats.pending_verification > 0 && (
                <div className="mb-section-margin flex items-center gap-3 rounded-xl border border-tertiary-fixed-dim bg-tertiary-fixed/40 p-4">
                    <span className="material-symbols-outlined text-tertiary">warning</span>
                    <p className="text-body-base text-on-surface">
                        <strong>{stats.pending_verification}</strong> penilaian menunggu verifikasi Anda.
                    </p>
                </div>
            )}

            <Card title="Antrian Verifikasi" icon="task_alt" action={<ViewAllLink href="/assessments?state=submitted" />}>
                <AssessmentTable rows={stats.queue} showTeacher />
            </Card>
        </>
    );
}

function GuruDashboard({ stats, firstName, context }: { stats: GuruStats; firstName: string; context: ActiveContext }) {
    const needsAction = (stats.by_state.draft ?? 0) + (stats.by_state.rejected ?? 0);

    return (
        <>
            <PageHero
                icon="edit_note"
                title={`Selamat datang, ${firstName}`}
                subtitle="Input nilai santri dan ajukan penilaian untuk diverifikasi."
                action={
                    <Link
                        href="/assessments"
                        className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-5 py-2.5 text-button font-semibold text-on-primary backdrop-blur-sm transition-all hover:bg-white/25"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Buat Penilaian
                    </Link>
                }
            />

            <ContextPicker context={context} />

            <section className="mb-section-margin grid grid-cols-2 gap-card-gap lg:grid-cols-5">
                <StatCard label="Draft"         value={stats.by_state.draft     ?? 0} tone="neutral" />
                <StatCard label="Diajukan"      value={stats.by_state.submitted ?? 0} tone="tertiary" />
                <StatCard label="Terverifikasi" value={stats.by_state.verified  ?? 0} tone="secondary" />
                <StatCard label="Ditolak"       value={stats.by_state.rejected  ?? 0} tone="neutral" />
                <StatCard label="Dipublikasi"   value={stats.by_state.published ?? 0} tone="primary" />
            </section>

            {needsAction > 0 && (
                <div className="mb-section-margin flex items-center gap-3 rounded-xl border border-tertiary-fixed-dim bg-tertiary-fixed/40 p-4">
                    <span className="material-symbols-outlined text-tertiary">info</span>
                    <p className="text-body-base text-on-surface">
                        <strong>{needsAction}</strong> penilaian perlu tindakan (draft belum diajukan / ditolak).
                    </p>
                </div>
            )}

            <Card title="Penilaian Saya" icon="assignment" action={<ViewAllLink href="/assessments" />}>
                <AssessmentTable rows={stats.my_assessments} />
            </Card>
        </>
    );
}

function WaliSantriDashboard() {
    return (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">description</span>
            <p className="mt-3 text-body-base text-on-surface-variant">
                Rapor belum tersedia. Hubungi pihak pesantren.
            </p>
        </div>
    );
}

// ── ROOT ───────────────────────────────────────────────────────────────────
export default function Dashboard() {
    const { stats, role, auth, context } = usePage<Props>().props;
    const firstName = auth.user.name.split(' ')[0];

    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard" />
            {role === 'super_admin' && <AdminDashboard     stats={stats as AdminStats}     firstName={firstName} />}
            {role === 'wali_kelas'  && <WaliKelasDashboard stats={stats as WaliKelasStats} firstName={firstName} context={context} />}
            {role === 'guru_mapel'  && <GuruDashboard      stats={stats as GuruStats}      firstName={firstName} context={context} />}
            {role === 'wali_santri' && <WaliSantriDashboard />}
        </AuthenticatedLayout>
    );
}
