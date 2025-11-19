<?php


// Profile

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('/profile')->group(function () {
    Route::get('/', [ProfileController::class, 'myself'])->name('profile');

    Route::get('/emailConsent', [ProfileController::class, 'emailConsent'])->name('profile.email_consent');
    Route::post('/emailConsent', [ProfileController::class, 'emailConsent_post']);

    Route::get('/dataConsent', [ProfileController::class, 'dataConsent'])->name('profile.data_consent');
    Route::post('/dataConsent', [ProfileController::class, 'dataConsent_post']);

    Route::post('/addEmail', [ProfileController::class, 'addEmail_post'])->name('profile.add_email');
    Route::post('/setPrimary', [ProfileController::class, 'setPrimary_post'])->name('profile.set_primary');
    
    Route::get('/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/edit', [ProfileController::class, 'edit_post']);
    
});