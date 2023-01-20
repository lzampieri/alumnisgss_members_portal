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
    // Route::get('/backup', function () { Artisan::call('migrate', ['--force' => true]); } );
});