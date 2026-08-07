<?php

use App\Http\Controllers\ExternalController;
use Illuminate\Support\Facades\Route;

Route::prefix('/externals')->group( function () {

    Route::post('/create/{email}', [ ExternalController::class, 'create_and_associate_post' ] )->name('externals.create_and_associate');
});