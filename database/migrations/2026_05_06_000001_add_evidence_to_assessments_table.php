<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assessments', function (Blueprint $table) {
            $table->string('evidence_path')->nullable()->after('comment');
            $table->string('evidence_disk')->default('evidence')->after('evidence_path');
            $table->string('evidence_name')->nullable()->after('evidence_disk');
        });
    }

    public function down(): void
    {
        Schema::table('assessments', function (Blueprint $table) {
            $table->dropColumn(['evidence_path', 'evidence_disk', 'evidence_name']);
        });
    }
};
