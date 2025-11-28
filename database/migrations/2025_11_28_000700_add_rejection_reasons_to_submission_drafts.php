<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('submission_drafts', function (Blueprint $table) {
            $table->text('producer_rejection_reason')->nullable()->after('accepted_by_producer');
            $table->text('finance_rejection_reason')->nullable()->after('producer_rejection_reason');
        });
    }

    public function down(): void
    {
        Schema::table('submission_drafts', function (Blueprint $table) {
            $table->dropColumn('finance_rejection_reason');
            $table->dropColumn('producer_rejection_reason');
        });
    }
};

