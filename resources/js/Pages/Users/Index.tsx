import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CrudModal from '@/Components/CrudModal';
import PageHero from '@/Components/PageHero';
import Pagination from '@/Components/Pagination';
import StatCard from '@/Components/StatCard';
import { FormField, SelectField, TextField } from '@/Components/FormField';
import { useConfirm } from '@/hooks/useConfirm';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { useDebounce, useDebounceEffect } from '@/hooks/useDebounce';
import { z } from 'zod';
import type { PageProps, RoleName } from '@/types';

const ROLE_LABEL: Record<string, string> = {
    super_admin:  'Super Admin',
    wali_kelas:   'Wali Kelas',
    guru_mapel:   'Guru Mapel',
    wali_santri:  'Wali Santri',
};

const ROLE_COLOR: Record<string, string> = {
    super_admin: 'bg-primary/10 text-primary',
    wali_kelas:  'bg-secondary/10 text-secondary',
    guru_mapel:  'bg-tertiary/10 text-tertiary',
    wali_santri: 'bg-surface-container-high text-on-surface-variant',
};

const schemaCreate = z.object({
    name:     z.string().min(1, 'Nama wajib diisi').max(150),
    email:    z.string().email('Email tidak valid').max(255),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    role:     z.string().min(1, 'Role wajib dipilih'),
});
const schemaEdit = schemaCreate.extend({
    password: z.union([z.string().min(8, 'Password minimal 8 karakter'), z.literal('')]),
});

interface UserItem {
    id: number;
    name: string;
    email: string;
    active_role: RoleName | null;
    roles: { name: string }[];
}

interface Paginated {
    data: UserItem[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from: number | null;
    to: number | null;
}

interface Props extends PageProps {
    users:   Paginated;
    roles:   string[];
    filters: { search?: string; role?: string };
}

function initials(name: string) {
    return name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
}

// ─── Form ─────────────────────────────────────────────────────────────────────
function UserForm({
    user,
    roles,
    currentUserId,
    onClose,
}: {
    user?: UserItem;
    roles: string[];
    currentUserId: number;
    onClose: () => void;
}) {
    const isEdit     = !!user;
    const isSelf     = user?.id === currentUserId;
    const userRole   = user?.roles[0]?.name ?? '';

    const { data, setData, post, put, processing, errors } = useForm({
        name:     user?.name ?? '',
        email:    user?.email ?? '',
        password: '',
        role:     userRole,
    });

    const [zodErrors, setZodErrors] = useState<Record<string, string>>({});

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const schema = isEdit ? schemaEdit : schemaCreate;
        const result = schema.safeParse(data);
        if (!result.success) {
            const errs: Record<string, string> = {};
            result.error.issues.forEach((i) => { if (i.path[0]) errs[String(i.path[0])] = i.message; });
            setZodErrors(errs);
            return;
        }
        setZodErrors({});
        if (isEdit) put(`/users/${user!.id}`, { onSuccess: onClose });
        else        post('/users', { onSuccess: onClose });
    };

    const err = (f: string) => zodErrors[f] ?? errors[f as keyof typeof errors];

