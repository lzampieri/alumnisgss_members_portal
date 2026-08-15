<?php

use App\Http\Controllers\EmailController;
use App\Http\Controllers\PersonController;
use App\Http\Controllers\PermissionsController;
use App\Http\Controllers\RolesController;
use App\Models\Permission;
use Illuminate\Support\Facades\Route;

// Accesses
Route::prefix('/accesses')->group( function () {
    Route::get('/', [ PersonController::class, 'accessesList' ] )->name('accesses');
    
    Route::post('/enabled', [ PersonController::class, 'enabled' ] )->name('identity.enabled');
});

Route::prefix('/emails')->group( function () {
    Route::post('manually_add', [ EmailController::class, 'manually_add_post' ] )->name('emails.manually_add');
    Route::post('setPrimary', [ EmailController::class, 'set_primary_post' ] )->name('emails.setPrimary');
    Route::post('delete', [ EmailController::class, 'delete_post' ] )->name('emails.delete');
    
    // Associate
    Route::get('/associate/{email}', [ EmailController::class, 'associate'])->name('emails.associate');
    Route::post('/associate/{email}', [ EmailController::class, 'associate_post']);
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
    Route::post('/create', [ RolesController::class, 'create' ] )->name('roles.create');
    Route::post('/delete', [ RolesController::class, 'delete' ] )->name('roles.delete');

    Route::post('/add', [ RolesController::class, 'add' ] )->name('roles.add');
    Route::post('/remove', [ RolesController::class, 'remove' ] )->name('roles.remove');

    Route::get('/list', [ RolesController::class, 'manage'] )->name('roles.list');
    Route::get('/role/{role}', [ RolesController::class, 'manage'] )->name('roles.role');
    Route::post('/updatePermissions', [ RolesController::class, 'update_permissions' ] )->name('roles.updatePermissions');
});