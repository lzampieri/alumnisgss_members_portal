<?php

use App\Http\Controllers\AlumnusController;
use App\Http\Controllers\AlumnusExportImportController;
use App\Http\Controllers\NetworkController;
use Illuminate\Support\Facades\Route;

// Network
Route::prefix('/network')->group(function () {
    Route::get('/', [NetworkController::class, 'list'])->name('network');
    
    Route::get('/edit/{alumnus}', [NetworkController::class, 'edit'])->name('network.edit');

    Route::get('/settings', [NetworkController::class, 'settings'])->name('network.settings');
    Route::post('/settings/adtedit', [NetworkController::class, 'adtedit'])->name('network.settings.adtedit');
    Route::post('/settings/adtdelete', [NetworkController::class, 'adtdelete'])->name('network.settings.adtdelete');
});