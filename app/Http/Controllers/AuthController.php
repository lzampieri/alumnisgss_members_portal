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

        return Socialite::driver('google')->redirect();
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

    function askaccess()
    {
        if( Auth::check() )
            return redirect()->route('home');
            
        if( session()->has( 'email' ) )
            return Inertia::render('Accesses/AskAccess', ['email' => session('email') ] );
            
        return redirect()->route('home');

    }

    function askaccess_post(Request $request)
    {
        if (Auth::check())
            return redirect()->route('home');

        $validated = $request->validate([
            'message' => 'required|min:3',
            'email' => 'required|email|unique:users,email'
        ]);

        $user = User::create(['email' => $validated['email']]);
        Log::debug('New user created', $user);
        
        $emails = User::permission('user-enabling')->get()->pluck('email')->toArray();

        $message = "E' stata inserita una nuova richiesta d'accesso\n";
        $message.= "Indirizzo mail richiedente: " . $validated['email'] . "\n";
        $message.= "Messaggio:\n" . $validated['message'];

        Mail::raw( $message, function ($message) use ($emails) {
            $message->to($emails);
            $message->subject('Nuova richiesta di accesso a soci.alumnuscuolagalileiana.it');
        });
        Log::debug('Access request sent', [$emails, $message]);
        
        return redirect()->route('home')->with(['notistack' => ['success', 'La richiesta è stata inoltrata alla segreteria.']]);
    }

    // Logout
    function logout()
    {
        if (Auth::check())
            Auth::logout();

        return redirect()->route('home');
    }
}
