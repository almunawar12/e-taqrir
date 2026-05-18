import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHero from '@/Components/PageHero';
import { Head, Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

interface TypeInfo {
    id: number;
    state: string;
    filled: number;
    total: number;
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
    final_assessment: { id: number; state: string } | null;
    can_submit:       boolean;
}

interface Props extends PageProps { groups: Group[] }

const FINAL_STATE_BADGE: Record<string, string> = {
    draft:     'bg-surface-container-high text-on-surface-variant',
    submitted: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    verified:  'bg-secondary-container text-on-secondary-container',
    rejected:  'bg-error-container text-on-error-container',
    published: 'bg-primary/10 text-primary',
};
const FINAL_STATE_LABELS: Record<string, string> = {
    draft: 'Draft', submitted: 'Diajukan', verified: 'Terverifikasi',
    rejected: 'Ditolak', published: 'Dipublikasi',
};

function TypeDot({ info }: { info: TypeInfo | null }) {
    if (!info) {
        return <span className="inline-block h-2 w-2 rounded-full bg-surface-container-high" title="Belum dibuat" />;
    }
    const allFilled = info.filled === info.total && info.total > 0;
    return (
        <span
            className={`inline-block h-2 w-2 rounded-full ${allFilled ? 'bg-primary' : 'bg-tertiary'}`}
            title={`${info.filled}/${info.total} terisi`}
        />
    );
}

function GroupRow({ group }: { group: Group }) {
    const finalState = group.final_assessment?.state ?? null;
    const hInfo = group.by_type.harian;
    const uInfo = group.by_type.uts;
    const aInfo = group.by_type.uas;

    const totalStudents = Math.max(
        hInfo?.total ?? 0,
        uInfo?.total ?? 0,
        aInfo?.total ?? 0,
    );
    const hasAll = !!(hInfo && uInfo && aInfo);

    return (
        <Link
            href={`/nilai-akhir/${group.classroom.id}/${group.subject.id}`}
            className="flex items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest px-5 py-4 shadow-sm transition-all hover:border-primary/40 hover:bg-surface-container-low"
        >
            {/* Subject badge */}
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <span className="material-symbols-outlined text-[20px] text-primary">menu_book</span>
            </div>

            {/* Main info */}
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs font-bold text-primary">
                        {group.subject.code}
                    </span>
                    <span className="text-body-base font-semibold text-on-surface">{group.subject.name}</span>
                </div>
                <p className="mt-0.5 text-body-sm text-on-surface-variant">
                    {group.classroom.name} · {group.academic_year} · Semester {group.semester}
                </p>
            </div>

            {/* Type dots */}
            <div className="hidden flex-shrink-0 items-center gap-3 sm:flex">
                <div className="flex items-center gap-1.5">
                    <TypeDot info={hInfo} />
                    <span className="text-label-sm text-on-surface-variant">NH</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <TypeDot info={uInfo} />
                    <span className="text-label-sm text-on-surface-variant">NTS</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <TypeDot info={aInfo} />
                    <span className="text-label-sm text-on-surface-variant">NAS</span>
                </div>
            </div>

            {/* Student count */}
            <div className="hidden flex-shrink-0 text-right sm:block">
                <p className="text-label-sm text-on-surface-variant">{totalStudents} santri</p>
            </div>

            {/* Status */}
            <div className="flex-shrink-0">
                {finalState ? (
                    <span className={`rounded-full px-3 py-1 text-label-caps ${FINAL_STATE_BADGE[finalState] ?? ''}`}>
                        {FINAL_STATE_LABELS[finalState] ?? finalState}
                    </span>
                ) : group.can_submit ? (
                    <span className="rounded-full bg-primary px-3 py-1 text-label-caps text-on-primary">
                        Siap Diajukan
                    </span>
                ) : (
                    <span className="rounded-full bg-surface-container-high px-3 py-1 text-label-caps text-on-surface-variant">
                        {hasAll ? 'Lengkapi Nilai' : 'Belum Lengkap'}
                    </span>
                )}
            </div>

            <span className="material-symbols-outlined flex-shrink-0 text-[20px] text-on-surface-variant">
                chevron_right
            </span>
        </Link>
    );
}

export default function AssessmentFinal() {
    const { groups, context } = usePage<Props>().props;

    return (
        <AuthenticatedLayout header="Nilai Akhir">
            <Head title="Nilai Akhir" />

            <PageHero
                icon="grade"
                title="Nilai Akhir Per Mapel"
                subtitle="Pilih mata pelajaran untuk review nilai dan mengajukan ke wali kelas."
            />

            {!context.academic_year || !context.semester ? (
                <div className="flex items-center gap-3 rounded-xl border border-tertiary-fixed-dim bg-tertiary-fixed/30 px-5 py-4">
                    <span className="material-symbols-outlined text-tertiary">warning</span>
                    <p className="text-body-base text-on-surface">
                        Periode belum diset.{' '}
                        <a href="/dashboard" className="font-semibold text-primary hover:underline">
                            Set periode di Dashboard
                        </a>{' '}
                        untuk memfilter penilaian.
                    </p>
                </div>
            ) : (
                <div className="mb-6 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-5 py-3">
                    <span className="material-symbols-outlined text-primary">calendar_month</span>
                    <span className="text-body-sm text-on-surface">
                        Periode aktif: <strong>{context.academic_year} · Semester {context.semester}</strong>
                    </span>
                    <a href="/dashboard" className="ml-auto text-body-sm text-primary hover:underline">Ubah</a>
                </div>
            )}

            {groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant py-20 text-center">
                    <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">grade</span>
                    <p className="mt-3 text-body-base text-on-surface-variant">
                        Belum ada penilaian untuk periode ini.
                    </p>
                    <p className="mt-1 text-body-sm text-on-surface-variant">
                        Input nilai Harian, UTS, dan UAS di menu{' '}
                        <a href="/assessments" className="font-semibold text-primary hover:underline">Penilaian</a>{' '}
                        terlebih dahulu.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {groups.map((g, i) => (
                        <GroupRow key={i} group={g} />
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
