<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group( function () {
    // General
    Route::redirect('login','google/login')->name('login');
    Route::get('logout', [ AuthController::class, 'logout' ])->name('auth.logout');


    // Google
    Route::prefix('google')->group( function () {
        Route::get('login', [ AuthController::class, 'redirect' ] )->name('auth.login.google');
        Route::get('callback', [ AuthController::class, 'callback' ] );
        
    });

    // OTP
    Route::prefix('otp')->group( function () {
        Route::post('send_otp', [ AuthController::class, 'sendOtp' ] )->name('auth.otp.send_otp');
        // Route::get('callback', [ AuthController::class, 'callback' ] );
    });


    // New user
    Route::get('askaccess', [ AuthController::class, 'askaccess' ] )->name('auth.askaccess');
    Route::post('askaccess', [ AuthController::class, 'askaccess_post' ] );
    Route::post('askaccess_otp', [ AuthController::class, 'askaccess' ] )->name('auth.askaccess_otp');

    // Level 2
    Route::prefix('google_lv2')->group( function () {

        Route::get('login', [ AuthController::class, 'redirect_lv2' ] )->name('auth.login_lv2.google');

        Route::get('callback', [ AuthController::class, 'callback_lv2' ] )->name('auth.callback_lv2.google');;
        
    });
});