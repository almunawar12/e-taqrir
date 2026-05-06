<?php

use App\Models\Classroom;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

// ──────────────────────────────────────────────────────────────────
// Students
// ──────────────────────────────────────────────────────────────────

it('super_admin can list students', function () {
    $admin = User::factory()->create();
    $admin->assignRole('super_admin');
    $admin->forceFill(['active_role' => 'super_admin'])->save();
    Student::factory(3)->create();

    $this->actingAs($admin)->get('/students')->assertOk();
});

it('wali_santri cannot access students index', function () {
    $wali = User::factory()->create();
    $wali->assignRole('wali_santri');
    $wali->forceFill(['active_role' => 'wali_santri'])->save();

    $this->actingAs($wali)->get('/students')->assertForbidden();
});

it('wali_kelas can create student', function () {
    $wali = User::factory()->create();
    $wali->assignRole('wali_kelas');
    $wali->forceFill(['active_role' => 'wali_kelas'])->save();

    $response = $this->actingAs($wali)->post('/students', [
        'nis' => '12345678',
        'name' => 'Ahmad Fauzi',
        'gender' => 'L',
        'birth_date' => '2010-05-15',
        'birth_place' => 'Bandung',
        'address' => 'Jl. Pesantren No 1',
        'wali_phone' => '081234567890',
        'classroom_id' => null,
    ]);

    $response->assertRedirect('/students');
    expect(Student::where('nis', '12345678')->exists())->toBeTrue();
});

it('guru_mapel cannot create student', function () {
    $guru = User::factory()->create();
    $guru->assignRole('guru_mapel');
    $guru->forceFill(['active_role' => 'guru_mapel'])->save();

    $this->actingAs($guru)->post('/students', ['nis' => '99999999', 'name' => 'Test', 'gender' => 'L'])
        ->assertForbidden();
});

it('only super_admin can soft-delete student', function () {
    $student = Student::factory()->create(['nis' => '00000001', 'name' => 'Delete Me', 'gender' => 'L']);

    $wali = User::factory()->create();
    $wali->assignRole('wali_kelas');
    $wali->forceFill(['active_role' => 'wali_kelas'])->save();
    $this->actingAs($wali)->delete("/students/{$student->id}")->assertForbidden();
    expect(Student::withTrashed()->find($student->id)?->deleted_at)->toBeNull();

    $admin = User::factory()->create();
    $admin->assignRole('super_admin');
    $admin->forceFill(['active_role' => 'super_admin'])->save();
    $this->actingAs($admin)->delete("/students/{$student->id}")->assertRedirect();
    expect(Student::withTrashed()->find($student->id)?->deleted_at)->not->toBeNull();
});

it('super_admin can restore soft-deleted student', function () {
    $student = Student::factory()->create(['nis' => '00000002', 'name' => 'Restore Me', 'gender' => 'P']);
    $student->delete();

    $admin = User::factory()->create();
    $admin->assignRole('super_admin');
    $admin->forceFill(['active_role' => 'super_admin'])->save();

    $this->actingAs($admin)->post("/students/{$student->id}/restore")->assertRedirect();
    expect(Student::find($student->id))->not->toBeNull();
});

// ──────────────────────────────────────────────────────────────────
// Subjects
// ──────────────────────────────────────────────────────────────────

it('only super_admin can create subjects', function () {
    $admin = User::factory()->create();
    $admin->assignRole('super_admin');
    $admin->forceFill(['active_role' => 'super_admin'])->save();

    $this->actingAs($admin)->post('/subjects', [
        'code' => 'MTK-TEST',
        'name' => 'Matematika Test',
        'category' => 'Umum',
        'credit_hours' => 3,
    ])->assertRedirect('/subjects');

    expect(Subject::where('code', 'MTK-TEST')->exists())->toBeTrue();
});

it('wali_kelas cannot create subject', function () {
    $wali = User::factory()->create();
    $wali->assignRole('wali_kelas');
    $wali->forceFill(['active_role' => 'wali_kelas'])->save();

    $this->actingAs($wali)->post('/subjects', ['code' => 'X', 'name' => 'X', 'credit_hours' => 2])
        ->assertForbidden();
});

// ──────────────────────────────────────────────────────────────────
// Classrooms
// ──────────────────────────────────────────────────────────────────

it('wali_kelas can create classroom', function () {
    $wali = User::factory()->create();
    $wali->assignRole('wali_kelas');
    $wali->forceFill(['active_role' => 'wali_kelas'])->save();

    $this->actingAs($wali)->post('/classrooms', [
        'name' => 'Kelas VIII A',
        'grade_level' => 'VIII',
        'academic_year' => '2026/2027',
        'homeroom_teacher_id' => null,
    ])->assertRedirect('/classrooms');

    expect(Classroom::where('name', 'Kelas VIII A')->exists())->toBeTrue();
});

it('wali_santri cannot access classrooms', function () {
    $wali = User::factory()->create();
    $wali->assignRole('wali_santri');
    $wali->forceFill(['active_role' => 'wali_santri'])->save();

    $this->actingAs($wali)->get('/classrooms')->assertForbidden();
});
