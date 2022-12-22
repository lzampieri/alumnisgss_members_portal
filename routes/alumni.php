<?php

use App\Http\Controllers\AlumnusController;
use Illuminate\Support\Facades\Route;

// Members
Route::prefix('/members')->group( function () {
    Route::get('/', [ AlumnusController::class, 'membersList' ] )->name('members');
});

// Registry
Route::prefix('/registry')->group( function () {
    Route::get('/', [ AlumnusController::class, 'list' ] )->name('registry');

    Route::get('/add', [ AlumnusController::class, 'add' ] )->name('registry.add');
    Route::post('/add', [ AlumnusController::class, 'add_post' ] );
});