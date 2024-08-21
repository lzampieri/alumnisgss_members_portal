<?php

use App\Http\Controllers\ReportsController;
use Illuminate\Support\Facades\Route;

// Documents
Route::prefix('/reports')->group( function () {
    Route::get('/', [ ReportsController::class, 'home' ] )->name('reports');

    // Members variations
    Route::get('/members_variations', [ ReportsController::class, 'members_variations' ])->name('reports.members_variations');
});