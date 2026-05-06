<?php

use App\Domain\Assessment\States\Draft;
use App\Domain\Assessment\States\Published;
use App\Domain\Assessment\States\Rejected;
use App\Domain\Assessment\States\Submitted;
use App\Domain\Assessment\States\Verified;
use App\Models\Assessment;
use App\Models\AssessmentItem;
use App\Models\Classroom;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);

    $this->guru = User::factory()->create();
    $this->guru->assignRole('guru_mapel');
    $this->guru->forceFill(['active_role' => 'guru_mapel'])->save();

    $this->wali = User::factory()->create();
    $this->wali->assignRole('wali_kelas');
    $this->wali->forceFill(['active_role' => 'wali_kelas'])->save();

    $this->admin = User::factory()->create();
    $this->admin->assignRole('super_admin');
    $this->admin->forceFill(['active_role' => 'super_admin'])->save();

    $this->classroom = Classroom::factory()->create(['homeroom_teacher_id' => $this->wali->id]);
    $this->subject = Subject::factory()->create();

    $this->assessment = Assessment::create([
        'classroom_id'  => $this->classroom->id,
        'subject_id'    => $this->subject->id,
        'teacher_id'    => $this->guru->id,
        'academic_year' => '2024/2025',
        'semester'      => 1,
    ]);

    $this->student = Student::factory()->create(['classroom_id' => $this->classroom->id]);
    AssessmentItem::create([
        'assessment_id' => $this->assessment->id,
        'student_id'    => $this->student->id,
        'score'         => null,
    ]);
});

// ──────────────────────────────────────────────────────────────────
// Index visibility
// ──────────────────────────────────────────────────────────────────

it('guru sees only own assessments', function () {
    $other = User::factory()->create();
    $other->assignRole('guru_mapel');
    $other->forceFill(['active_role' => 'guru_mapel'])->save();
    Assessment::create([
        'classroom_id' => $this->classroom->id, 'subject_id' => $this->subject->id,
        'teacher_id' => $other->id, 'academic_year' => '2024/2025', 'semester' => 2,
    ]);

    $this->actingAs($this->guru)->get('/assessments')->assertOk();
});

it('wali_kelas can list assessments', function () {
    $this->actingAs($this->wali)->get('/assessments')->assertOk();
});

it('wali_santri cannot access assessments', function () {
    $ws = User::factory()->create();
    $ws->assignRole('wali_santri');
    $ws->forceFill(['active_role' => 'wali_santri'])->save();

    $this->actingAs($ws)->get('/assessments')->assertForbidden();
});

// ──────────────────────────────────────────────────────────────────
// Create
// ──────────────────────────────────────────────────────────────────

it('guru_mapel can create assessment and items are pre-populated', function () {
    $student2 = Student::factory()->create(['classroom_id' => $this->classroom->id]);

    $response = $this->actingAs($this->guru)->post('/assessments', [
        'classroom_id'  => $this->classroom->id,
        'subject_id'    => $this->subject->id,
        'academic_year' => '2024/2025',
        'semester'      => 2,
    ]);

    $response->assertRedirect();
    $new = Assessment::where(['classroom_id' => $this->classroom->id, 'semester' => 2])->first();
    expect($new)->not->toBeNull();
    expect($new->items()->count())->toBe(2);
});

it('wali_kelas cannot create assessment', function () {
    $this->actingAs($this->wali)->post('/assessments', [
        'classroom_id' => $this->classroom->id, 'subject_id' => $this->subject->id,
        'academic_year' => '2024/2025', 'semester' => 2,
    ])->assertForbidden();
});

it('duplicate assessment is rejected', function () {
    $this->actingAs($this->guru)->post('/assessments', [
        'classroom_id'  => $this->classroom->id,
        'subject_id'    => $this->subject->id,
        'academic_year' => '2024/2025',
        'semester'      => 1,
    ])->assertSessionHasErrors('classroom_id');
});

// ──────────────────────────────────────────────────────────────────
// Update (score input)
// ──────────────────────────────────────────────────────────────────

it('guru can save scores in draft state', function () {
    $this->actingAs($this->guru)->put("/assessments/{$this->assessment->id}", [
        'items' => [
            ['student_id' => $this->student->id, 'score' => 85.5, 'notes' => 'Bagus'],
        ],
    ])->assertRedirect();

    expect($this->assessment->fresh()->items->first()->score)->toBe('85.50');
});

it('other guru cannot edit assessment', function () {
    $other = User::factory()->create();
    $other->assignRole('guru_mapel');
    $other->forceFill(['active_role' => 'guru_mapel'])->save();

    $this->actingAs($other)->put("/assessments/{$this->assessment->id}", [
        'items' => [['student_id' => $this->student->id, 'score' => 50]],
    ])->assertForbidden();
});

// ──────────────────────────────────────────────────────────────────
// Submit
// ──────────────────────────────────────────────────────────────────

it('guru can submit own draft assessment', function () {
    $this->actingAs($this->guru)->post("/assessments/{$this->assessment->id}/transition", [
        'action' => 'submit',
    ])->assertRedirect();

    expect($this->assessment->fresh()->state)->toBeInstanceOf(Submitted::class);
    expect($this->assessment->fresh()->approvals()->count())->toBe(1);
});

