<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('submission_drafts', function (Blueprint $table) {
            $table->string('invoice_number')->nullable()->unique()->after('id');
        });
    }

    public function down(): void
    {
        Schema::table('submission_drafts', function (Blueprint $table) {
            $table->dropUnique(['invoice_number']);
            $table->dropColumn('invoice_number');
        });
    }
};

