<?php

use App\Http\Controllers\FileController;
use App\Http\Controllers\ResourceController;
use Illuminate\Support\Facades\Route;

// Documents
Route::prefix('/resources')->group( function () {
    Route::get('/{resource?}', [ ResourceController::class, 'list' ] )->where('resource', '[0-9]+')->name('resources');
    Route::get('/f/{handle}', [ FileController::class, 'fromHandle' ] )->name('resources.file');
   
    // Resource management
    Route::post('/create', [ ResourceController::class, 'create' ] )->name('resources.create');
    Route::post('/updatePermissions', [ ResourceController::class, 'update_permissions' ] )->name('resources.updatePermissions');
    Route::post('/updateTitle/{resource}', [ ResourceController::class, 'update_title' ] )->name('resources.updateTitle');
    Route::post('/updateContent', [ ResourceController::class, 'update_content' ] )->name('resources.updateContent');
    Route::post('/uploadFile', [ ResourceController::class, 'upload_file' ] )->name('resources.uploadFile');
    Route::get('/image/{handle?}', [ ResourceController::class, 'retrive_image' ] )->name('resources.image');
    Route::post('/uploadImage', [ ResourceController::class, 'upload_image' ] )->name('resources.uploadImage');
    Route::post('/delete', [ ResourceController::class, 'delete' ] )->name('resources.delete');
    Route::post('/addPermalink', [ ResourceController::class, 'add_permalink' ] )->name('resources.addPermalink');
    Route::post('/magicLink/{resource}', [ ResourceController::class, 'magic_link' ] )->name('resources.magicLink');
});