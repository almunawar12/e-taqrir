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
    const initials = user.name
        .split(' ')
        .map((s) => s.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <header className="fixed top-0 right-0 z-30 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface/80 px-container-padding backdrop-blur-md lg:w-[calc(100%-280px)]">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high lg:hidden"
                    aria-label="Buka menu"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>
                {title && (
                    <div className="text-headline-md font-bold text-primary">
                        {title}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                <RoleSwitcher />

                <button
                    type="button"
                    className="relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
                    aria-label="Notifikasi"
                >
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-surface bg-error" />
                </button>

                <div className="hidden h-8 w-px bg-outline-variant sm:block" />

                <Dropdown>
                    <Dropdown.Trigger>
                        <button
                            type="button"
                            className="flex items-center gap-3 rounded-full p-1 transition-colors hover:bg-surface-container-high"
                        >
                            <div className="hidden text-right sm:block">
                                <p className="text-label-caps text-on-surface">{user.name}</p>
                                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                                    {user.email}
                                </p>
                            </div>
                            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary-fixed-dim bg-primary text-body-sm font-bold text-on-primary">
                                {initials}
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
