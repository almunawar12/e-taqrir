<?php

use App\Models\Assessment;
use App\Models\Classroom;
use App\Models\Subject;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    Storage::fake('evidence');

    $this->guru = User::factory()->create();
    $this->guru->assignRole('guru_mapel');
    $this->guru->forceFill(['active_role' => 'guru_mapel'])->save();

    $this->wali = User::factory()->create();
    $this->wali->assignRole('wali_kelas');
    $this->wali->forceFill(['active_role' => 'wali_kelas'])->save();

    $classroom = Classroom::factory()->create();
    $subject = Subject::factory()->create();

    $this->assessment = Assessment::create([
        'classroom_id'  => $classroom->id,
        'subject_id'    => $subject->id,
        'teacher_id'    => $this->guru->id,
        'academic_year' => '2024/2025',
        'semester'      => 1,
    ]);
});

it('guru can upload evidence PDF', function () {
    $file = UploadedFile::fake()->create('rapor.pdf', 500, 'application/pdf');

    $response = $this->actingAs($this->guru)
        ->post("/assessments/{$this->assessment->id}/evidence", ['evidence' => $file]);

    $response->assertOk()->assertJsonStructure(['path', 'name']);

    $this->assessment->refresh();
    expect($this->assessment->evidence_path)->not->toBeNull();
    expect($this->assessment->evidence_name)->toBe('rapor.pdf');
    Storage::disk('evidence')->assertExists($this->assessment->evidence_path);
});

it('guru can upload evidence image', function () {
    $file = UploadedFile::fake()->image('bukti.jpg');

    $this->actingAs($this->guru)
        ->post("/assessments/{$this->assessment->id}/evidence", ['evidence' => $file])
        ->assertOk();
});

it('rejects file larger than 10 MB', function () {
    $file = UploadedFile::fake()->create('big.pdf', 11 * 1024, 'application/pdf');

    $this->actingAs($this->guru)
        ->post("/assessments/{$this->assessment->id}/evidence", ['evidence' => $file])
        ->assertSessionHasErrors('evidence');
});

it('rejects disallowed mime types', function () {
    $file = UploadedFile::fake()->create('script.exe', 100, 'application/octet-stream');

    $this->actingAs($this->guru)
        ->post("/assessments/{$this->assessment->id}/evidence", ['evidence' => $file])
        ->assertSessionHasErrors('evidence');
});

it('other guru cannot upload evidence to someone elses assessment', function () {
    $other = User::factory()->create();
    $other->assignRole('guru_mapel');
    $other->forceFill(['active_role' => 'guru_mapel'])->save();

    $file = UploadedFile::fake()->create('rapor.pdf', 100, 'application/pdf');

    $this->actingAs($other)
        ->post("/assessments/{$this->assessment->id}/evidence", ['evidence' => $file])
        ->assertForbidden();
});

it('guru can delete own evidence', function () {
    $file = UploadedFile::fake()->create('rapor.pdf', 100, 'application/pdf');
    $this->actingAs($this->guru)
        ->post("/assessments/{$this->assessment->id}/evidence", ['evidence' => $file]);

    $this->assessment->refresh();
    $path = $this->assessment->evidence_path;

    $this->actingAs($this->guru)
        ->delete("/assessments/{$this->assessment->id}/evidence")
        ->assertOk()->assertJson(['deleted' => true]);

    Storage::disk('evidence')->assertMissing($path);
    expect($this->assessment->fresh()->evidence_path)->toBeNull();
});

it('wali_kelas can view evidence on submitted assessment', function () {
    $file = UploadedFile::fake()->create('rapor.pdf', 100, 'application/pdf');
    $this->actingAs($this->guru)
        ->post("/assessments/{$this->assessment->id}/evidence", ['evidence' => $file]);

    $this->actingAs($this->wali)
        ->get("/assessments/{$this->assessment->id}/evidence")
        ->assertOk();
});

it('unauthenticated user cannot access evidence', function () {
    $this->get("/assessments/{$this->assessment->id}/evidence")
        ->assertRedirect('/login');
});

it('uploading new file replaces old file', function () {
    $file1 = UploadedFile::fake()->create('first.pdf', 100, 'application/pdf');
    $this->actingAs($this->guru)
        ->post("/assessments/{$this->assessment->id}/evidence", ['evidence' => $file1]);

    $this->assessment->refresh();
    $oldPath = $this->assessment->evidence_path;

    $file2 = UploadedFile::fake()->create('second.pdf', 100, 'application/pdf');
    $this->actingAs($this->guru)
        ->post("/assessments/{$this->assessment->id}/evidence", ['evidence' => $file2]);

    Storage::disk('evidence')->assertMissing($oldPath);
    expect($this->assessment->fresh()->evidence_name)->toBe('second.pdf');
});
