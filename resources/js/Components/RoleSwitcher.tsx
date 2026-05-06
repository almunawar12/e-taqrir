import { router } from '@inertiajs/react';
import { useActiveRole } from '@/hooks/useActiveRole';
import type { RoleName } from '@/types';

const LABELS: Record<RoleName, string> = {
    super_admin: 'Super Admin',
    wali_kelas: 'Wali Kelas',
    guru_mapel: 'Guru Mapel',
    wali_santri: 'Wali Santri',
};

export default function RoleSwitcher() {
    const { active, roles } = useActiveRole();

    if (roles.length <= 1) {
        return active ? (
            <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                {LABELS[active]}
            </span>
        ) : null;
    }

    const switchTo = (role: RoleName) => {
        if (role === active) return;
        router.post(
            '/role/switch',
            { role },
            { preserveScroll: true, preserveState: false },
        );
    };

    return (
        <select
            aria-label="Switch role"
            value={active ?? ''}
            onChange={(e) => switchTo(e.target.value as RoleName)}
            className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
            {roles.map((r) => (
                <option key={r} value={r}>
                    {LABELS[r]}
                </option>
            ))}
        </select>
    );
}
