<?php

use App\Http\Controllers\RatificationController;
use Illuminate\Support\Facades\Route;

// Documents
Route::prefix('/ratification')->group( function () {
    Route::get('/', [ RatificationController::class, 'list' ] )->name('ratifications');
});