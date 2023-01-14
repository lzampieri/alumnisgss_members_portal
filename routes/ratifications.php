<?php

use App\Http\Controllers\RatificationController;
use Illuminate\Support\Facades\Route;

// Documents
Route::prefix('/ratifications')->group( function () {
    Route::get('/', [ RatificationController::class, 'list' ] )->name('ratifications');

    Route::get('/add', [ RatificationController::class, 'add' ] )->name('ratifications.add');
    Route::post('/add', [ RatificationController::class, 'add_post' ] );
});