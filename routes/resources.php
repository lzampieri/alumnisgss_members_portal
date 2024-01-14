<?php

use App\Http\Controllers\FileController;
use App\Http\Controllers\ResourceController;
use Illuminate\Support\Facades\Route;

// Documents
Route::prefix('/resources')->group( function () {
    Route::get('/{resource?}', [ ResourceController::class, 'list' ] )->name('resources');
    Route::get('/f/{handle}', [ FileController::class, 'fromHandle' ] )->name('resources.file');
   
    // Resource management
    Route::post('/create', [ ResourceController::class, 'create' ] )->name('resources.create');
    Route::post('/updatePermissions', [ ResourceController::class, 'update_permissions' ] )->name('resources.updatePermissions');
    Route::post('/updateContent', [ ResourceController::class, 'update_content' ] )->name('resources.updateContent');
    Route::post('/uploadFile', [ ResourceController::class, 'upload_file' ] )->name('resources.uploadFile');
    Route::post('/delete', [ ResourceController::class, 'delete' ] )->name('resources.delete');
    Route::post('/addPermalink', [ ResourceController::class, 'add_permalink' ] )->name('resources.addPermalink');
});