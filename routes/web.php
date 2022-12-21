<?php

use App\Http\Controllers\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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

Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

Route::get('/error', function () {
    return redirect()->route('home')->with('notistack', [ 'error', 'Utente non riconosciuto' ]);
});

include( 'auth.php' );

include( 'alumni.php' );

// Utils
Route::get('/logs', [ Log::class, 'index' ] );