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
        Schema::create('reimbursements', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('project_id')->nullable()->constrained();

            $table->longText('motivation')->nullable();
            $table->longText('notes')->nullable();
            $table->longText('content')->nullable();
            $table->longText('internal_notes')->nullable();

            $table->float('total', 2);

            $table->foreignId('author_id')->references('id')->on('people');
            $table->timestamp('sent')->nullable();
            
            $table->foreignId('approver_id')->nullable()->references('id')->on('people');
            $table->timestamp('approved')->nullable();

            $table->foreignId('payer_id')->nullable()->references('id')->on('people');
            $table->timestamp('paid')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reimbursements');
    }
};
