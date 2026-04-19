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
        Schema::create('mailing_list_newsletter', function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->foreignId('mailing_list_id')->constrained();
            $table->foreignId('newsletter_id')->constrained();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mailing_list_newsletter');
    }
};
