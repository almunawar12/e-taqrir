import { Link, router, usePage } from '@inertiajs/react';
import type { PageProps, RoleName } from '@/types';

interface NavItem {
    label: string;
    href: string;
    icon: string;
    routeName: string;
    roles?: RoleName[];
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard',      href: '/dashboard',   icon: 'dashboard',  routeName: 'dashboard' },
    { label: 'Penilaian',      href: '/assessments',  icon: 'assessment',   routeName: 'assessments.*' },
    { label: 'Nilai Akhir',   href: '/nilai-akhir',  icon: 'grade',        routeName: 'nilai-akhir.*',
      roles: ['guru_mapel'] },
    { label: 'Kelas',          href: '/classrooms',  icon: 'school',     routeName: 'classrooms.*',
      roles: ['super_admin', 'wali_kelas'] },
    { label: 'Santri',         href: '/students',    icon: 'group',      routeName: 'students.*',
      roles: ['super_admin', 'wali_kelas'] },
    { label: 'Mata Pelajaran', href: '/subjects',    icon: 'book',           routeName: 'subjects.*',
      roles: ['super_admin', 'guru_mapel'] },
    { label: 'Pengguna',      href: '/users',       icon: 'manage_accounts', routeName: 'users.*',
      roles: ['super_admin'] },
    { label: 'Raport',       href: '/raport',      icon: 'description',     routeName: 'raport.*',
      roles: ['super_admin', 'wali_kelas'] },
    { label: 'Absensi & Ekskul', href: '/rekap',  icon: 'how_to_reg',      routeName: 'rekap.*',
      roles: ['super_admin', 'wali_kelas'] },
    { label: 'Bobot Nilai',  href: '/bobot',            icon: 'tune',            routeName: 'bobot.*',
      roles: ['super_admin'] },
    { label: 'Identitas Sekolah', href: '/pengaturan/sekolah', icon: 'account_balance', routeName: 'pengaturan.sekolah.*',
      roles: ['super_admin'] },
];

export default function Sidebar({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const { auth } = usePage<PageProps>().props;
    const role = auth.active_role;

    const visible = NAV_ITEMS.filter(
        (item) => !item.roles || (role && item.roles.includes(role)),
    );

    const isActive = (routeName: string) => {
        try {
            return route().current(routeName);
        } catch {
            return false;
        }
    };

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-30 bg-on-surface/40 lg:hidden"
                    onClick={onClose}
                    aria-hidden
                />
            )}

            <aside
                className={`fixed left-0 top-0 z-40 flex h-full w-sidebar-width flex-col gap-2 border-r border-outline-variant bg-surface p-4 shadow-sm transition-transform lg:translate-x-0 ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand */}
                <div className="mb-6 flex items-center gap-3 px-2 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-on-primary">
                        <span className="material-symbols-outlined">school</span>
                    </div>
                    <div>
                        <h1 className="text-headline-md font-bold text-primary">e-Taqrir</h1>
                        <p className="text-label-caps text-on-surface-variant">Habiburrahman</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex flex-1 flex-col gap-1">
                    {visible.map((item) => {
                        const active = isActive(item.routeName);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-body-base transition-all duration-200 ${
                                    active
                                        ? 'bg-primary text-on-primary shadow-md'
                                        : 'text-on-surface-variant hover:bg-surface-container-high'
                                }`}
                            >
                                <span
                                    className="material-symbols-outlined"
                                    style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                                >
                                    {item.icon}
                                </span>
                                <span className={active ? 'font-semibold' : ''}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer nav */}
                <div className="flex flex-col gap-1 border-t border-outline-variant pt-4">
                    <Link
                        href={route('profile.edit')}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-body-base text-on-surface-variant transition-colors hover:bg-surface-container-high"
                    >
                        <span className="material-symbols-outlined">settings</span>
                        <span>Pengaturan</span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => router.post(route('logout'))}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-body-base text-error transition-colors hover:bg-error-container/40"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        <span>Keluar</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
