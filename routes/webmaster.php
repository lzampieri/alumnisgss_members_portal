<?php

use App\Http\Controllers\Log;
use App\Http\Controllers\WebmasterController;
use App\Models\Alumnus;
use App\Models\Document;
use App\Models\DynamicPermission;
use App\Models\External;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

Route::prefix('/webmaster')->group( function () {

    Route::get('/', [ WebmasterController::class, 'home' ])->name('webmaster');

    // Log
    Route::get('/logs', [ Log::class, 'index' ] )->name('log');
    Route::prefix('/log')->group( function () {
        Route::get('/internal', [ WebmasterController::class, 'log_internal' ])->name('webmaster.log.internal');
        Route::get('/internal/getrows/{perPage}/{page}', [ WebmasterController::class, 'log_internal_getrows' ])
            ->where(['perPage' => '[0-9]+', 'page' => '[0-9]+' ])->name('webmaster.log.internal.getrows');
    });

    // backup
    Route::get('/backup', [ WebmasterController::class, 'backup' ])->name('webmaster.backup');
    Route::get('/decryptUtility', [ WebmasterController::class, 'decryptUtility' ])->name('webmaster.decryptUtility');
    Route::post('/decryptUtility', [ WebmasterController::class, 'decryptUtilityPost' ])->name('webmaster.decryptUtility');

    // migrations
    Route::get('/migrate', [ WebmasterController::class, 'migrate' ])->name('webmaster.migrate');
    Route::get('/remigrate', [ WebmasterController::class, 'remigrate' ])->name('webmaster.remigrate');
    Route::get('/partremigrate/{count}', [ WebmasterController::class, 'partremigrate' ])->name('webmaster.partremigrate');
    
    // test
    Route::get('/sendTestMail', [ WebmasterController::class, 'sendTestMail' ])->name('webmaster.sendTestMail');
});