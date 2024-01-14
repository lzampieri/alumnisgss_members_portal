<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\LoginMethodController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group( function () {
    Route::prefix('google')->group( function () {

        Route::get('login', [ AuthController::class, 'redirect' ] )->name('auth.login.google');
        Route::get('callback', [ AuthController::class, 'callback' ] );

    });

    Route::get('askaccess', [ LoginMethodController::class, 'askaccess' ] )->name('auth.askaccess');
    Route::post('askaccess', [ LoginMethodController::class, 'askaccess_post' ] );

    Route::get('manually_add', [ LoginMethodController::class, 'manually_add' ] )->name('auth.manually_add');
    Route::post('manually_add', [ LoginMethodController::class, 'manually_add_post' ] );

    Route::get('logout', [ AuthController::class, 'logout' ])->name('auth.logout');
});