import { Link, usePage } from '@inertiajs/react';
import type { PageProps, RoleName } from '@/types';

interface NavItem {
    label: string;
    href: string;
    icon: string;
    routeName: string;
    roles?: RoleName[];
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard',      href: '/dashboard',   icon: 'dashboard',    routeName: 'dashboard' },
    { label: 'Penilaian',      href: '/assessments', icon: 'assignment',   routeName: 'assessments.*' },
    { label: 'Kelas',          href: '/classrooms',  icon: 'class',        routeName: 'classrooms.*',
      roles: ['super_admin', 'wali_kelas'] },
    { label: 'Santri',         href: '/students',    icon: 'groups',       routeName: 'students.*',
      roles: ['super_admin', 'wali_kelas'] },
    { label: 'Mata Pelajaran', href: '/subjects',    icon: 'menu_book',    routeName: 'subjects.*',
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
            {/* Mobile backdrop */}
            {open && (
                <div
                    className="fixed inset-0 z-30 bg-black/40 md:hidden"
                    onClick={onClose}
                    aria-hidden
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-sidebar-width flex-col border-r border-outline-variant bg-surface-container-lowest transition-transform md:translate-x-0 ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand */}
                <div className="flex h-16 items-center gap-sm border-b border-outline-variant px-md">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                        <span className="text-sm font-bold text-on-primary">eT</span>
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="text-base font-bold text-primary">e-Taqrir</span>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">
                            Habiburrahman
                        </span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-sm py-md">
                    <p className="mb-xs px-md text-label-caps font-label-caps uppercase tracking-wider text-on-surface-variant">
                        Menu
                    </p>
                    <ul className="space-y-1">
                        {visible.map((item) => {
                            const active = isActive(item.routeName);
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={onClose}
                                        className={`flex items-center gap-sm rounded-lg px-md py-sm text-button font-button transition-all ${
                                            active
                                                ? 'bg-primary text-on-primary shadow-sm'
                                                : 'text-on-surface hover:bg-surface-container'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            {item.icon}
                                        </span>
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="border-t border-outline-variant p-md">
                    <p className="text-[10px] text-on-surface-variant">
                        © 2024 Habiburrahman
                    </p>
                </div>
            </aside>
        </>
    );
}
