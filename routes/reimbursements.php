<?php

use App\Http\Controllers\APIs;
use App\Http\Controllers\FileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ReimbursementController;
use Illuminate\Support\Facades\Route;

// Projects
Route::prefix('/projects')->group(function () {

    Route::get('/', [ProjectController::class, 'home'])->name('projects');
    Route::post('/edit', [ProjectController::class, 'edit'])->name('projects.edit');
});

// Reimbursements
Route::prefix('/reimbursements')->group(function () {
    Route::get('/', [ReimbursementController::class, 'home'])->name('reimbursements');
    Route::get('/create', [ReimbursementController::class, 'create'])->name('reimbursements.create');
    Route::get('/edit/{reimbursement}', [ReimbursementController::class, 'edit'])->name('reimbursements.edit');
    Route::post('/autosave/{reimbursement}', [ReimbursementController::class, 'autosave'])->name('reimbursements.autosave');
    Route::post('/saveDraft/{reimbursement}', [ReimbursementController::class, 'save_draft'])->name('reimbursements.save_draft');
    Route::post('/saveFinal/{reimbursement}', [ReimbursementController::class, 'save_final'])->name('reimbursements.save_final');

    Route::get('/aciTable', [APIs::class, 'getAciTableAsResponse'])->name('reimbursements.aciTable');
    
    Route::get('/review/{reimbursement}', [ReimbursementController::class, 'review'])->name('reimbursements.review');
    
    Route::get('/send/{reimbursement}', [ReimbursementController::class, 'send'])->name('reimbursements.send');
    
    Route::get('/view/{reimbursement}', [ReimbursementController::class, 'view'])->name('reimbursements.view');

    Route::post('/uploadFiles/{reimbursement}', [ReimbursementController::class, 'uploadFiles'])->name('reimbursements.uploadFiles');
    Route::get('/file/{id}', [FileController::class, 'fromId'])->name('reimbursements.viewFile');
    
    Route::get('/receipt/{reimbursement}', [ReimbursementController::class, 'receipt'])->name('reimbursements.receipt');
});