    return (
        <form onSubmit={submit} className="space-y-5">
            <FormField label="Nama Lengkap" htmlFor="name" error={err('name')}>
                <TextField id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Ahmad Fauzi" />
            </FormField>

            <FormField label="Email" htmlFor="email" error={err('email')}>
                <TextField id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="email@etaqrir.id" />
            </FormField>

            <FormField
                label={isEdit ? 'Password Baru (opsional)' : 'Password'}
                htmlFor="password"
                error={err('password')}
                hint={isEdit ? 'Kosongkan jika tidak ingin mengubah password.' : undefined}
            >
                <TextField id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder={isEdit ? '••••••••' : 'Min. 8 karakter'} autoComplete="new-password" />
            </FormField>

            <FormField label="Role" htmlFor="role" error={err('role')}>
                <SelectField id="role" value={data.role} onChange={(e) => setData('role', e.target.value)} disabled={isSelf}>
                    <option value="">— Pilih role —</option>
                    {roles.map((r) => (
                        <option key={r} value={r}>{ROLE_LABEL[r] ?? r}</option>
                    ))}
                </SelectField>
                {isSelf && <p className="mt-1 text-xs text-on-surface-variant">Tidak bisa mengubah role sendiri.</p>}
            </FormField>

            <div className="flex items-center justify-end gap-3 border-t border-outline-variant pt-5">
                <button type="button" onClick={onClose}
                    className="rounded-lg border border-outline-variant px-5 py-2.5 text-button text-on-surface-variant transition-colors hover:bg-surface-container-high">
                    Batal
                </button>
                <button type="submit" disabled={processing}
                    className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-button font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-60">
                    {processing && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                    {processing ? 'Menyimpan...' : 'Simpan'}
                </button>
            </div>
        </form>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function UsersIndex() {
    const { users, roles, filters, auth } = usePage<Props>().props;
    const [search, setSearch]         = useState(filters.search ?? '');
    const [roleFilter, setRoleFilter] = useState(filters.role ?? '');
    const debouncedSearch             = useDebounce(search);
    const { confirm, dialog }         = useConfirm();

    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem]   = useState<UserItem | undefined>(undefined);

    const applyFilter = (params: object) => {
        router.get('/users', { search, role: roleFilter, ...params }, { preserveState: true, replace: true });
    };

    useDebounceEffect(debouncedSearch, () =>
        router.get('/users', { search: debouncedSearch, role: roleFilter }, { preserveState: true, replace: true })
    );

    const openCreate = () => { setEditItem(undefined); setModalOpen(true); };
    const openEdit   = (u: UserItem) => { setEditItem(u); setModalOpen(true); };

    const handleDelete = (u: UserItem) => {
        confirm({
            title: 'Hapus pengguna?',
            message: `Akun "${u.name}" akan dihapus permanen.`,
            tone: 'danger',
            confirmLabel: 'Hapus',
            onConfirm: (done) => router.delete(`/users/${u.id}`, { onFinish: done }),
        });
    };

    const roleCounts = roles.reduce<Record<string, number>>((acc, r) => {
        acc[r] = users.data.filter((u) => u.roles[0]?.name === r).length;
        return acc;
    }, {});

    return (
        <AuthenticatedLayout header="Manajemen Pengguna">
            <Head title="Pengguna" />
            {dialog}

            <CrudModal
                show={modalOpen}
                title={editItem ? `Edit ${editItem.name}` : 'Tambah Pengguna'}
                onClose={() => setModalOpen(false)}
            >
                <UserForm
                    key={editItem?.id ?? 'create'}
                    user={editItem}
                    roles={roles}
                    currentUserId={auth.user.id}
                    onClose={() => setModalOpen(false)}
                />
            </CrudModal>

            <PageHero
                icon="manage_accounts"
                title="Manajemen Pengguna"
                subtitle="Kelola akun, role, dan hak akses seluruh pengguna sistem."
            />

            {/* Stats */}
            <section className="mb-section-margin grid grid-cols-2 gap-card-gap lg:grid-cols-4">
                <StatCard label="Total Pengguna" value={users.total}             icon="group"       tone="primary" />
                <StatCard label="Super Admin"    value={roleCounts.super_admin ?? 0} icon="shield"  tone="secondary" />
                <StatCard label="Wali Kelas"     value={roleCounts.wali_kelas ?? 0}  icon="school" tone="tertiary" />
                <StatCard label="Guru Mapel"     value={roleCounts.guru_mapel ?? 0}  icon="book"   tone="neutral" />
            </section>

            {/* Table card */}
            <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
                {/* Toolbar */}
                <div className="flex flex-col items-stretch justify-between gap-4 border-b border-outline-variant p-6 md:flex-row md:items-center">
                    <div>
                        <h3 className="text-headline-md font-bold text-primary">Daftar Pengguna</h3>
                        <p className="text-body-sm text-on-surface-variant">{users.total} pengguna terdaftar.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={roleFilter}
                            onChange={(e) => { setRoleFilter(e.target.value); applyFilter({ role: e.target.value }); }}
                            className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">Semua role</option>
                            {roles.map((r) => <option key={r} value={r}>{ROLE_LABEL[r] ?? r}</option>)}
                        </select>
                        <div className="relative">
                            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                            <input
                                type="search"
                                placeholder="Cari nama / email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <button type="button" onClick={openCreate}
                            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-button font-semibold text-on-primary shadow-sm transition-all hover:brightness-110">
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            Tambah
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface-container-low text-on-surface-variant">
                            <tr>
                                <th className="px-6 py-4 text-label-caps tracking-wider">Pengguna</th>
                                <th className="px-6 py-4 text-label-caps tracking-wider">Email</th>
                                <th className="px-6 py-4 text-label-caps tracking-wider">Role</th>
                                <th className="px-6 py-4 text-right text-label-caps tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/30">
                            {users.data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center">
                                        <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">inbox</span>
                                        <p className="mt-2 text-body-sm text-on-surface-variant">Tidak ada pengguna ditemukan.</p>
                                    </td>
                                </tr>
                            ) : users.data.map((u) => {
                                const role      = u.roles[0]?.name ?? '';
                                const isSelf    = u.id === auth.user.id;
                                return (
                                    <tr key={u.id} className="transition-colors hover:bg-surface-container-lowest">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                                    {initials(u.name)}
                                                </div>
                                                <div>
                                                    <p className="text-body-base font-bold text-on-surface">{u.name}</p>
                                                    {isSelf && <p className="text-[10px] text-primary">(Anda)</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-body-sm text-on-surface-variant">{u.email}</td>
                                        <td className="px-6 py-4">
                                            {role ? (
                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ROLE_COLOR[role] ?? 'bg-surface-container-high text-on-surface-variant'}`}>
                                                    {ROLE_LABEL[role] ?? role}
                                                </span>
                                            ) : (
                                                <span className="text-body-sm text-on-surface-variant/60">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button type="button" onClick={() => openEdit(u)}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-outline transition-all hover:bg-primary/5 hover:text-primary" aria-label="Edit">
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button type="button" onClick={() => handleDelete(u)} disabled={isSelf}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-outline transition-all hover:bg-error/5 hover:text-error disabled:cursor-not-allowed disabled:opacity-30" aria-label="Hapus">
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {users.last_page > 1 && (
                    <Pagination meta={users} onPage={(page) => applyFilter({ page })} label="pengguna" />
                )}
            </section>
        </AuthenticatedLayout>
    );
}
