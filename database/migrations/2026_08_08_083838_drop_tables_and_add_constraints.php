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
        Schema::dropIfExists('alumni');
        Schema::dropIfExists('externals');

        Schema::table('ticket_comments', function (Blueprint $table) {
            if (Schema::hasColumn('ticket_comments', 'author_type')) {
                $table->dropColumn('author_type');
            }
            $table->foreign('author_id')->references('id')->on('people');
        });
        Schema::table('tickets', function (Blueprint $table) {
            if (Schema::hasColumn('tickets', 'author_type')) {
                $table->dropColumn('author_type');
            }
            $table->foreign('author_id')->references('id')->on('people');

            if (Schema::hasColumn('tickets', 'assigner_type')) {
                $table->dropColumn('assigner_type');
            }
            $table->foreign('assigner_id')->references('id')->on('people');
        });
        Schema::table('stamps', function (Blueprint $table) {
            if (Schema::hasColumn('stamps', 'employee_type')) {
                $table->dropColumn('employee_type');
            }
            $table->foreign('employee_id')->references('id')->on('people');
        });
        Schema::table('documents', function (Blueprint $table) {
            if (Schema::hasColumn('documents', 'author_type')) {
                $table->dropColumn('author_type');
            }
            $table->foreign('author_id')->references('id')->on('people');
        });
        Schema::table('ratifications', function (Blueprint $table) {
            $table->foreign('alumnus_id')->references('id')->on('people');
        });
        Schema::table('positions', function (Blueprint $table) {
            if (Schema::hasColumn('positions', 'owner_type')) {
                $table->dropColumn('owner_type');
            }
            $table->foreign('owner_id')->references('id')->on('people');
        });
        Schema::table('a_details', function (Blueprint $table) {
            if (Schema::hasColumn('a_details', 'identity_type')) {
                $table->dropColumn('identity_type');
            }
            $table->foreign('identity_id')->references('id')->on('people');
        });
        Schema::table('logs', function (Blueprint $table) {
            if (Schema::hasColumn('logs', 'agent_type')) {
                $table->dropColumn('agent_type');
            }
            $table->foreign('agent_id')->references('id')->on('people');
        });
        Schema::table('emails', function (Blueprint $table) {
            if (Schema::hasColumn('emails', 'identity_type')) {
                $table->dropColumn('identity_type');
            }
            $table->foreign('identity_id')->references('id')->on('people');
        });
        Schema::table('newsletters', function (Blueprint $table) {
            if (Schema::hasColumn('newsletters', 'owner_type')) {
                $table->dropColumn('owner_type');
            }
            $table->foreign('owner_id')->references('id')->on('people');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
