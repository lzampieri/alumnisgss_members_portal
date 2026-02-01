<?php

use App\Http\Controllers\PositionController;
use Illuminate\Support\Facades\Route;

// Tickets
Route::prefix('/positions')->group(function () {

    Route::get('/', [PositionController::class, 'home'])->name('positions');
    Route::get('/api', [PositionController::class, 'api'])->name('positions.api');
    
    Route::post('/create', [PositionController::class, 'create'])->name('positions.create');
    Route::post('/edit/{position}', [PositionController::class, 'edit'])->name('positions.edit');
});
