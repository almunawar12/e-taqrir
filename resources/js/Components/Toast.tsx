import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import type { PageProps } from '@/types';

/**
 * Mount once at app/layout root. Renders react-hot-toast Toaster
 * and emits toasts whenever Inertia flash messages change.
 */
export default function Toast() {
    const { flash } = usePage<PageProps>().props;
    const lastFlash = useRef<string | null>(null);

    useEffect(() => {
        const success = flash?.success ?? null;
        const error   = flash?.error   ?? null;
        const message = success ?? error ?? null;

        if (!message || message === lastFlash.current) return;
        lastFlash.current = message;

        if (error) {
            toast.error(error);
        } else if (success) {
            toast.success(success);
        }
    }, [flash]);

    // Reset dedup key on Inertia navigation so repeat messages still show.
    useEffect(() => {
        return router.on('navigate', () => {
            lastFlash.current = null;
        });
    }, []);

    return (
        <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
                duration: 4000,
                style: {
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    border: '1px solid #bccac0',
                    background: '#ffffff',
                    color: '#171d19',
                },
                success: {
                    iconTheme: { primary: '#006948', secondary: '#ffffff' },
                },
                error: {
                    iconTheme: { primary: '#ba1a1a', secondary: '#ffffff' },
                },
            }}
        />
    );
}

// Re-export for direct usage in pages: `import { toast } from '@/Components/Toast';`
export { toast };
