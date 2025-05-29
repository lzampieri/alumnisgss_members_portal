<?php


// Profile

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('/profile')->group(function () {
    Route::get('/', [ProfileController::class, 'myself'])->name('profile');

    Route::get('/dataConsent', [ProfileController::class, 'dataConsent'])->name('profile.data_consent');
    Route::post('/dataConsent', [ProfileController::class, 'dataConsent_post']);
    
    Route::get('/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/edit', [ProfileController::class, 'edit_post']);
    
});