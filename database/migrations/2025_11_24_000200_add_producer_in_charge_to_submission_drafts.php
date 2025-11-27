<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('submission_drafts', function (Blueprint $table) {
            $table->string('producer_in_charge')->nullable()->after('user_email');
        });
    }

    public function down(): void
    {
        Schema::table('submission_drafts', function (Blueprint $table) {
            $table->dropColumn('producer_in_charge');
        });
    }
};

