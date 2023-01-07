<?php

use App\Http\Controllers\PermissionsController;
use App\Http\Controllers\LoginMethodController;
use Illuminate\Support\Facades\Route;

// Accesses
Route::prefix('/roles')->group( function () {
    Route::get('/', [ LoginMethodController::class, 'list' ] )->name('roles');
    
    Route::post('/enabling/{user}', [ LoginMethodController::class, 'enabling' ] )->name('user.enabling');
    Route::post('/roles/{user}', [ LoginMethodController::class, 'roles' ] )->name('user.roles');
});

// Permissions
Route::prefix('/permissions')->group( function () {
    Route::get('/', [ PermissionsController::class, 'list' ] )->name('permissions');
    Route::post('/', [ PermissionsController::class, 'update' ] );
    Route::post('/add', [ PermissionsController::class, 'add' ] )->name('permissions.add');
    Route::get('/verify', [ PermissionsController::class, 'verify' ] )->name('permissions.verify');
});