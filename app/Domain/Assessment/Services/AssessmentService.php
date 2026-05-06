<?php

namespace App\Domain\Assessment\Services;

use App\Domain\Assessment\States\Draft;
use App\Domain\Assessment\States\Published;
use App\Domain\Assessment\States\Rejected;
use App\Domain\Assessment\States\Submitted;
use App\Domain\Assessment\States\Verified;
use App\Domain\Audit\Services\AuditLogger;
use App\Models\Assessment;
use App\Models\Approval;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AssessmentService
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function submit(Assessment $assessment, User $actor, ?string $comment = null): Assessment
    {
        return $this->transition($assessment, $actor, Submitted::class, $comment, ['submitted_at' => now()]);
    }

    public function verify(Assessment $assessment, User $actor, ?string $comment = null): Assessment
    {
        return $this->transition($assessment, $actor, Verified::class, $comment, ['verified_at' => now()]);
    }

    public function reject(Assessment $assessment, User $actor, string $comment): Assessment
    {
        return $this->transition($assessment, $actor, Rejected::class, $comment);
    }

    public function publish(Assessment $assessment, User $actor, ?string $comment = null): Assessment
    {
        return $this->transition($assessment, $actor, Published::class, $comment, ['published_at' => now()]);
    }

    public function resetToDraft(Assessment $assessment, User $actor, ?string $comment = null): Assessment
    {
        return $this->transition($assessment, $actor, Draft::class, $comment);
    }

    private function transition(
        Assessment $assessment,
        User $actor,
        string $toStateClass,
        ?string $comment,
        array $timestamps = [],
    ): Assessment {
        return DB::transaction(function () use ($assessment, $actor, $toStateClass, $comment, $timestamps) {
            $fromState = (string) $assessment->state;

            $assessment->state->transitionTo($toStateClass);

            if ($timestamps) {
                $assessment->forceFill($timestamps)->save();
            }

            if ($comment !== null) {
                $assessment->forceFill(['comment' => $comment])->save();
            }

            Approval::create([
                'assessment_id' => $assessment->id,
                'user_id' => $actor->id,
                'from_state' => $fromState,
                'to_state' => (string) $assessment->fresh()->state,
                'comment' => $comment,
            ]);

            $this->audit->log(
                event: "assessment.{$this->eventName($toStateClass)}",
                auditable: $assessment,
                before: ['state' => $fromState],
                after: ['state' => (string) $assessment->state],
                user: $actor,
            );

            return $assessment->fresh();
        });
    }

    private function eventName(string $stateClass): string
    {
        return match ($stateClass) {
            Submitted::class => 'submitted',
            Verified::class  => 'verified',
            Rejected::class  => 'rejected',
            Published::class => 'published',
            Draft::class     => 'reset',
            default          => 'transitioned',
        };
    }
}
