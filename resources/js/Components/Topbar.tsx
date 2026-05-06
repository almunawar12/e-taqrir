import Dropdown from '@/Components/Dropdown';
import RoleSwitcher from '@/Components/RoleSwitcher';
import { usePage } from '@inertiajs/react';
import { ReactNode } from 'react';

export default function Topbar({
    onMenuClick,
    title,
}: {
    onMenuClick: () => void;
    title?: ReactNode;
}) {
    const user = usePage().props.auth.user;
    const initial = user.name.charAt(0).toUpperCase();

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-md border-b border-outline-variant bg-surface-container-lowest px-md md:px-lg">
            <div className="flex flex-1 items-center gap-md">
                {/* Mobile hamburger */}
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container md:hidden"
                    aria-label="Open menu"
                >
                    <span className="material-symbols-outlined text-[22px]">menu</span>
                </button>

                {title && (
                    <div className="flex-1 truncate text-h3 font-h3 text-on-surface">
                        {title}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-sm">
                <RoleSwitcher />

                <Dropdown>
                    <Dropdown.Trigger>
                        <button
                            type="button"
                            className="flex items-center gap-sm rounded-full p-1 pr-md transition-colors hover:bg-surface-container"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
                                {initial}
                            </span>
                            <span className="hidden text-button font-button text-on-surface md:block">
                                {user.name}
                            </span>
                            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                                expand_more
                            </span>
                        </button>
                    </Dropdown.Trigger>
                    <Dropdown.Content>
                        <Dropdown.Link href={route('profile.edit')}>Profil</Dropdown.Link>
                        <Dropdown.Link href={route('logout')} method="post" as="button">
                            Keluar
                        </Dropdown.Link>
                    </Dropdown.Content>
                </Dropdown>
            </div>
        </header>
    );
}
