interface PaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from?: number | null;
    to?: number | null;
}

function buildPageList(current: number, last: number): (number | '…')[] {
    if (last <= 7) {
        return Array.from({ length: last }, (_, i) => i + 1);
    }
    const pages: (number | '…')[] = [1];
    const start = Math.max(2, current - 1);
    const end   = Math.min(last - 1, current + 1);
    if (start > 2) pages.push('…');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < last - 1) pages.push('…');
    pages.push(last);
    return pages;
}

/**
 * Reusable numeric pagination. Pure UI — caller provides callbacks.
 *
 * Usage:
 *   <Pagination meta={data.meta} onPage={(p) => router.get(url, { page: p })} />
 */
export default function Pagination({
    meta,
    onPage,
    label = 'data',
}: {
    meta: PaginationMeta;
    onPage: (page: number) => void;
    label?: string;
}) {
    const { current_page, last_page, total } = meta;
    if (total === 0) return null;

    const from = meta.from ?? (current_page - 1) * meta.per_page + 1;
    const to   = meta.to   ?? Math.min(current_page * meta.per_page, total);

    const pages = buildPageList(current_page, last_page);

    return (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-outline-variant bg-surface-container-lowest px-6 py-4 md:flex-row">
            <p className="text-body-sm text-on-surface-variant">
                Menampilkan <span className="font-bold text-on-surface">{from}-{to}</span> dari{' '}
                <span className="font-bold text-on-surface">{total.toLocaleString('id-ID')}</span> {label}
            </p>

            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onPage(current_page - 1)}
                    disabled={current_page <= 1}
                    aria-label="Halaman sebelumnya"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>

                {pages.map((p, i) =>
                    p === '…' ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-on-surface-variant">
                            …
                        </span>
                    ) : (
                        <button
                            key={p}
                            type="button"
                            onClick={() => onPage(p)}
                            aria-current={p === current_page ? 'page' : undefined}
                            className={`flex h-10 w-10 items-center justify-center rounded-lg text-body-sm font-semibold transition-all ${
                                p === current_page
                                    ? 'bg-primary text-on-primary shadow-sm'
                                    : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                            }`}
                        >
                            {p}
                        </button>
                    ),
                )}

                <button
                    type="button"
                    onClick={() => onPage(current_page + 1)}
                    disabled={current_page >= last_page}
                    aria-label="Halaman selanjutnya"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
        </div>
    );
}
