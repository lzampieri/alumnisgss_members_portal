<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\LoginMethodController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group( function () {
    Route::prefix('google')->group( function () {

        Route::get('login', [ AuthController::class, 'redirect' ] )->name('auth.login.google');

        Route::get('callback', [ AuthController::class, 'callback' ] );
        
    });

    Route::redirect('login','google/login')->name('login');

    Route::get('askaccess', [ AuthController::class, 'askaccess' ] )->name('auth.askaccess');
    Route::post('askaccess', [ AuthController::class, 'askaccess_post' ] );

    Route::get('logout', [ AuthController::class, 'logout' ])->name('auth.logout');

    // Level 2
    Route::prefix('google_lv2')->group( function () {

        Route::get('login', [ AuthController::class, 'redirect_lv2' ] )->name('auth.login_lv2.google');

        Route::get('callback', [ AuthController::class, 'callback_lv2' ] )->name('auth.callback_lv2.google');;
        
    });
});