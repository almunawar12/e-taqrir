<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('student_absences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('classroom_id')->constrained()->cascadeOnDelete();
            $table->string('academic_year', 9);
            $table->tinyInteger('semester');
            $table->unsignedSmallInteger('sakit')->default(0);
            $table->unsignedSmallInteger('izin')->default(0);
            $table->unsignedSmallInteger('alpha')->default(0);
            $table->timestamps();
            $table->unique(['student_id', 'classroom_id', 'academic_year', 'semester'], 'absence_unique');
        });
    }
    public function down(): void { Schema::dropIfExists('student_absences'); }
};
