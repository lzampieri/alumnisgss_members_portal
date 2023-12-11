<?php

namespace App\Http\Controllers;

use App\Models\LoginMethod;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    // Redirect to google
    function redirect()
    {
        if (Auth::check())
            return redirect()->route('home');

        return Socialite::driver('google')->setScopes(['openid','email'])->redirect();
    }

    // Callback
    function callback()
    {
        if (Auth::check())
            return redirect()->route('home');

        $email = Socialite::driver('google')->user()->email;

        $loginMethod = LoginMethod::where('driver','google')->where('credential',$email)->first();

        if ($loginMethod ) {
            if ( $loginMethod->can('login', LoginMethod::class) ) {
                Auth::login($loginMethod);

                Log::debug('Login', $loginMethod);

                $loginMethod->last_login = Carbon::now();
                $loginMethod->save();

                return redirect()->route('home');
            }
            return redirect()->route('home')->with('notistack', ['error', 'Non hai ancora il permesso di accedere.']);
        }

        return redirect()->route('auth.askaccess')->with('email', $email );
    }

    // Logout
    function logout()
    {
        if (Auth::check())
            Auth::logout();

        return redirect()->route('home');
    }
}
