<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Registry
Route::prefix('/roles')->group( function () {
    Route::get('/', [ UserController::class, 'list' ] )->name('roles');
    
    Route::post('/enabling/{user}', [ UserController::class, 'enabling' ] )->name('user.enabling');
    Route::post('/roles/{user}', [ UserController::class, 'roles' ] )->name('user.roles');
});