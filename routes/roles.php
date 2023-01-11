<?php

use App\Http\Controllers\PermissionsController;
use App\Http\Controllers\LoginMethodController;
use Illuminate\Support\Facades\Route;

// Accesses
Route::prefix('/accesses')->group( function () {
    Route::get('/', [ LoginMethodController::class, 'list' ] )->name('accesses');
    
    Route::post('/enabling', [ LoginMethodController::class, 'enabling' ] )->name('identity.enabling');
    // Route::post('/roles/{user}', [ LoginMethodController::class, 'roles' ] )->name('user.roles');

    Route::post('/delete/{lmth}', [ LoginMethodController::class, 'delete' ] )->name('lmth.delete');
});

// Permissions
Route::prefix('/permissions')->group( function () {
    Route::get('/', [ PermissionsController::class, 'list' ] )->name('permissions');
    Route::post('/', [ PermissionsController::class, 'update' ] );
    Route::post('/add', [ PermissionsController::class, 'add' ] )->name('permissions.add');
    Route::get('/verify', [ PermissionsController::class, 'verify' ] )->name('permissions.verify');
});