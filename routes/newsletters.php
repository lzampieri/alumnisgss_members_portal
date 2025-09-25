<?php

use App\Http\Controllers\NewsletterController;
use Illuminate\Support\Facades\Route;

Route::prefix('/newsletters')->group( function () {
    Route::get('/', [ NewsletterController::class, 'list' ] )->name('newsletters');

    Route::get('/create', [ NewsletterController::class, 'create' ] )->name('newsletter.create');
    
    Route::get('/edit/{newsletter}', [ NewsletterController::class, 'edit' ] )->name('newsletter.edit');
    Route::post('/edit/{newsletter}', [ NewsletterController::class, 'edit_post' ] );
});