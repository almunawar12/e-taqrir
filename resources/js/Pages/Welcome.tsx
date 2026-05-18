import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

const features = [
    {
        title: 'Penilaian Lengkap',
        desc: 'Akademik, Tahfiz, Sikap/Ibadah, Kehadiran, dan Ekstrakurikuler dalam satu platform terintegrasi.',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
        ),
    },
    {
        title: 'Import Massal Cerdas',
        desc: 'Upload CSV/Excel dengan preview, pemetaan kolom otomatis, dan laporan error per baris.',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
        ),
    },
    {
        title: 'Workflow Persetujuan',
        desc: 'Alur Guru → Wali Kelas → Admin dengan audit trail lengkap dan notifikasi otomatis.',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
            </svg>
        ),
    },
    {
        title: 'Raport PDF Siap Cetak',
        desc: 'Generate PDF berkualitas tinggi, arsip otomatis ke cloud, distribusi langsung via email.',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
        ),
    },
    {
        title: 'Notifikasi Email',
        desc: 'Wali santri diberitahu otomatis saat raport terbit, lengkap dengan link unduh aman.',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
        ),
    },
    {
        title: 'Akses Berbasis Peran',
        desc: 'Empat level akses: Super Admin, Wali Kelas, Guru Mapel, dan Wali Santri dengan RBAC ketat.',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
        ),
    },
];

