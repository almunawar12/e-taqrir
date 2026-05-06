import { ReactNode } from 'react';

export function FormField({
    label,
    htmlFor,
    error,
    hint,
    children,
}: {
    label: string;
    htmlFor?: string;
    error?: string;
    hint?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label
                htmlFor={htmlFor}
                className="block text-label-caps font-semibold uppercase tracking-wider text-on-surface-variant"
            >
                {label}
            </label>
            {children}
            {error && (
                <p className="flex items-center gap-1 text-body-sm text-error">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    {error}
                </p>
            )}
            {hint && !error && <p className="text-body-sm text-on-surface-variant">{hint}</p>}
        </div>
    );
}

const inputBase =
    'w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-base text-on-surface placeholder:text-on-surface-variant/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60';

export function TextField(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} className={`${inputBase} ${props.className ?? ''}`} />;
}

export function SelectField(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return <select {...props} className={`${inputBase} ${props.className ?? ''}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return <textarea {...props} className={`${inputBase} ${props.className ?? ''}`} />;
}

export function FormActions({
    cancelHref,
    processing,
    submitLabel = 'Simpan',
}: {
    cancelHref: string;
    processing: boolean;
    submitLabel?: string;
}) {
    return (
        <div className="flex items-center justify-end gap-3 border-t border-outline-variant pt-5">
            <a
                href={cancelHref}
                className="rounded-lg border border-outline-variant px-5 py-2.5 text-button text-on-surface-variant transition-colors hover:bg-surface-container-high"
            >
                Batal
            </a>
            <button
                type="submit"
                disabled={processing}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-button font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-60"
            >
                {processing && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                {processing ? 'Menyimpan...' : submitLabel}
            </button>
        </div>
    );
}
