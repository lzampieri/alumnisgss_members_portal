<?php

use App\Http\Controllers\ResourceController;
use Illuminate\Support\Facades\Route;

// Documents
Route::prefix('/resources')->group( function () {
    Route::get('/{resource?}', [ ResourceController::class, 'list' ] )->name('resources');
   
    // Resource management
    Route::post('/create', [ ResourceController::class, 'create' ] )->name('resources.create');
    Route::post('/updatePermissions', [ ResourceController::class, 'update_permissions' ] )->name('resources.updatePermissions');
    Route::post('/updateContent', [ ResourceController::class, 'update_content' ] )->name('resources.updateContent');
    Route::post('/delete', [ ResourceController::class, 'delete' ] )->name('resources.delete');
});