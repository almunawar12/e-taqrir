<?php

namespace App\Policies;

use App\Models\Assessment;
use App\Models\User;

class AssessmentPolicy
{
    public function before(User $user): ?bool
    {
        return $user->active_role === 'super_admin' ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasRole(['super_admin', 'wali_kelas', 'guru_mapel']);
    }

    public function view(User $user, Assessment $assessment): bool
    {
        return $user->hasRole(['super_admin', 'wali_kelas', 'guru_mapel'])
            || $assessment->teacher_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['super_admin', 'guru_mapel']);
    }

    public function update(User $user, Assessment $assessment): bool
    {
        // Only editable when draft or rejected, by the teacher who owns it
        return $assessment->teacher_id === $user->id
            && ($assessment->isDraft() || $assessment->isRejected());
    }

    public function submit(User $user, Assessment $assessment): bool
    {
        return $assessment->teacher_id === $user->id
            && ($assessment->isDraft() || $assessment->isRejected());
    }

    public function verify(User $user, Assessment $assessment): bool
    {
        return $user->hasRole('wali_kelas') && $assessment->isSubmitted();
    }

    public function reject(User $user, Assessment $assessment): bool
    {
        return ($user->hasRole('wali_kelas') && $assessment->isSubmitted())
            || ($user->active_role === 'super_admin' && $assessment->isVerified());
    }

    public function publish(User $user, Assessment $assessment): bool
    {
        return $user->active_role === 'super_admin' && $assessment->isVerified();
    }

    public function delete(User $user, Assessment $assessment): bool
    {
        return $user->active_role === 'super_admin' || (
            $assessment->teacher_id === $user->id && $assessment->isDraft()
        );
    }

    public function restore(User $user, Assessment $assessment): bool
    {
        return false;
    }

    public function forceDelete(User $user, Assessment $assessment): bool
    {
        return false;
    }
}
