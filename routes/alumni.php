<?php

use App\Http\Controllers\AlumnusController;
use Illuminate\Support\Facades\Route;

// Members
Route::prefix('/members')->group( function () {
    Route::get('/', [ AlumnusController::class, 'membersList' ] )->name('members');

    Route::get('/counters', [ AlumnusController::class, 'membersCounters' ] )->name('members.counters');
});

// Registry
Route::prefix('/registry')->group( function () {
    Route::get('/', [ AlumnusController::class, 'list' ] )->name('registry');

    Route::get('/add', [ AlumnusController::class, 'add' ] )->name('registry.add');
    Route::post('/add', [ AlumnusController::class, 'add_post' ] );

    Route::get('/bulk/import', [ AlumnusController::class, 'bulk_im' ] )->name('registry.bulk.import');
    Route::post('/bulk/import', [ AlumnusController::class, 'bulk_im_post' ] );

    Route::get('/bulk/export/csv', [ AlumnusController::class, 'bulk_ex_csv' ] )->name('registry.bulk.export.csv');
    Route::get('/bulk/export/xls', [ AlumnusController::class, 'bulk_ex_xls' ] )->name('registry.bulk.export.xls');
    
    Route::get('/edit/{alumnus}', [ AlumnusController::class, 'edit' ] )->name('registry.edit');
    Route::post('/edit/{alumnus}', [ AlumnusController::class, 'edit_post' ] );

    Route::get('/bulk_edit', [ AlumnusController::class, 'bulk_edit' ] )->name('registry.bulk.edit');
    Route::post('/bulk_edit', [ AlumnusController::class, 'bulk_edit_post' ] );
});