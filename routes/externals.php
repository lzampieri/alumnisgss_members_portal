<?php

use App\Http\Controllers\ExternalController;
use Illuminate\Support\Facades\Route;

Route::prefix('/externals')->group( function () {
    // Route::get('/add', [ ExternalController::class, 'add' ] )->name('externals.add');
    // Route::post('/add', [ ExternalController::class, 'add_post' ] );

    Route::post('/add/{lmth}', [ ExternalController::class, 'add_and_associate_post' ] )->name('externals.add_and_associate');
});