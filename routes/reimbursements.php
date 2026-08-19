<?php

use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

// Tickets
Route::prefix('/projects')->group(function () {

    Route::get('/', [ProjectController::class, 'home'])->name('projects');
    Route::post('/edit', [ProjectController::class, 'edit'])->name('projects.edit');
});
