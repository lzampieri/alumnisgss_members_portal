<?php

use App\Http\Controllers\TicketController;
use Illuminate\Support\Facades\Route;

// Tickets
Route::prefix('/helpdesk')->group(function () {

    Route::get('/', [TicketController::class, 'home'])->name('helpdesk');
    Route::get('/getrows/{perPage}/{page}', [TicketController::class, 'list_getrows'])
        ->where(['perPage' => '[0-9]+', 'page' => '[0-9]+'])->name('helpdesk.list_getrows');


    Route::get('/add', [TicketController::class, 'addList'])->name('ticket.addList');
    Route::get('/add/{type}', [TicketController::class, 'add'])->name('ticket.add');
    Route::post('/add/{type}', [TicketController::class, 'addPost']);

    Route::get('/{ticket}', [TicketController::class, 'view'])
        ->where(['ticket' => '[0-9]+'])->name('ticket.view');
    Route::post('/{ticket}', [TicketController::class, 'addComment'])
        ->where(['ticket' => '[0-9]+']);
    Route::post('/{ticket}/{action}', [TicketController::class, 'doAction'])
        ->where(['ticket' => '[0-9]+'])->name('ticket.action');
});
