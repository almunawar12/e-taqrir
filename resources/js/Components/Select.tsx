import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { useEffect, useMemo, useState } from 'react';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface SelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    searchable?: boolean;
    size?: 'sm' | 'md';
    id?: string;
    className?: string;
}

function SearchBox({
    isOpen,
    query,
    onChange,
}: {
    isOpen: boolean;
    query: string;
    onChange: (q: string) => void;
}) {
    useEffect(() => {
        if (!isOpen) onChange('');
    }, [isOpen, onChange]);

    return (
        <div className="overflow-hidden border-b border-outline-variant p-2">
            <div className="flex w-full items-center gap-2 rounded-lg bg-surface-container-low px-3 py-2">
                <span className="material-symbols-outlined flex-shrink-0 text-[18px] text-on-surface-variant">search</span>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Cari..."
                    className="min-w-0 flex-1 bg-transparent text-body-sm text-on-surface outline-none placeholder:text-on-surface-variant/60"
                    onKeyDown={(e) => e.stopPropagation()}
                />
                {query && (
                    <button
                        type="button"
                        tabIndex={-1}
                        onMouseDown={(e) => { e.preventDefault(); onChange(''); }}
                        className="flex-shrink-0 text-on-surface-variant hover:text-on-surface"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                )}
            </div>
        </div>
    );
}

export function Select({
    options,
    value,
    onChange,
    placeholder = '— Pilih —',
    disabled = false,
    searchable = false,
    size = 'md',
    id,
    className,
}: SelectProps) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        if (!query.trim()) return options;
        const q = query.toLowerCase();
        return options.filter((opt) => opt.label.toLowerCase().includes(q));
    }, [options, query]);

    const selected = options.find((opt) => opt.value === value);

    return (
        <Listbox value={value} onChange={onChange} disabled={disabled}>
            {({ open }) => (
                <div className={`relative ${className ?? ''}`}>
                    <ListboxButton
                        id={id}
                        className={[
                            'flex w-full items-center justify-between gap-2 rounded-lg border text-left outline-none transition-all',
                            'hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20',
                            'disabled:cursor-not-allowed disabled:opacity-60',
                            open
                                ? 'border-primary ring-2 ring-primary/20'
                                : 'border-outline-variant',
                            size === 'sm'
                                ? 'bg-surface-container-low px-3 py-1.5 text-body-sm'
                                : 'bg-surface-container-lowest px-4 py-2.5 text-body-base',
                        ].join(' ')}
                    >
                        <span className={selected ? 'text-on-surface' : 'text-on-surface-variant/60'}>
                            {selected?.label ?? placeholder}
                        </span>
                        <span
                            className={`material-symbols-outlined shrink-0 text-[20px] text-on-surface-variant transition-transform duration-200 ${open ? '-rotate-180' : ''}`}
                        >
                            expand_more
                        </span>
                    </ListboxButton>

                    <ListboxOptions
                        anchor="bottom start"
                        className="z-50 w-[var(--button-width)] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-lg outline-none [--anchor-gap:4px]"
                    >
                        {searchable && (
                            <SearchBox isOpen={open} query={query} onChange={setQuery} />
                        )}

                        <div className="max-h-60 overflow-y-auto overflow-x-hidden py-1">
                            {filtered.length === 0 ? (
                                <p className="px-4 py-3 text-body-sm text-on-surface-variant">
                                    Tidak ada opsi ditemukan.
                                </p>
                            ) : (
                                filtered.map((opt) => (
                                    <ListboxOption
                                        key={opt.value}
                                        value={opt.value}
                                        disabled={opt.disabled}
                                        className={({ active, selected: sel }) =>
                                            [
                                                'flex cursor-pointer items-center gap-2 px-4 py-2.5 text-body-sm transition-colors',
                                                opt.disabled ? 'cursor-not-allowed opacity-40' : '',
                                                active ? 'bg-primary/5 text-primary' : 'text-on-surface',
                                                sel ? 'font-semibold text-primary' : '',
                                            ]
                                                .filter(Boolean)
                                                .join(' ')
                                        }
                                    >
                                        <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                                        <span
                                            className={`material-symbols-outlined flex-shrink-0 text-[18px] text-primary transition-opacity ${opt.value === value ? 'opacity-100' : 'opacity-0'}`}
                                        >
                                            check
                                        </span>
                                    </ListboxOption>
                                ))
                            )}
                        </div>
                    </ListboxOptions>
                </div>
            )}
        </Listbox>
    );
}
