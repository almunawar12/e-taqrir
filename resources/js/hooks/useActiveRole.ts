import { usePage } from '@inertiajs/react';
import type { PageProps, RoleName } from '@/types';

export function useActiveRole(): {
    active: RoleName | null;
    roles: RoleName[];
    has: (role: RoleName) => boolean;
} {
    const { auth } = usePage<PageProps>().props;
    return {
        active: auth.active_role,
        roles: auth.roles,
        has: (role) => auth.roles.includes(role),
    };
}
