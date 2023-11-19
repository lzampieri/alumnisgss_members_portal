<?php

use App\Http\Controllers\AwsSessionController;
use Illuminate\Support\Facades\Route;

// Documents
Route::prefix('/aws_sessions')->group( function () {
    Route::get('/', [ AwsSessionController::class, 'list' ] )->name('list');
    Route::get('/start/{id}', [ AwsSessionController::class, 'start' ] )->name('start');
    Route::get('/end/{id}', [ AwsSessionController::class, 'end' ] )->name('end');
});