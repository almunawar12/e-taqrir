import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

// ── TYPES ──────────────────────────────────────────────────────────────────
interface AssessmentRow {
    id: number;
    state: string;
    academic_year: string;
    semester: number;
    classroom: { id: number; name: string };
    subject: { id: number; name: string; code: string };
    teacher?: { id: number; name: string };
    submitted_at?: string;
    updated_at?: string;
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
    draft:     'bg-surface-container text-on-surface-variant',
    submitted: 'bg-amber-100 text-amber-800',
    verified:  'bg-blue-100 text-blue-800',
    rejected:  'bg-error-container text-on-error-container',
    published: 'bg-primary-fixed text-primary',
};

// ── REUSABLE UI ────────────────────────────────────────────────────────────
function Section({
    title,
    action,
    children,
}: {
    title: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-md">
            <div className="flex items-center justify-between">
                <h3 className="text-label-caps font-label-caps uppercase tracking-wider text-on-surface-variant">
                    {title}
                </h3>
                {action}
            </div>
            {children}
        </section>
    );
}

function StatCard({
    label,
    value,
    icon,
    accent = 'primary',
}: {
    label: string;
    value: number;
    icon?: string;
    accent?: 'primary' | 'amber' | 'blue' | 'error' | 'neutral';
}) {
    const accentStyles: Record<string, string> = {
        primary: 'text-primary',
        amber:   'text-amber-600',
        blue:    'text-blue-600',
        error:   'text-error',
        neutral: 'text-on-surface-variant',
    };

    return (
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-lg shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-label-caps font-label-caps uppercase tracking-wider text-on-surface-variant">
                        {label}
                    </p>
                    <p className="mt-xs text-h1 font-h1 text-on-surface">{value}</p>
                </div>
                {icon && (
                    <span className={`material-symbols-outlined text-[28px] ${accentStyles[accent]}`}>
                        {icon}
                    </span>
                )}
            </div>
        </div>
    );
}

function StateBadge({ state }: { state: string }) {
    return (
        <span
            className={`inline-flex rounded-full px-sm py-0.5 text-label-caps font-label-caps font-medium ${
                STATE_BADGE[state] ?? 'bg-surface-container text-on-surface-variant'
            }`}
        >
            {STATE_LABELS[state] ?? state}
        </span>
    );
}

