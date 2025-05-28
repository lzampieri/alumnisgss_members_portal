<?php


// Profile

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('/profile')->group(function () {
    Route::get('/', [ProfileController::class, 'myself'])->name('profile');
    
});