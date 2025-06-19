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

        return Socialite::driver('google')->setScopes(['openid', 'email'])->redirect();
    }

    // Callback
    function callback()
    {
        if (Auth::check())
            return redirect()->route('home');

        $email = Socialite::driver('google')->user()->email;

        $loginMethod = LoginMethod::where('driver', 'google')->where('credential', $email)->first();

        if ($loginMethod) {
            if ($loginMethod->can('login', LoginMethod::class)) {
                Auth::login($loginMethod);

                LogController::log(LogEvents::LOGIN, $loginMethod,'scopes','',Socialite::driver('google')->user()->approvedScopes);

                $loginMethod->token = null;
                $loginMethod->last_login = Carbon::now();
                $loginMethod->save();

                return redirect()->intended( route('home') );
            }
            return redirect()->route('home')->with('notistack', ['error', 'Non hai ancora il permesso di accedere.']);
        }

        return redirect()->route('auth.askaccess')->with('email', $email);
    }

    // Logout
    function logout()
    {
        if (Auth::check())
            Auth::logout();

        return redirect()->route('home');
    }

    // Level 2 login
    function redirect_lv2(Request $request)
    {
        // TODO check for already auth
        return Socialite::driver('google')->setScopes(['openid', 'email', 'https://www.googleapis.com/auth/contacts'])
            ->with(['redirect_uri' => route('auth.callback_lv2.google') ])
            ->redirect();
    }

    // Level 2 callback
    function callback_lv2(Request $request)
    {
        // TODO check for already auth
        $user = Socialite::driver('google')->with(['redirect_uri' => route('auth.callback_lv2.google') ])->user();
        
        $email = $user->email;
        $scopes = $user->approvedScopes;

        if( !in_array('https://www.googleapis.com/auth/contacts', $scopes) )
            return redirect()->route('home')->with('notistack', ['error', 'Non hai garantito il permesso di accedere al tuo archivio contatti.']);

        $loginMethod = LoginMethod::where('driver', 'google')->where('credential', $email)->first();

        if ($loginMethod) {
            if ($loginMethod->can('login', LoginMethod::class) && $loginMethod->can('upgrade_login', LoginMethod::class)) {
                Auth::login($loginMethod);

                LogController::log(LogEvents::LOGIN_LV2, $loginMethod,'scopes','',$user->approvedScopes);

                $loginMethod->last_login = Carbon::now();
                $loginMethod->token = $user->token;
                $loginMethod->token_expdate = now()->addSeconds($user->expiresIn);
                $loginMethod->save();

                return redirect()->intended( route('home') );
            }
        }

        return redirect()->route('home')->with('notistack', ['error', 'Non hai il permesso di accedere a questo livello.']);
    }
}
