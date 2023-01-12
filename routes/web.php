<?php

use App\Http\Controllers\AppsController;
use App\Http\Controllers\Log;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', [ AppsController::class, 'home' ])->name('home');

include( 'auth.php' );

include( 'alumni.php' );
include( 'externals.php' );

include( 'board.php' );

include( 'ratifications.php' );

include( 'roles.php' );

// Utils
Route::get('/logs', [ Log::class, 'index' ] )->name('log');

// Migrations
Route::get('/db/migrate', function () { Artisan::call('migrate', ['--force' => true]); } );

Route::redirect('/main','https://www.alumniscuolagalileiana.it')->name('main');