<?php

use App\Http\Controllers\AlumnusController;
use App\Http\Controllers\AlumnusControllerChecks;
use App\Http\Controllers\AlumnusExportImportController;
use Illuminate\Support\Facades\Route;

// Members
Route::prefix('/members')->group(function () {
    Route::get('/', [AlumnusController::class, 'membersList'])->name('members');

    Route::get('/counters', [AlumnusController::class, 'membersCounters'])->name('members.counters');
});

// Registry
Route::prefix('/registry')->group(function () {
    Route::get('/', function () {
        return redirect()->route('registry.schema');
    })->name('registry');
    Route::get('/schema', [AlumnusController::class, 'schema'])->name('registry.schema');
    Route::get('/table', [AlumnusController::class, 'table'])->name('registry.table');

    Route::get('/checks', [AlumnusControllerChecks::class, 'checks'])->name('registry.checks');
    Route::post('/checks/assdet', [AlumnusControllerChecks::class, 'assdet'])->name('registry.checks.assdet');
    Route::post('/checks/dupcor', [AlumnusControllerChecks::class, 'dupcor'])->name('registry.checks.dupcor');

    Route::get('/add', [AlumnusController::class, 'edit'])->name('registry.add');
    
    Route::get('/edit/{alumnus?}', [AlumnusController::class, 'edit'])->name('registry.edit');
    Route::post('/edit/{alumnus?}', [AlumnusController::class, 'edit_post']);
});

// Registry impexp
Route::prefix('/registry/impexp')->group(function () {
    // Bulk adding
    Route::get('/add', [AlumnusExportImportController::class, 'addBulk'])->name('registry.addBulk');
    Route::post('/add', [AlumnusExportImportController::class, 'addBulk_post']);

    // Members schema
    Route::get('/bulk/export/xls_schema', [AlumnusExportImportController::class, 'exportExcelSchema'])->name('registry.impexp.export.xls_schema');

    // Members detailed list
    Route::get('/bulk/export/xls_details', [AlumnusExportImportController::class, 'exportExcelDetails'])->name('registry.impexp.export.xls_details');
    Route::get('/bulk/import/xls_details', [AlumnusExportImportController::class, 'importExcelDetails'])->name('registry.impexp.import.xls_details');
    Route::post('/bulk/import/xls_details', [AlumnusExportImportController::class, 'importExcelDetails_post']);
});
