<?php

use App\Http\Controllers\AlumnusController;
use App\Http\Controllers\AlumnusExportImportController;
use Illuminate\Support\Facades\Route;

// Members
Route::prefix('/members')->group( function () {
    Route::get('/', [ AlumnusController::class, 'membersList' ] )->name('members');

    Route::get('/counters', [ AlumnusController::class, 'membersCounters' ] )->name('members.counters');
});

// Registry
Route::prefix('/registry')->group( function () {
    Route::get('/', [ AlumnusController::class, 'list' ] )->name('registry');

    Route::get('/add', [ AlumnusController::class, 'edit' ] )->name('registry.add');

    Route::get('/edit/{alumnus?}', [ AlumnusController::class, 'edit' ] )->name('registry.edit');
    Route::post('/edit/{alumnus?}', [ AlumnusController::class, 'edit_post' ] );
});

// Registry impexp
Route::prefix('/registry/impexp')->group( function () {
    // Members schema
    Route::get('/bulk/export/xls_schema', [ AlumnusExportImportController::class, 'exportExcelSchema' ] )->name('registry.impexp.export.xls_schema');

    // Members detailed list
    Route::get('/bulk/export/xls_details', [ AlumnusExportImportController::class, 'exportExcelDetails' ] )->name('registry.impexp.export.xls_details');
    Route::get('/bulk/import/xls_details', [ AlumnusExportImportController::class, 'importExcelDetails' ] )->name('registry.impexp.import.xls_details');
    Route::post('/bulk/import/xls_details', [ AlumnusExportImportController::class, 'importExcelDetails_post' ] );


    // Route::get('/bulk/import', [ AlumnusController::class, 'bulk_im' ] )->name('registry.bulk.import');
    // Route::post('/bulk/import', [ AlumnusController::class, 'bulk_im_post' ] );

    // Route::get('/bulk/export/csv', [ AlumnusController::class, 'bulk_ex_csv' ] )->name('registry.bulk.export.csv');
    
    // Route::get('/bulk_edit', [ AlumnusController::class, 'bulk_edit' ] )->name('registry.bulk.edit');
    // Route::post('/bulk_edit', [ AlumnusController::class, 'bulk_edit_post' ] );
});