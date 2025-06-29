<?php

use App\Http\Controllers\ExternalController;
use Illuminate\Support\Facades\Route;

Route::prefix('/externals')->group( function () {

    Route::post('/add/{email}', [ ExternalController::class, 'add_and_associate_post' ] )->name('externals.add_and_associate');
});