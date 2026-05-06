import Modal from '@/Components/Modal';

export type ConfirmTone = 'primary' | 'danger' | 'warning';

const TONE_STYLES: Record<ConfirmTone, { iconBg: string; iconColor: string; icon: string; btn: string }> = {
    primary: {
        iconBg:    'bg-primary-fixed',
        iconColor: 'text-primary',
        icon:      'check_circle',
        btn:       'bg-primary-container text-on-primary-container hover:opacity-90',
    },
    danger: {
        iconBg:    'bg-error-container',
        iconColor: 'text-error',
        icon:      'delete',
        btn:       'bg-error text-on-error hover:opacity-90',
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
    tone = 'primary',
    icon,
    processing = false,
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
    const styles = TONE_STYLES[tone];

    return (
        <Modal show={show} onClose={onClose} maxWidth="md" closeable={!processing}>
            <div className="bg-surface-container-lowest p-lg">
                <div className="flex gap-md">
                    <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${styles.iconBg}`}
                    >
                        <span className={`material-symbols-outlined text-[24px] ${styles.iconColor}`}>
                            {icon ?? styles.icon}
                        </span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-h3 font-h3 text-on-surface">{title}</h3>
                        {message && (
                            <p className="mt-xs text-body-sm font-body-sm text-on-surface-variant">
                                {message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-lg flex justify-end gap-sm">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-sm text-button font-button text-on-surface transition-colors hover:bg-surface-container disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className={`flex items-center gap-1 rounded-lg px-md py-sm text-button font-button shadow-sm transition-all disabled:opacity-60 ${styles.btn}`}
                    >
                        {processing && (
                            <span className="material-symbols-outlined animate-spin text-[16px]">
                                progress_activity
                            </span>
                        )}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
