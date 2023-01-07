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
    Route::post('/delete/{document}', [ DocumentsController::class, 'delete_post' ] )->name('board.delete');
    Route::get('/view/{document}', [ DocumentsController::class, 'view' ] )->name('board.view');
});