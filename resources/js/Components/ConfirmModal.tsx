import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';

export type ConfirmTone = 'primary' | 'danger' | 'warning';

const TONE: Record<ConfirmTone, { iconBg: string; iconColor: string; icon: string; btn: string }> = {
    primary: {
        iconBg:    'bg-primary/10',
        iconColor: 'text-primary',
        icon:      'check_circle',
        btn:       'bg-primary text-on-primary hover:brightness-110',
    },
    danger: {
        iconBg:    'bg-error/10',
        iconColor: 'text-error',
        icon:      'delete',
        btn:       'bg-error text-on-error hover:brightness-110',
    },
    warning: {
        iconBg:    'bg-amber-100',
        iconColor: 'text-amber-700',
        icon:      'warning',
        btn:       'bg-amber-600 text-white hover:bg-amber-700',
    },
};

export default function ConfirmModal({
    show,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Konfirmasi',
    cancelLabel  = 'Batal',
    tone         = 'primary',
    icon,
    processing   = false,
}: {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: ConfirmTone;
    icon?: string;
    processing?: boolean;
}) {
    const styles = TONE[tone];

    return (
        <Transition show={show} leave="duration-150">
            <Dialog as="div" className="fixed inset-0 z-50 flex items-center justify-center px-4" onClose={() => !processing && onClose()}>
                {/* Backdrop */}
                <TransitionChild
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                {/* Panel */}
                <TransitionChild
                    enter="ease-out duration-200"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <DialogPanel className="relative w-full max-w-md rounded-2xl border border-outline-variant bg-surface shadow-2xl">
                        <div className="p-6">
                            {/* Icon + text */}
                            <div className="flex gap-4">
                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${styles.iconBg}`}>
                                    <span className={`material-symbols-outlined text-[24px] ${styles.iconColor}`}>
                                        {icon ?? styles.icon}
                                    </span>
                                </div>
                                <div className="flex-1 pt-1">
                                    <h3 className="text-headline-md font-bold text-on-surface">{title}</h3>
                                    {message && (
                                        <p className="mt-1.5 text-body-sm text-on-surface-variant">{message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={processing}
                                    className="rounded-lg border border-outline-variant bg-surface-container-lowest px-5 py-2.5 text-button font-medium text-on-surface transition-colors hover:bg-surface-container disabled:opacity-50"
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    disabled={processing}
                                    className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-button font-semibold shadow-sm transition-all disabled:opacity-60 ${styles.btn}`}
                                >
                                    {processing && (
                                        <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                                    )}
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
