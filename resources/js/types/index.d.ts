export type RoleName = 'super_admin' | 'wali_kelas' | 'guru_mapel' | 'wali_santri';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    active_role?: RoleName | null;
}

export interface ActiveContext {
    academic_year: string | null;
    semester: number | null;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
        roles: RoleName[];
        active_role: RoleName | null;
    };
    flash?: {
        success?: string | null;
        error?: string | null;
    };
    context: ActiveContext;
};
