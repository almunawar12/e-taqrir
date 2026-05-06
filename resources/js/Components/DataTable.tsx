import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';

interface PaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T, any>[];
    meta?: PaginationMeta;
    onPrev?: () => void;
    onNext?: () => void;
    search?: string;
    onSearch?: (value: string) => void;
    searchPlaceholder?: string;
}

export default function DataTable<T>({
    data,
    columns,
    meta,
    onPrev,
    onNext,
    search,
    onSearch,
    searchPlaceholder = 'Cari...',
}: DataTableProps<T>) {
    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <div className="space-y-4">
            {onSearch !== undefined && (
                <input
                    type="search"
                    value={search ?? ''}
                    onChange={e => onSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-64 rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            )}
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        {table.getHeaderGroups().map(hg => (
                            <tr key={hg.id}>
                                {hg.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="py-10 text-center text-gray-400">
                                    Tidak ada data.
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-4 py-3 text-gray-700">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {meta && (
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                        Total: <strong>{meta.total}</strong> | Halaman {meta.current_page} dari {meta.last_page}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={onPrev}
                            disabled={meta.current_page <= 1}
                            className="rounded border px-3 py-1 disabled:opacity-40 hover:bg-gray-100"
                        >
                            Prev
                        </button>
                        <button
                            onClick={onNext}
                            disabled={meta.current_page >= meta.last_page}
                            className="rounded border px-3 py-1 disabled:opacity-40 hover:bg-gray-100"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
