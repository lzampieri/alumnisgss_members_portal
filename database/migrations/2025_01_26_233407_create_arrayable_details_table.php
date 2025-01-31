<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateArrayableDetailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('arrayable_details', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->softDeletes();
            $table->morphs('identity');
            $table->foreignId('arrayable_details_type_id')->constrained();
            $table->text('value');
            $table->unique(['identity_id', 'identity_type', 'arrayable_details_type_id'], 'identity_arrayable_details_unique');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('arrayable_details');
    }
}
