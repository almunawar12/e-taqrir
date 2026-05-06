<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->string('academic_year', 20);
            $table->unsignedTinyInteger('semester');   // 1 or 2
            $table->string('state', 30)->default('draft');
            $table->text('comment')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->unique(['classroom_id', 'subject_id', 'academic_year', 'semester'], 'assessments_unique');
            $table->index('state');
            $table->index('teacher_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessments');
    }
};
