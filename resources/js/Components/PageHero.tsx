import { ReactNode } from 'react';

/**
 * Hero header — primary gradient strip with title + subtitle.
 * Use at top of section/list pages for consistent visual rhythm.
 */
export default function PageHero({
    title,
    subtitle,
    icon,
    action,
}: {
    title: string;
    subtitle?: string;
    icon?: string;
    action?: ReactNode;
}) {
    return (
        <section className="relative mb-section-margin overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary to-primary-container p-8 shadow-sm">
            {/* Decorative star pattern */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.6'%3E%3Cpolygon points='40,8 47,28 68,28 52,40 58,60 40,48 22,60 28,40 12,28 33,28'/%3E%3Ccircle cx='40' cy='40' r='28'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '80px 80px',
                }}
            />
            <div className="relative flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-start gap-4">
                    {icon && (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/15 text-on-primary">
                            <span className="material-symbols-outlined">{icon}</span>
                        </div>
                    )}
                    <div>
                        <h2 className="text-display-lg font-bold text-on-primary">{title}</h2>
                        {subtitle && (
                            <p className="mt-1 max-w-xl text-body-base text-on-primary/80">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>
        </section>
    );
}
