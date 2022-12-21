<?php

use App\Http\Controllers\AlumnusController;
use Illuminate\Support\Facades\Route;

// Public pages
Route::prefix('/members')->group( function () {
    Route::get('/', [ AlumnusController::class, 'membersList' ] )->name('members');
});