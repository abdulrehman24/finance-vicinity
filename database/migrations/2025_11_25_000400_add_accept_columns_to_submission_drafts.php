<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('submission_drafts', function (Blueprint $table) {
            $table->string('accepted_by_producer')->nullable()->after('status');
            $table->string('accepted_by_finance')->nullable()->after('accepted_by_producer');
        });
    }

    public function down(): void
    {
        Schema::table('submission_drafts', function (Blueprint $table) {
            $table->dropColumn('accepted_by_finance');
            $table->dropColumn('accepted_by_producer');
        });
    }
};

