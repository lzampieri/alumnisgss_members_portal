<?php

use App\Http\Controllers\AlumnusController;
use App\Http\Controllers\AlumnusExportImportController;
use App\Http\Controllers\NetworkController;
use Illuminate\Support\Facades\Route;

// Network
Route::prefix('/network')->group(function () {
    Route::get('/', [NetworkController::class, 'list'])->name('network');
});