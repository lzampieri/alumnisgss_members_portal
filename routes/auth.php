<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group( function () {
    Route::prefix('google')->group( function () {

        Route::get('login', [ AuthController::class, 'redirect' ] )->name('auth.login.google');
        Route::get('callback', [ AuthController::class, 'callback' ] );

    });

    Route::get('askaccess', [ AuthController::class, 'askaccess' ] )->name('auth.askaccess');
    Route::post('askaccess', [ AuthController::class, 'askaccess_post' ] );

    Route::get('logout', [ AuthController::class, 'logout' ])->name('auth.logout');
});