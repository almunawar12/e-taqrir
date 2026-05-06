<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

class EnsureActiveRole
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null) {
            return $next($request);
        }

        $active = $user->active_role;

        if ($active === null) {
            $first = $user->getRoleNames()->first();
            if ($first !== null) {
                $user->forceFill(['active_role' => $first])->save();
            }

            return $next($request);
        }

        if (! $user->hasRole($active)) {
            $user->forceFill(['active_role' => $user->getRoleNames()->first()])->save();
            throw new HttpException(403, 'Active role no longer granted.');
        }

        return $next($request);
    }
}
