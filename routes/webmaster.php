<?php

use App\Http\Controllers\Log;
use App\Http\Controllers\WebmasterController;
use Illuminate\Support\Facades\Route;

Route::prefix('/webmaster')->group( function () {

    Route::get('/', [ WebmasterController::class, 'home' ])->name('webmaster');

    // Log
    Route::get('/logs', [ Log::class, 'index' ] )->name('log');

    // backup
    Route::get('/backup', [ WebmasterController::class, 'backup' ])->name('webmaster.backup');

    // migrations
    Route::get('/migrate', [ WebmasterController::class, 'migrate' ])->name('webmaster.migrate');
    Route::get('/remigrate', [ WebmasterController::class, 'remigrate' ])->name('webmaster.remigrate');
});