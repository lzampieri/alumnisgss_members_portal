<?php

use App\Http\Controllers\RatificationController;
use Illuminate\Support\Facades\Route;

// Documents
Route::prefix('/ratifications')->group( function () {
    Route::get('/', [ RatificationController::class, 'list' ] )->name('ratifications');

    Route::get('/add', [ RatificationController::class, 'add' ] )->name('ratifications.add');
    Route::post('/add', [ RatificationController::class, 'add_post' ] );
    Route::post('/delete/{rat}', [ RatificationController::class, 'delete_post' ] )->name('ratifications.delete');

    Route::get('/export', [ RatificationController::class, 'export' ] )->name('ratifications.export');
});