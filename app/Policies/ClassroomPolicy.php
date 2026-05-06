<?php

namespace App\Policies;

use App\Models\Classroom;
use App\Models\User;

class ClassroomPolicy
{
    public function before(User $user): ?bool
    {
        return $user->active_role === 'super_admin' ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasRole(['super_admin', 'wali_kelas', 'guru_mapel']);
    }

    public function view(User $user, Classroom $classroom): bool
    {
        return $user->hasRole(['super_admin', 'wali_kelas', 'guru_mapel']);
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['super_admin', 'wali_kelas']);
    }

    public function update(User $user, Classroom $classroom): bool
    {
        return $user->hasRole(['super_admin', 'wali_kelas']);
    }

    public function delete(User $user, Classroom $classroom): bool
    {
        return $user->active_role === 'super_admin';
    }

    public function restore(User $user, Classroom $classroom): bool
    {
        return $user->active_role === 'super_admin';
    }

    public function forceDelete(User $user, Classroom $classroom): bool
    {
        return false;
    }
}