it('wali_kelas cannot submit assessment', function () {
    $this->actingAs($this->wali)->post("/assessments/{$this->assessment->id}/transition", [
        'action' => 'submit',
    ])->assertForbidden();
});

// ──────────────────────────────────────────────────────────────────
// Verify
// ──────────────────────────────────────────────────────────────────

it('wali_kelas can verify submitted assessment', function () {
    $this->assessment->state->transitionTo(Submitted::class);

    $this->actingAs($this->wali)->post("/assessments/{$this->assessment->id}/transition", [
        'action' => 'verify',
    ])->assertRedirect();

    expect($this->assessment->fresh()->state)->toBeInstanceOf(Verified::class);
});

it('guru cannot verify', function () {
    $this->assessment->state->transitionTo(Submitted::class);

    $this->actingAs($this->guru)->post("/assessments/{$this->assessment->id}/transition", [
        'action' => 'verify',
    ])->assertForbidden();
});

it('wali_kelas cannot verify draft', function () {
    $this->actingAs($this->wali)->post("/assessments/{$this->assessment->id}/transition", [
        'action' => 'verify',
    ])->assertForbidden();
});

// ──────────────────────────────────────────────────────────────────
// Reject
// ──────────────────────────────────────────────────────────────────

it('wali_kelas can reject submitted assessment', function () {
    $this->assessment->state->transitionTo(Submitted::class);

    $this->actingAs($this->wali)->post("/assessments/{$this->assessment->id}/transition", [
        'action'  => 'reject',
        'comment' => 'Nilai tidak lengkap',
    ])->assertRedirect();

    expect($this->assessment->fresh()->state)->toBeInstanceOf(Rejected::class);
});

it('super_admin can reject verified assessment', function () {
    $this->assessment->state->transitionTo(Submitted::class);
    $this->assessment->state->transitionTo(Verified::class);

    $this->actingAs($this->admin)->post("/assessments/{$this->assessment->id}/transition", [
        'action'  => 'reject',
        'comment' => 'Perlu revisi',
    ])->assertRedirect();

    expect($this->assessment->fresh()->state)->toBeInstanceOf(Rejected::class);
});

it('guru cannot reject', function () {
    $this->assessment->state->transitionTo(Submitted::class);

    $this->actingAs($this->guru)->post("/assessments/{$this->assessment->id}/transition", [
        'action' => 'reject', 'comment' => 'test',
    ])->assertForbidden();
});

// ──────────────────────────────────────────────────────────────────
// Publish
// ──────────────────────────────────────────────────────────────────

it('super_admin can publish verified assessment', function () {
    $this->assessment->state->transitionTo(Submitted::class);
    $this->assessment->state->transitionTo(Verified::class);

    $this->actingAs($this->admin)->post("/assessments/{$this->assessment->id}/transition", [
        'action' => 'publish',
    ])->assertRedirect();

    expect($this->assessment->fresh()->state)->toBeInstanceOf(Published::class);
    expect($this->assessment->fresh()->published_at)->not->toBeNull();
});

it('wali_kelas cannot publish', function () {
    $this->assessment->state->transitionTo(Submitted::class);
    $this->assessment->state->transitionTo(Verified::class);

    $this->actingAs($this->wali)->post("/assessments/{$this->assessment->id}/transition", [
        'action' => 'publish',
    ])->assertForbidden();
});

// ──────────────────────────────────────────────────────────────────
// Reset to draft
// ──────────────────────────────────────────────────────────────────

it('guru can reset rejected assessment to draft', function () {
    $this->assessment->state->transitionTo(Submitted::class);
    $this->assessment->state->transitionTo(Rejected::class);

    $this->actingAs($this->guru)->post("/assessments/{$this->assessment->id}/transition", [
        'action' => 'reset',
    ])->assertRedirect();

    expect($this->assessment->fresh()->state)->toBeInstanceOf(Draft::class);
});

// ──────────────────────────────────────────────────────────────────
// Delete
// ──────────────────────────────────────────────────────────────────

it('guru can delete own draft', function () {
    $this->actingAs($this->guru)->delete("/assessments/{$this->assessment->id}")->assertRedirect();
    expect(Assessment::find($this->assessment->id))->toBeNull();
});

it('guru cannot delete submitted assessment', function () {
    $this->assessment->state->transitionTo(Submitted::class);
    $this->actingAs($this->guru)->delete("/assessments/{$this->assessment->id}")->assertForbidden();
});

it('super_admin can delete any assessment', function () {
    $this->actingAs($this->admin)->delete("/assessments/{$this->assessment->id}")->assertRedirect();
    expect(Assessment::find($this->assessment->id))->toBeNull();
});

// ──────────────────────────────────────────────────────────────────
// Approval trail
// ──────────────────────────────────────────────────────────────────

it('full workflow creates approval trail', function () {
    // submit
    $this->actingAs($this->guru)->post("/assessments/{$this->assessment->id}/transition", ['action' => 'submit']);
    // verify
    $this->actingAs($this->wali)->post("/assessments/{$this->assessment->id}/transition", ['action' => 'verify']);
    // publish
    $this->actingAs($this->admin)->post("/assessments/{$this->assessment->id}/transition", ['action' => 'publish']);

    $a = $this->assessment->fresh();
    expect($a->state)->toBeInstanceOf(Published::class);
    expect($a->approvals()->count())->toBe(3);
});
