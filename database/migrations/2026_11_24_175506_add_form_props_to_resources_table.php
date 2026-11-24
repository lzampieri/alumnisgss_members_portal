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
        Schema::table('resources', function (Blueprint $table) {
            $table->boolean('form_open')->default(true);
            $table->text('form_email_to')->nullable();
        });

        Schema::table('form_responses', function (Blueprint $table) {
            $table->text('form_email_to')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
