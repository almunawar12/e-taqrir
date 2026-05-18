<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('assessments', function (Blueprint $table) {
            if (! Schema::hasColumn('assessments', 'type')) {
                $table->string('type', 20)->default('harian')->after('semester');
            }
            // add new unique first so FK constraint has an index to use
            $table->unique(['classroom_id', 'subject_id', 'academic_year', 'semester', 'type'], 'assessments_unique_v2');
        });

        Schema::table('assessments', function (Blueprint $table) {
            $table->dropUnique('assessments_unique');
        });
    }

    public function down(): void
    {
        Schema::table('assessments', function (Blueprint $table) {
            $table->unique(['classroom_id', 'subject_id', 'academic_year', 'semester'], 'assessments_unique');
        });

        Schema::table('assessments', function (Blueprint $table) {
            $table->dropUnique('assessments_unique_v2');
            $table->dropColumn('type');
        });
    }
};
