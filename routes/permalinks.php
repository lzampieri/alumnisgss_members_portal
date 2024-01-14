<?php

use App\Http\Controllers\PermalinkController;
use Illuminate\Support\Facades\Route;

// Permalinks
Route::get('/p/{permalink}', [ PermalinkController::class, 'view' ] )->name('permalink');