<?php

use App\Http\Controllers\EmailController;
use App\Http\Controllers\IdentityController;
use App\Http\Controllers\PermissionsController;
use App\Http\Controllers\RolesController;
use Illuminate\Support\Facades\Route;

// Accesses
Route::prefix('/accesses')->group( function () {
    Route::get('/', [ EmailController::class, 'list' ] )->name('accesses');
    
    Route::post('/enabling', [ IdentityController::class, 'enabling' ] )->name('identity.enabling');  // TODO refactor

    // Roles
    Route::post('/edit_roles', [ IdentityController::class, 'edit_roles'])->name('identity.edit_roles'); // TODO refactor

});

Route::prefix('/emails')->group( function () {
    Route::post('manually_add', [ EmailController::class, 'manually_add_post' ] )->name('emails.manually_add');
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
    Route::post('/add', [ RolesController::class, 'add' ] )->name('roles.add');
});