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
        Schema::create('people', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->string('surname', 500);
            $table->string('name', 500);
            $table->string('notes', 500)->nullable();

            // Coorte field distinguish alumni and non-alumni
            $table->integer('coorte');

            // Fields only for alumni
            $table->string('status', 50)->nullable();
            $table->text('tags');
            $table->boolean('consent_to_network_share')->default(false);
            $table->boolean('consent_to_email_share')->default(false);

        });;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('people');
    }
};
