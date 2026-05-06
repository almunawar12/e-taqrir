<?php

namespace App\Domain\Audit\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AuditLogger
{
    public function __construct(private readonly Request $request) {}

    public function log(
        string $event,
        ?Model $auditable = null,
        ?array $before = null,
        ?array $after = null,
        ?User $user = null,
    ): AuditLog {
        $user ??= $this->request->user();

        return AuditLog::create([
            'user_id' => $user?->id,
            'active_role' => $user?->active_role,
            'event' => $event,
            'auditable_type' => $auditable ? $auditable::class : null,
            'auditable_id' => $auditable?->getKey(),
            'payload_before' => $before,
            'payload_after' => $after,
            'ip' => $this->request->ip(),
            'user_agent' => substr((string) $this->request->userAgent(), 0, 1024),
        ]);
    }
}
