<?php

namespace App\Policies;

use App\Models\Subject;
use App\Models\User;

class SubjectPolicy
{
    public function before(User $user): ?bool
    {
        return $user->active_role === 'super_admin' ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasRole(['super_admin', 'wali_kelas', 'guru_mapel']);
    }

    public function view(User $user, Subject $subject): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->active_role === 'super_admin';
    }

    public function update(User $user, Subject $subject): bool
    {
        return $user->active_role === 'super_admin';
    }

    public function delete(User $user, Subject $subject): bool
    {
        return $user->active_role === 'super_admin';
    }

    public function restore(User $user, Subject $subject): bool
    {
        return $user->active_role === 'super_admin';
    }

    public function forceDelete(User $user, Subject $subject): bool
    {
        return false;
    }
}
