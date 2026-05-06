<?php

namespace App\Http\Controllers;

use App\Domain\Audit\Services\AuditLogger;
use App\Http\Requests\SwitchRoleRequest;
use Illuminate\Http\RedirectResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;

class RoleSwitchController extends Controller
{
    public function __invoke(SwitchRoleRequest $request, AuditLogger $audit): RedirectResponse
    {
        $user = $request->user();
        $newRole = $request->string('role')->toString();

        if (! $user->hasRole($newRole)) {
            throw new HttpException(403, 'User does not have requested role.');
        }

        $previous = $user->active_role;

        if ($previous !== $newRole) {
            $user->forceFill(['active_role' => $newRole])->save();

            $audit->log(
                event: 'role.switched',
                auditable: $user,
                before: ['active_role' => $previous],
                after: ['active_role' => $newRole],
                user: $user,
            );
        }

        return back(303);
    }
}
