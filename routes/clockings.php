<?php

use App\Http\Controllers\RatificationController;
use App\Http\Controllers\StampController;
use App\Models\Ratification;
use Illuminate\Support\Facades\Route;

// Documents
Route::prefix('/clockings')->group(function () {
    Route::get('/', [StampController::class, 'index'])->name('clockings');

    Route::get('/employee', [StampController::class, 'employee'])->name('clockings.employee');
    Route::post('/clockin', [StampController::class, 'clockin'])->name('clockings.clockin');
    Route::post('/clockout', [StampController::class, 'clockout'])->name('clockings.clockout');

    Route::get('/monthly/{year?}/{month?}', [StampController::class, 'monthly'])->whereNumber(['month','year'])->name('clockings.monthly');

    Route::get('/specials', [StampController::class, 'manageSpecials'])->name('clockings.manageSpecials');
    Route::post('/specials/add', [StampController::class, 'addSpecials'])->name('clockings.manageSpecials.add');
    Route::post('/specials/del', [StampController::class, 'delSpecial'])->name('clockings.manageSpecials.del');
});
