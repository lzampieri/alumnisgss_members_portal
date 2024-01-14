<?php

use App\Http\Controllers\IdentityController;
use App\Http\Controllers\PermissionsController;
use App\Http\Controllers\LoginMethodController;
use App\Http\Controllers\RolesController;
use Illuminate\Support\Facades\Route;

// Accesses
Route::prefix('/accesses')->group( function () {
    Route::get('/', [ LoginMethodController::class, 'list' ] )->name('accesses');
    
    Route::post('/enabling', [ IdentityController::class, 'enabling' ] )->name('identity.enabling');

    Route::post('/delete/{lmth}', [ LoginMethodController::class, 'delete' ] )->name('lmth.delete');

    // Roles
    Route::post('/edit_roles', [ IdentityController::class, 'edit_roles'])->name('identity.edit_roles');

    // Associate
    Route::get('/associate/{lmth}', [ LoginMethodController::class, 'associate'])->name('lmth.associate');
    Route::post('/associate/{lmth}', [ LoginMethodController::class, 'associate_post']);
});

// Permissions
Route::prefix('/permissions')->group( function () {
    Route::get('/', [ PermissionsController::class, 'list' ] )->name('permissions');
    Route::post('/', [ PermissionsController::class, 'update' ] );
    Route::post('/add', [ PermissionsController::class, 'add' ] )->name('permissions.add');
    Route::get('/verify', [ PermissionsController::class, 'verify' ] )->name('permissions.verify');
});

// Roles
Route::prefix('/roles')->group( function () {
    Route::post('/add', [ RolesController::class, 'add' ] )->name('roles.add');
});