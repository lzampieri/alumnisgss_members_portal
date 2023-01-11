<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLoginMethodsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('login_methods', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->timestamp('last_login')->nullable();
            $table->string('driver', 50);
            $table->string('credential', 200);
            $table->nullableMorphs('identity');

            $table->unique(['driver', 'credential']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('login_methods');
    }
}
