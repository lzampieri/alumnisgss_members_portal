<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    // Redirect to google
    function redirect() {
        return Socialite::driver('google')->redirect();
    }

    // Callback
    function callback() {
        $email = Socialite::driver('google')->user()->email;

        $user = User::where( 'email', $email )->first();

        if( $user ) {
            Auth::login( $user );
            return redirect()->route( 'home' );
        }
        
        return redirect()->route( 'home' )->with( 'notistack', [ 'error', 'Utente non riconosciuto' ] );
    }
    
    // Logout
    function logout() {
        Auth::logout();
        return redirect()->route( 'home' );
    }
}
