import { PropsWithChildren } from 'react';

const LOGO_SRC =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBGisl6UJyHM0LfbSrCvGh41KQfO0SZAEM_XIzOWY0b9VHDVIWUaFYRO_w8c0XGJsXSD5QhCrYfW0yxzk-Vt7W_ToEPxdSAeDP0VFW-0FTtqREnB1DsCKs9zZajvyUSMICyQTOT-ubLlUx-_op__0HkGNAok7IUAJRuXnKdbnTfIHNocDoG8B36O8GmmtjZpW_TIuZK8Be0bjFFnXbqnM99ZHXwHoPWcahMTf9s4T_eFfL3h1K0OJdNHbAbppkT9jRHkNs0OvPg6mM';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="relative min-h-screen bg-background font-sans text-on-surface">
            {/* Subtle geometric bg */}
            <div
                className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cg fill='none' stroke='%23006948' stroke-width='0.5' opacity='0.12'%3E%3Cpolygon points='200,20 236,100 320,100 256,152 280,232 200,180 120,232 144,152 80,100 164,100'/%3E%3Ccircle cx='200' cy='200' r='140'/%3E%3Ccircle cx='200' cy='200' r='100'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '400px 400px',
                }}
            />

            <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
                {/* ── LEFT: Brand panel (desktop only) ── */}
                <aside className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col items-center justify-center bg-primary relative overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5" />
                    <div className="absolute -bottom-32 -right-24 w-80 h-80 rounded-full bg-white/5" />
                    <div className="absolute top-1/3 -right-16 w-56 h-56 rounded-full bg-white/5" />

                    <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-sm">
                        <div className="mb-8 flex h-36 w-36 items-center justify-center rounded-full border border-white/20 bg-white/15 shadow-2xl overflow-hidden">
                            <img src={LOGO_SRC} alt="e-Taqrir Logo" className="w-full h-full object-cover scale-110" />
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">e-Taqrir</h2>
                        <p className="text-white/65 text-base leading-relaxed">
                            Integrated Academic Management and Student Reporting System for Habiburrahman
                        </p>
                        <div className="flex items-center gap-2 mt-10">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                            <span className="w-8 h-1 rounded-full bg-white/60" />
                            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                        </div>
                    </div>
                </aside>

                {/* ── RIGHT: Form panel ── */}
                <main className="flex flex-1 flex-col items-center justify-center bg-surface-container-low px-4 py-10 sm:px-8 lg:px-16">

                    {/* Mobile / tablet header */}
                    <div className="flex lg:hidden flex-col items-center mb-8">
                        <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-primary border-4 border-primary/20 overflow-hidden mb-3 shadow-lg">
                            <img src={LOGO_SRC} alt="e-Taqrir Logo" className="w-full h-full object-cover scale-110" />
                        </div>
                        <span className="text-2xl font-bold text-primary tracking-tight">e-Taqrir</span>
                        <span className="text-sm text-on-surface-variant mt-1">Habiburrahman</span>
                    </div>

                    {/* Card */}
                    <div className="w-full max-w-sm sm:max-w-md rounded-2xl border border-outline-variant bg-white shadow-xl p-6 sm:p-8 lg:p-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
