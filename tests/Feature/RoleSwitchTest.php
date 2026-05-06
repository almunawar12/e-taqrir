<?php

use App\Models\AuditLog;
use App\Models\User;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

it('switches active role to one user holds and writes audit', function () {
    $user = User::factory()->create();
    $user->assignRole(['guru_mapel', 'wali_kelas']);
    $user->forceFill(['active_role' => 'guru_mapel'])->save();

    $response = $this->actingAs($user)->post('/role/switch', ['role' => 'wali_kelas']);

    $response->assertStatus(303);

    expect($user->fresh()->active_role)->toBe('wali_kelas');

    $log = AuditLog::where('event', 'role.switched')->latest('id')->first();
    expect($log)->not->toBeNull()
        ->and($log->user_id)->toBe($user->id)
        ->and($log->payload_before)->toBe(['active_role' => 'guru_mapel'])
        ->and($log->payload_after)->toBe(['active_role' => 'wali_kelas']);
});

it('blocks privilege escalation to a role user does not have', function () {
    $user = User::factory()->create();
    $user->assignRole('guru_mapel');
    $user->forceFill(['active_role' => 'guru_mapel'])->save();

    $response = $this->actingAs($user)->post('/role/switch', ['role' => 'super_admin']);

    $response->assertStatus(403);
    expect($user->fresh()->active_role)->toBe('guru_mapel');
    expect(AuditLog::where('event', 'role.switched')->count())->toBe(0);
});

it('rejects unknown role values via validation', function () {
    $user = User::factory()->create();
    $user->assignRole('guru_mapel');

    $response = $this->actingAs($user)->from('/dashboard')->post('/role/switch', ['role' => 'hacker']);

    $response->assertStatus(302)->assertSessionHasErrors('role');
});

it('writes no audit when switching to the same role', function () {
    $user = User::factory()->create();
    $user->assignRole('guru_mapel');
    $user->forceFill(['active_role' => 'guru_mapel'])->save();

    $this->actingAs($user)->post('/role/switch', ['role' => 'guru_mapel'])->assertStatus(303);

    expect(AuditLog::where('event', 'role.switched')->count())->toBe(0);
});

it('requires authentication', function () {
    $this->post('/role/switch', ['role' => 'guru_mapel'])->assertRedirect('/login');
});
