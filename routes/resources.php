<?php

use App\Http\Controllers\ResourceController;
use Illuminate\Support\Facades\Route;

// Documents
Route::prefix('/resources')->group( function () {
    Route::get('/', [ ResourceController::class, 'list' ] )->name('resources');
});