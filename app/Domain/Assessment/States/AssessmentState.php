<?php

namespace App\Domain\Assessment\States;

use Spatie\ModelStates\State;
use Spatie\ModelStates\StateConfig;

abstract class AssessmentState extends State
{
    public static function config(): StateConfig
    {
        return parent::config()
            ->default(Draft::class)
            ->allowTransition(Draft::class, Submitted::class)
            ->allowTransition(Submitted::class, Verified::class)
            ->allowTransition(Submitted::class, Rejected::class)
            ->allowTransition(Verified::class, Published::class)
            ->allowTransition(Verified::class, Rejected::class)
            ->allowTransition(Rejected::class, Draft::class);
    }
}
