<?php

use App\Http\Controllers\DocumentsController;
use Illuminate\Support\Facades\Route;

// Documents
Route::prefix('/board')->group( function () {
    Route::get('/', [ DocumentsController::class, 'list' ] )->name('board');
    Route::get('/add', [ DocumentsController::class, 'add' ] )->name('board.add');
    Route::post('/add', [ DocumentsController::class, 'add_post' ] );
    Route::get('/edit/{document}', [ DocumentsController::class, 'edit' ] )->name('board.edit');
    Route::post('/edit/{document}', [ DocumentsController::class, 'edit_post' ] );
    Route::get('/new_version/{document}', [ DocumentsController::class, 'new_version' ] )->name('board.new_version');
    Route::post('/new_version/{document}', [ DocumentsController::class, 'new_version_post' ] );
    Route::post('/delete/{document}', [ DocumentsController::class, 'delete_post' ] )->name('board.delete');
    Route::post('/add_ratification', [ DocumentsController::class, 'add_ratification_post'] )->name('board.add_ratification');
    Route::post('/remove_ratification', [ DocumentsController::class, 'remove_ratification_post'] )->name('board.remove_ratification');
    Route::get('/view/{protocol}', [ DocumentsController::class, 'view_document' ] )->name('board.view_document');
    Route::get('/view_file/{file}', [ DocumentsController::class, 'view_file' ] )->name('board.view_file');
});