<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDynamicPermissionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('dynamic_permissions', function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->string('type',20)->default('view');
            $table->foreignId('role_id')->constrained();
            $table->morphs('permissable');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('dynamic_permissions');
    }
}
