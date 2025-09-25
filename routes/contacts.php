<?php

use App\Http\Controllers\ContactsSyncController;
use Illuminate\Support\Facades\Route;

Route::prefix('/contacts')->middleware('auth.lev2')->group( function () {
    Route::get('/', [ ContactsSyncController::class, 'main' ])->name('contacts');


    // API
    Route::post('/get_members', [ ContactsSyncController::class, 'getMembers' ] )->name('contacts.get_members');
    Route::post('/get_contacts', [ ContactsSyncController::class, 'getContacts' ] )->name('contacts.get_contacts');
    Route::post('/deassociate', [ ContactsSyncController::class, 'deassociate' ] )->name('contacts.deassociate');
    Route::post('/associate', [ ContactsSyncController::class, 'associate' ] )->name('contacts.associate');
    Route::post('/create', [ ContactsSyncController::class, 'create' ] )->name('contacts.create');
    Route::post('/addOnPortal', [ ContactsSyncController::class, 'addOnPortal' ] )->name('contacts.addOnPortal');
    Route::post('/addOnGoogle', [ ContactsSyncController::class, 'addOnGoogle' ] )->name('contacts.addOnGoogle');
    Route::post('/priorOnPortal', [ ContactsSyncController::class, 'priorOnPortal' ] )->name('contacts.priorOnPortal');
    Route::post('/priorOnGoogle', [ ContactsSyncController::class, 'priorOnGoogle' ] )->name('contacts.priorOnGoogle');
    Route::post('/modifyGroup', [ ContactsSyncController::class, 'modifyGroup' ] )->name('contacts.modifyGroup');
    
});