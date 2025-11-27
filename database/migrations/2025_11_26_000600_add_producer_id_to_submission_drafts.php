<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('submission_drafts', function (Blueprint $table) {
            $table->foreignId('producer_id')->nullable()->after('producer_in_charge')->constrained('producers')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('submission_drafts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('producer_id');
        });
    }
};

