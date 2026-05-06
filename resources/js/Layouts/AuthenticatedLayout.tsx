import Sidebar from '@/Components/Sidebar';
import Toast from '@/Components/Toast';
import Topbar from '@/Components/Topbar';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background font-sans text-on-surface">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="lg:ml-[280px]">
                <Topbar onMenuClick={() => setSidebarOpen(true)} title={header} />
                <main className="pt-16">
                    <div className="p-container-padding">{children}</div>
                </main>
            </div>

            <Toast />
        </div>
    );
}
