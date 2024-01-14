<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAwsSessionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('aws_sessions', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->string('aws_ref',100);
            $table->string('ip',100);
            $table->timestamp('starttime')->nullable();
            $table->timestamp('endtime')->nullable();
            $table->text('note')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('aws_sessions');
    }
}
