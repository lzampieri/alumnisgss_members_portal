<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRatificationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('ratifications', function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->string('required_state',50);
            $table->foreignId('alumnus_id')->constrained();
            $table->foreignId('document_id')->constrained()->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('ratifications');
    }
}