function AssessmentTable({
    rows,
    showTeacher = false,
}: {
    rows: AssessmentRow[];
    showTeacher?: boolean;
}) {
    if (!rows.length) {
        return (
            <div className="rounded-lg border border-outline-variant bg-surface-container-lowest py-xl text-center">
                <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">
                    inbox
                </span>
                <p className="mt-xs text-body-sm font-body-sm text-on-surface-variant">
                    Tidak ada data.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full">
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
                            <tr key={row.id} className="transition-colors hover:bg-surface-container-low">
                                <Td className="font-medium text-on-surface">{row.classroom.name}</Td>
                                <Td className="text-on-surface-variant">
                                    <span className="font-mono text-xs text-primary">[{row.subject.code}]</span>{' '}
                                    {row.subject.name}
                                </Td>
                                <Td className="text-on-surface-variant">
                                    {row.academic_year} / Sem {row.semester}
                                </Td>
                                {showTeacher && <Td className="text-on-surface-variant">{row.teacher?.name ?? '—'}</Td>}
                                <Td>
                                    <StateBadge state={row.state} />
                                </Td>
                                <Td>
                                    <Link
                                        href={`/assessments/${row.id}`}
                                        className="inline-flex items-center gap-1 text-button font-button text-primary hover:underline"
                                    >
                                        Detail
                                        <span className="material-symbols-outlined text-[14px]">
                                            arrow_forward
                                        </span>
                                    </Link>
                                </Td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Th({ children }: { children?: React.ReactNode }) {
    return (
        <th className="px-md py-sm text-left text-label-caps font-label-caps uppercase tracking-wider text-on-surface-variant">
            {children}
        </th>
    );
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <td className={`px-md py-sm text-body-sm font-body-sm ${className}`}>{children}</td>;
}

function Banner({
    icon,
    children,
    tone = 'info',
}: {
    icon: string;
    children: React.ReactNode;
    tone?: 'info' | 'warning';
}) {
    const styles = tone === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-outline-variant bg-surface-container-low text-on-surface-variant';
    return (
        <div className={`flex items-center gap-sm rounded-lg border px-md py-sm ${styles}`}>
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            <span className="text-body-sm font-body-sm">{children}</span>
        </div>
    );
}

function ViewAllLink({ href }: { href: string }) {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-1 text-button font-button text-primary hover:underline"
        >
            Lihat semua
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
    );
}

// ── ROLE DASHBOARDS ────────────────────────────────────────────────────────
function AdminDashboard({ stats }: { stats: AdminStats }) {
    return (
        <div className="space-y-xl">
            <Section title="Master Data">
                <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Kelas"          value={stats.totals.classrooms}  icon="class"        accent="primary" />
                    <StatCard label="Santri"         value={stats.totals.students}    icon="groups"       accent="blue" />
                    <StatCard label="Mata Pelajaran" value={stats.totals.subjects}    icon="menu_book"    accent="neutral" />
                    <StatCard label="Total Penilaian" value={stats.totals.assessments} icon="assignment" accent="primary" />
                </div>
            </Section>

            <Section title="Status Penilaian">
                <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard label="Draft"         value={stats.by_state.draft     ?? 0} accent="neutral" />
                    <StatCard label="Diajukan"      value={stats.by_state.submitted ?? 0} accent="amber" />
                    <StatCard label="Terverifikasi" value={stats.by_state.verified  ?? 0} accent="blue" />
                    <StatCard label="Ditolak"       value={stats.by_state.rejected  ?? 0} accent="error" />
                    <StatCard label="Dipublikasi"   value={stats.by_state.published ?? 0} accent="primary" />
                </div>
            </Section>

            <Section title="Penilaian Terbaru" action={<ViewAllLink href="/assessments" />}>
                <AssessmentTable rows={stats.recent_assessments} showTeacher />
            </Section>
        </div>
    );
}

function WaliKelasDashboard({ stats }: { stats: WaliKelasStats }) {
    return (
        <div className="space-y-xl">
            <Section title="Ringkasan">
                <div className="grid gap-md sm:grid-cols-3">
                    <StatCard label="Menunggu Verifikasi" value={stats.pending_verification} icon="pending"   accent="amber" />
                    <StatCard label="Sudah Terverifikasi" value={stats.verified}             icon="verified"  accent="blue" />
                    <StatCard label="Dipublikasi"         value={stats.published}            icon="publish"   accent="primary" />
                </div>
            </Section>

            {stats.pending_verification > 0 && (
                <Banner icon="warning" tone="warning">
                    {stats.pending_verification} penilaian menunggu verifikasi Anda.
                </Banner>
            )}

            <Section title="Antrian Verifikasi" action={<ViewAllLink href="/assessments?state=submitted" />}>
                <AssessmentTable rows={stats.queue} showTeacher />
            </Section>
        </div>
    );
}

function GuruDashboard({ stats }: { stats: GuruStats }) {
    const needsAction = (stats.by_state.draft ?? 0) + (stats.by_state.rejected ?? 0);

    return (
        <div className="space-y-xl">
            <Section
                title="Penilaian Saya"
                action={
                    <Link
                        href="/assessments/create"
                        className="inline-flex items-center gap-1 rounded-lg bg-primary-container px-md py-sm text-button font-button text-on-primary-container shadow-sm transition-all hover:opacity-90"
                    >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Buat Penilaian
                    </Link>
                }
            >
                <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard label="Draft"         value={stats.by_state.draft     ?? 0} accent="neutral" />
                    <StatCard label="Diajukan"      value={stats.by_state.submitted ?? 0} accent="amber" />
                    <StatCard label="Terverifikasi" value={stats.by_state.verified  ?? 0} accent="blue" />
                    <StatCard label="Ditolak"       value={stats.by_state.rejected  ?? 0} accent="error" />
                    <StatCard label="Dipublikasi"   value={stats.by_state.published ?? 0} accent="primary" />
                </div>
            </Section>

            {needsAction > 0 && (
                <Banner icon="info" tone="warning">
                    {needsAction} penilaian perlu tindakan (draft belum diajukan / ditolak).
                </Banner>
            )}

            <Section title="Penilaian Terkini" action={<ViewAllLink href="/assessments" />}>
                <AssessmentTable rows={stats.my_assessments} />
            </Section>
        </div>
    );
}

function WaliSantriDashboard() {
    return (
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-xl text-center shadow-sm">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">
                description
            </span>
            <p className="mt-xs text-body-md font-body-md text-on-surface-variant">
                Rapor belum tersedia. Hubungi pihak pesantren.
            </p>
        </div>
    );
}

// ── ROOT ───────────────────────────────────────────────────────────────────
function greeting(): string {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 18) return 'Selamat sore';
    return 'Selamat malam';
}

export default function Dashboard() {
    const { stats, role, auth } = usePage<Props>().props;
    const firstName = auth.user.name.split(' ')[0];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col">
                    <span className="text-h3 font-h3 text-on-surface">
                        {greeting()}, {firstName}
                    </span>
                    <span className="text-body-sm font-body-sm text-on-surface-variant">
                        Ringkasan aktivitas hari ini
                    </span>
                </div>
            }
        >
            <Head title="Dashboard" />
            <div className="mx-auto max-w-container-max">
                {role === 'super_admin' && <AdminDashboard     stats={stats as AdminStats} />}
                {role === 'wali_kelas'  && <WaliKelasDashboard stats={stats as WaliKelasStats} />}
                {role === 'guru_mapel'  && <GuruDashboard      stats={stats as GuruStats} />}
                {role === 'wali_santri' && <WaliSantriDashboard />}
            </div>
        </AuthenticatedLayout>
    );
}
