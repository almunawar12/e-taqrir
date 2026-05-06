import ConfirmModal, { ConfirmTone } from '@/Components/ConfirmModal';
import { ReactNode, useCallback, useState } from 'react';

interface ConfirmOptions {
    title: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: ConfirmTone;
    icon?: string;
    /**
     * Callback. Receives `done()` to close modal manually.
     * If returns Promise, modal stays open until it resolves.
     */
    onConfirm: (done: () => void) => void | Promise<void>;
}

interface State extends ConfirmOptions {
    open: boolean;
    processing: boolean;
}

const INITIAL: State = {
    open: false,
    processing: false,
    title: '',
    onConfirm: () => {},
};

/**
 * Imperative confirm dialog. Returns `confirm()` opener + `<dialog />` to render.
 *
 * Usage:
 *   const { confirm, dialog } = useConfirm();
 *   confirm({ title: 'Hapus?', tone: 'danger', onConfirm: () => router.delete(...) });
 *   return <>{dialog}{...}</>;
 */
export function useConfirm() {
    const [state, setState] = useState<State>(INITIAL);

    const close = useCallback(() => {
        setState((s) => ({ ...s, open: false, processing: false }));
    }, []);

    const confirm = useCallback((options: ConfirmOptions) => {
        setState({ ...INITIAL, ...options, open: true });
    }, []);

    const handleConfirm = useCallback(async () => {
        setState((s) => ({ ...s, processing: true }));
        try {
            const result = state.onConfirm(close);
            if (result instanceof Promise) {
                await result;
                close();
            }
        } catch {
            setState((s) => ({ ...s, processing: false }));
        }
    }, [state, close]);

    const dialog: ReactNode = (
        <ConfirmModal
            show={state.open}
            onClose={close}
            onConfirm={handleConfirm}
            title={state.title}
            message={state.message}
            confirmLabel={state.confirmLabel}
            cancelLabel={state.cancelLabel}
            tone={state.tone}
            icon={state.icon}
            processing={state.processing}
        />
    );

    return { confirm, dialog, close };
}