export default function Welcome({ auth }: PageProps) {
    return (
        <>
            <Head title="E-Taqrir — Platform Raport Pesantren Digital">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,400;1,9..144,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
                <style>{`
                    :root {
                        --green-deep: #004532;
                        --green-mid: #16a34a;
                        --green-pale: #f0faf4;
                        --green-light: #dcfce7;
                    }
                    .font-display { font-family: 'Fraunces', Georgia, serif; }
                    .font-body   { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

                    @keyframes fadeUp {
                        from { opacity: 0; transform: translateY(24px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to   { opacity: 1; }
                    }
                    .anim-1 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
                    .anim-2 { animation: fadeUp 0.7s 0.1s cubic-bezier(0.16,1,0.3,1) both; }
                    .anim-3 { animation: fadeUp 0.7s 0.2s cubic-bezier(0.16,1,0.3,1) both; }
                    .anim-4 { animation: fadeUp 0.7s 0.35s cubic-bezier(0.16,1,0.3,1) both; }
                    .anim-dash { animation: fadeIn 0.8s 0.4s cubic-bezier(0.16,1,0.3,1) both; }

                    .hero-dot-bg {
                        background-image: radial-gradient(circle, #00453218 1px, transparent 1px);
                        background-size: 28px 28px;
                    }
                    .feat-card:hover {
                        box-shadow: 0 8px 32px rgba(0,69,50,0.10);
                        border-color: #16a34a40;
                        transform: translateY(-2px);
                    }
                    .feat-card { transition: all 0.2s ease; }

                    .step-connector::after {
                        content: '';
                        position: absolute;
                        top: 28px;
                        left: calc(100% + 4px);
                        width: calc(100% - 8px);
                        height: 1px;
                        border-top: 2px dashed #16a34a60;
                    }
                `}</style>
            </Head>

            <div className="font-body min-h-screen bg-white text-slate-900 antialiased">

                {/* ── NAVBAR ─────────────────────────────────────────── */}
                <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                        <div className="font-display flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#004532] text-sm font-black text-white">E</span>
                            <span>E-Taqrir</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-lg bg-[#004532] px-5 py-2 text-sm font-600 text-white transition hover:bg-[#003828]"
                                >
                                    Dashboard →
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-lg bg-[#004532] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#003828]"
                                    >
                                        Masuk
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* ── HERO ───────────────────────────────────────────── */}
                <section className="hero-dot-bg relative overflow-hidden border-b border-slate-100 bg-[#f8faf9] py-20 md:py-28">
                    <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-2">

                        {/* Left: copy */}
                        <div>
                            <div className="anim-1 mb-5 inline-flex items-center gap-2 rounded-full border border-[#16a34a30] bg-[#f0faf4] px-3 py-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                                <span className="text-xs font-semibold text-[#16a34a]">Platform Raport Pesantren Digital</span>
                            </div>
                            <h1 className="font-display anim-2 mb-5 text-5xl font-black leading-[1.1] tracking-tight text-slate-900 md:text-6xl">
                                Raport Pesantren,{' '}
                                <em className="not-italic text-[#004532]">Lebih Cepat</em>{' '}
                                &amp; Akurat
                            </h1>
                            <p className="anim-3 mb-8 text-lg leading-relaxed text-slate-500">
                                Ganti spreadsheet manual dengan workflow digital yang terverifikasi. Guru input nilai, Wali Kelas verifikasi, Admin publish — semua dalam satu platform.
                            </p>
                            <div className="anim-4 flex flex-wrap gap-3">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#004532] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#00453230] transition hover:bg-[#003828] hover:shadow-[#00453250]"
                                    >
                                        Buka Dashboard
                                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="inline-flex items-center gap-2 rounded-xl bg-[#004532] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#00453230] transition hover:bg-[#003828]"
                                        >
                                            Masuk ke Sistem
                                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right: dashboard mockup */}
                        <div className="anim-dash">
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200">
                                {/* Window bar */}
                                <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-3">
                                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                                    <span className="ml-3 text-xs font-medium text-slate-400">Dashboard E-Taqrir</span>
                                </div>
                                {/* Content */}
                                <div className="p-4">
                                    {/* Stats row */}
                                    <div className="mb-3 grid grid-cols-3 gap-2">
                                        {[
                                            { num: '248', label: 'Total Santri' },
                                            { num: '32', label: 'Menunggu' },
                                            { num: '186', label: 'Terbit' },
                                        ].map((s) => (
                                            <div key={s.label} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                                                <div className="font-display text-xl font-black text-[#004532]">{s.num}</div>
                                                <div className="text-[10px] text-slate-500">{s.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Table */}
                                    <div className="overflow-hidden rounded-lg border border-slate-100">
                                        <div className="grid grid-cols-3 gap-2 bg-[#f0faf4] px-3 py-1.5">
                                            {['Santri', 'Mapel', 'Status'].map((h) => (
                                                <span key={h} className="text-[9px] font-bold uppercase tracking-wide text-[#004532]">{h}</span>
                                            ))}
                                        </div>
                                        {[
                                            { name: 'Ahmad Fauzi', mapel: 'Fiqih', status: 'Terverifikasi', color: 'bg-green-100 text-green-700' },
                                            { name: 'Siti Aisyah', mapel: 'Tahfiz', status: 'Menunggu', color: 'bg-yellow-100 text-yellow-700' },
                                            { name: 'Umar Hakim', mapel: 'Nahwu', status: 'Draft', color: 'bg-blue-100 text-blue-700' },
                                        ].map((row) => (
                                            <div key={row.name} className="grid grid-cols-3 items-center gap-2 border-t border-slate-50 px-3 py-2">
                                                <span className="text-[11px] font-medium text-slate-700">{row.name}</span>
                                                <span className="text-[11px] text-slate-500">{row.mapel}</span>
                                                <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${row.color}`}>{row.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── WORKFLOW ───────────────────────────────────────── */}
                <section className="border-b border-slate-100 py-20">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="mb-12 text-center">
                            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#16a34a]">Alur Kerja</p>
                            <h2 className="font-display text-4xl font-black text-slate-900">
                                Tiga Tahap, Satu Platform
                            </h2>
                            <p className="mt-3 text-slate-500">Proses persetujuan transparan dari guru hingga wali santri</p>
                        </div>

                        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
                            {[
                                { num: '01', role: 'Guru Mapel', desc: 'Input nilai, upload bukti penilaian, dan submit assessment untuk diverifikasi', icon: '✏️', state: 'draft → submitted' },
                                { num: '02', role: 'Wali Kelas', desc: 'Review seluruh nilai kelas, verifikasi atau kembalikan dengan catatan koreksi', icon: '✅', state: 'submitted → verified' },
                                { num: '03', role: 'Super Admin', desc: 'Publish raport PDF ke seluruh wali santri disertai notifikasi email otomatis', icon: '📄', state: 'verified → published' },
                            ].map((step, i) => (
                                <div key={step.num} className="relative rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
                                    {i < 2 && (
                                        <div className="absolute -right-3 top-10 z-10 hidden md:flex h-6 w-6 items-center justify-center rounded-full border border-[#16a34a30] bg-[#f0faf4]">
                                            <svg className="w-3 h-3 text-[#16a34a]" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="mb-4 flex items-start justify-between">
                                        <span className="font-display text-5xl font-black text-slate-100">{step.num}</span>
                                        <span className="text-2xl">{step.icon}</span>
                                    </div>
                                    <h3 className="font-display mb-2 text-xl font-bold text-slate-900">{step.role}</h3>
                                    <p className="mb-4 text-sm leading-relaxed text-slate-500">{step.desc}</p>
                                    <code className="rounded-md bg-[#f0faf4] px-2.5 py-1 text-[10px] font-mono font-semibold text-[#16a34a]">{step.state}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FEATURES ───────────────────────────────────────── */}
                <section className="bg-slate-50/50 py-20">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="mb-12 text-center">
                            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#16a34a]">Fitur Utama</p>
                            <h2 className="font-display text-4xl font-black text-slate-900">
                                Semua yang Dibutuhkan Pesantren
                            </h2>
                            <p className="mt-3 text-slate-500">Dirancang khusus untuk kebutuhan administrasi pesantren modern</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feat) => (
                                <div key={feat.title} className="feat-card rounded-2xl border border-slate-100 bg-white p-6">
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#004532] text-white">
                                        {feat.icon}
                                    </div>
                                    <h3 className="font-display mb-2 text-lg font-bold text-slate-900">{feat.title}</h3>
                                    <p className="text-sm leading-relaxed text-slate-500">{feat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── STATS ──────────────────────────────────────────── */}
                <section className="bg-[#004532] py-16">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
                            {[
                                { num: '40%', label: 'Lebih cepat dibanding proses manual' },
                                { num: '95%+', label: 'Tingkat keberhasilan import data' },
                                { num: '100%', label: 'Raport terarsip dan dapat diunduh' },
                            ].map((stat) => (
                                <div key={stat.label}>
                                    <div className="font-display text-5xl font-black text-[#4ade80]">{stat.num}</div>
                                    <p className="mt-2 text-sm text-white/60">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── ROLES ──────────────────────────────────────────── */}
                <section className="border-b border-slate-100 py-20">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="mb-12 text-center">
                            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#16a34a]">Untuk Siapa</p>
                            <h2 className="font-display text-4xl font-black text-slate-900">
                                Satu Platform, Semua Peran
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            {[
                                { role: 'Super Admin', desc: 'Kelola sistem, publish raport, akses penuh ke seluruh data', badge: 'bg-purple-100 text-purple-700' },
                                { role: 'Wali Kelas', desc: 'Verifikasi nilai kelas, monitor progress assessment santri', badge: 'bg-blue-100 text-blue-700' },
                                { role: 'Guru Mapel', desc: 'Input dan submit nilai mata pelajaran dengan bukti penilaian', badge: 'bg-amber-100 text-amber-700' },
                                { role: 'Wali Santri', desc: 'Akses read-only raport resmi yang sudah terbit', badge: 'bg-green-100 text-green-700' },
                            ].map((r) => (
                                <div key={r.role} className="rounded-2xl border border-slate-100 bg-white p-5">
                                    <span className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${r.badge}`}>{r.role}</span>
                                    <p className="text-sm leading-relaxed text-slate-500">{r.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA ────────────────────────────────────────────── */}
                <section className="bg-[#f8faf9] py-24">
                    <div className="mx-auto max-w-2xl px-6 text-center">
                        <h2 className="font-display mb-4 text-5xl font-black leading-tight text-slate-900">
                            Siap Modernisasi<br />
                            <span className="text-[#004532]">Raport Pesantren</span> Anda?
                        </h2>
                        <p className="mb-8 text-lg text-slate-500">
                            Hubungi admin untuk mendapatkan akses ke sistem.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#004532] px-8 py-4 text-sm font-bold text-white shadow-lg shadow-[#00453230] transition hover:bg-[#003828]"
                                >
                                    Buka Dashboard
                                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#004532] px-8 py-4 text-sm font-bold text-white shadow-lg shadow-[#00453230] transition hover:bg-[#003828]"
                                    >
                                        Masuk ke Sistem
                                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ─────────────────────────────────────────── */}
                <footer className="border-t border-slate-100 bg-slate-900 py-8">
                    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
                        <div className="font-display text-lg font-bold text-green-400">E-Taqrir</div>
                        <p className="text-sm text-slate-500">© 2026 E-Taqrir · Platform Raport Pesantren Digital</p>
                    </div>
                </footer>

            </div>
        </>
    );
}
