<?php

use App\Http\Controllers\FileController;
use App\Http\Controllers\ResourceController;
use Illuminate\Support\Facades\Route;

// Documents
Route::prefix('/resources')->group( function () {
    Route::get('/{resource?}', [ ResourceController::class, 'list' ] )->where('resource', '[0-9]+')->name('resources');
    Route::get('/f/{handle}', [ FileController::class, 'fromHandle' ] )->name('resources.file');
    Route::get('/archive', [ ResourceController::class, 'archive_list' ] )->name('resources.archive');
   
    // Resource management
    Route::post('/create', [ ResourceController::class, 'create' ] )->name('resources.create');
    Route::post('/updatePermissions', [ ResourceController::class, 'update_permissions' ] )->name('resources.updatePermissions');
    Route::post('/updatePermissionsAll', [ ResourceController::class, 'update_permissions_all' ] )->name('resources.updatePermissionsAll');
    Route::post('/updateTitle/{resource}', [ ResourceController::class, 'update_title' ] )->name('resources.updateTitle');
    Route::post('/updateContent', [ ResourceController::class, 'update_content' ] )->name('resources.updateContent');
    Route::post('/uploadFile', [ ResourceController::class, 'upload_file' ] )->name('resources.uploadFile');
    Route::get('/image/{handle?}', [ ResourceController::class, 'retrive_image' ] )->name('resources.image');
    Route::post('/uploadImage', [ ResourceController::class, 'upload_image' ] )->name('resources.uploadImage');
    Route::post('/archive', [ ResourceController::class, 'archive' ] ); // ->name('resources.archive')
    Route::post('/delete', [ ResourceController::class, 'delete' ] )->name('resources.delete');
    Route::post('/addPermalink', [ ResourceController::class, 'add_permalink' ] )->name('resources.addPermalink');
    Route::post('/magicLink/{resource}', [ ResourceController::class, 'magic_link' ] )->name('resources.magicLink');

    // Media in text resources
    Route::get('/media/{handle}', [ ResourceController::class, 'retrive_img_editor' ] )->name('resources.retrive_img_editor');
    Route::post('/media/{resource}', [ ResourceController::class, 'upload_img_editor' ] )->name('resources.upload_img_editor');
});