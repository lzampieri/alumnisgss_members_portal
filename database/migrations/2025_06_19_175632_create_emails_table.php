<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEmailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('emails', function (Blueprint $table) {
            $table->id();
            
            $table->timestamps();
            $table->string('address', 191)->unique();
            $table->timestamp('last_login')->nullable();

            $table->nullableMorphs('identity');
            $table->text('comment')->nullable();
            
            $table->boolean('primary')->default(0);

            $table->string('token', 500)->nullable();
            $table->timestamp('token_expdate')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('emails');
    }
}
