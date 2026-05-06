import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="relative flex min-h-screen flex-col bg-background font-sans text-on-surface">
            {/* Background geometric pattern */}
            <div
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cg fill='none' stroke='%23006948' stroke-width='0.5' opacity='0.12'%3E%3Cpolygon points='200,20 236,100 320,100 256,152 280,232 200,180 120,232 144,152 80,100 164,100'/%3E%3Cpolygon points='200,50 228,118 300,118 244,158 266,226 200,186 134,226 156,158 100,118 172,118'/%3E%3Ccircle cx='200' cy='200' r='140'/%3E%3Ccircle cx='200' cy='200' r='100'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '400px 400px',
                    opacity: 0.04,
                }}
            />

            <main className="relative z-10 flex flex-1 flex-col md:flex-row">
                {/* Left: Brand panel */}
                <section className="hidden md:flex md:w-1/2 md:flex-col md:items-center md:justify-center md:p-xl bg-primary">
                    <div className="max-w-md text-center">
                        <div className="mx-auto mb-lg flex h-64 w-64 items-center justify-center">
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGisl6UJyHM0LfbSrCvGh41KQfO0SZAEM_XIzOWY0b9VHDVIWUaFYRO_w8c0XGJsXSD5QhCrYfW0yxzk-Vt7W_ToEPxdSAeDP0VFW-0FTtqREnB1DsCKs9zZajvyUSMICyQTOT-ubLlUx-_op__0HkGNAok7IUAJRuXnKdbnTfIHNocDoG8B36O8GmmtjZpW_TIuZK8Be0bjFFnXbqnM99ZHXwHoPWcahMTf9s4T_eFfL3h1K0OJdNHbAbppkT9jRHkNs0OvPg6mM"
                                alt="e-Taqrir Logo"
                                className="w-64 h-64 object-contain border-4 border-on-primary rounded-full bg-surface-container-lowest p-4 shadow-lg"
                            />
                        </div>
                        <h2 className="text-h1 font-h1 text-on-primary mb-md">e-Taqrir</h2>
                        <p className="text-body-lg font-body-lg text-on-primary/70 max-w-sm mx-auto">
                            Integrated Academic Management and Student Reporting System for Habiburrahman
                        </p>
                    </div>
                </section>

                {/* Right: Form panel */}
                <section className="flex w-full items-center justify-center p-md md:w-1/2 md:p-xl">
                    <div className="w-full max-w-md rounded-lg border border-outline-variant bg-surface-container-lowest p-lg shadow-sm md:p-xl">
                        {children}
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="relative z-10 flex w-full flex-col items-center justify-between gap-4 border-t border-outline-variant bg-surface px-xl py-lg md:flex-row md:gap-0">
                <div className="flex flex-col items-center gap-1 md:flex-row md:gap-6">
                    <span className="text-label-caps font-label-caps font-semibold text-on-surface-variant uppercase tracking-wider">
                        e-Taqrir Portal
                    </span>
                    <p className="text-body-sm font-body-sm text-on-surface-variant">
                        © 2024 Habiburrahman Islamic Boarding School. All rights reserved.
                    </p>
                </div>
                <nav className="flex gap-6">
                    {['Privacy Policy', 'Terms of Service', 'Help Center'].map((label) => (
                        <Link
                            key={label}
                            href="#"
                            className="text-body-sm font-body-sm text-on-surface-variant transition-colors hover:text-primary"
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
            </footer>
        </div>
    );
}
