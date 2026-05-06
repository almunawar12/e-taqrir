type Tone = 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'accent';

const TONE: Record<Tone, { bg: string; fg: string }> = {
    primary:   { bg: 'bg-primary-fixed/40',         fg: 'text-primary' },
    secondary: { bg: 'bg-secondary-container/30',   fg: 'text-secondary' },
    tertiary:  { bg: 'bg-tertiary-fixed/40',        fg: 'text-tertiary' },
    neutral:   { bg: 'bg-surface-container-high',   fg: 'text-on-surface-variant' },
    accent:    { bg: 'bg-primary',                  fg: 'text-on-primary' },
};

export default function StatCard({
    label,
    value,
    icon,
    tone = 'primary',
    badge,
    inverse = false,
}: {
    label: string;
    value: string | number;
    icon?: string;
    tone?: Tone;
    badge?: string;
    /** Solid primary card with white text (highlight stat). */
    inverse?: boolean;
}) {
    if (inverse) {
        return (
            <div className="rounded-xl bg-primary p-6 text-on-primary shadow-md transition-all hover:brightness-110">
                <div className="mb-4 flex items-start justify-between">
                    {icon && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 text-on-primary">
                            <span className="material-symbols-outlined text-[26px]">{icon}</span>
                        </div>
                    )}
                    {badge && (
                        <span className="text-body-sm font-bold text-primary-fixed">{badge}</span>
                    )}
                </div>
                <p className="text-label-caps uppercase opacity-80">{label}</p>
                <p className="mt-1 text-data-point">{value}</p>
            </div>
        );
    }

    const t = TONE[tone];
    return (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex items-start justify-between">
                {icon && (
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${t.bg} ${t.fg}`}>
                        <span className="material-symbols-outlined text-[26px]">{icon}</span>
                    </div>
                )}
                {badge && (
                    <span className={`text-body-sm font-bold ${t.fg}`}>{badge}</span>
                )}
            </div>
            <p className="text-label-caps uppercase text-on-surface-variant">{label}</p>
            <p className="mt-1 text-data-point text-on-surface">{value}</p>
        </div>
    );
}
