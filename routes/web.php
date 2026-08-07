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
Route::get('/maintenance', [ AppsController::class, 'maintenance'])->name('maintenance');

include( 'auth.php' );

include( 'alumni.php' );
include( 'externals.php' );
include( 'network.php' );
include( 'profile.php' );

include( 'board.php' );

include( 'resources.php' );

include( 'ratifications.php' );

include( 'reports.php' );

include( 'accesses.php' );
include( 'positions.php' );

include( 'clockings.php' );

include( 'webmaster.php' );

include( 'permalinks.php' );

include( 'tickets.php' );

include( 'contacts.php' );

include( 'newsletters.php' );

Route::redirect('/main','https://www.alumniscuolagalileiana.it')->name('main');

