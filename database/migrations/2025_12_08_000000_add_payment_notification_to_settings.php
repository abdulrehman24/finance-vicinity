<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->string('payment_notification_title')->nullable()->after('favicon_path');
            $table->text('payment_notification_text')->nullable()->after('payment_notification_title');
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn(['payment_notification_title', 'payment_notification_text']);
        });
    }
};
