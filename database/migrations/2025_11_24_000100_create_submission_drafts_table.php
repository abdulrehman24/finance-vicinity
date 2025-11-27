<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('submission_drafts', function (Blueprint $table) {
            $table->id();
            $table->string('user_email');
            $table->string('bill_to')->nullable();
            $table->string('document_type');
            $table->string('project_code')->nullable();
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('status')->default('draft');
            $table->json('amount_rows')->nullable();
            $table->json('files')->nullable();
            $table->unsignedTinyInteger('current_step')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submission_drafts');
    }
};

