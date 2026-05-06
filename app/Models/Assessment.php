<?php

namespace App\Models;

use App\Domain\Assessment\States\AssessmentState;
use App\Domain\Assessment\States\Draft;
use App\Domain\Assessment\States\Published;
use App\Domain\Assessment\States\Rejected;
use App\Domain\Assessment\States\Submitted;
use App\Domain\Assessment\States\Verified;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\ModelStates\HasStates;

class Assessment extends Model
{
    use HasStates;

    protected $fillable = [
        'classroom_id',
        'subject_id',
        'teacher_id',
        'academic_year',
        'semester',
        'state',
        'comment',
        'submitted_at',
        'verified_at',
        'published_at',
        'evidence_path',
        'evidence_disk',
        'evidence_name',
    ];

    protected $casts = [
        'state' => AssessmentState::class,
        'submitted_at' => 'datetime',
        'verified_at' => 'datetime',
        'published_at' => 'datetime',
        'semester' => 'integer',
    ];

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(AssessmentItem::class);
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(Approval::class)->orderBy('created_at');
    }

    public function isDraft(): bool      { return $this->state instanceof Draft; }
    public function isSubmitted(): bool  { return $this->state instanceof Submitted; }
    public function isVerified(): bool   { return $this->state instanceof Verified; }
    public function isPublished(): bool  { return $this->state instanceof Published; }
    public function isRejected(): bool   { return $this->state instanceof Rejected; }
}
