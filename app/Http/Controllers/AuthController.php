<?php

namespace App\Http\Controllers;

use App\Models\Email;
use App\Models\Identity;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    
    // Login
    function login(Request $request)
    {
        if (Auth::check())
            return redirect()->route('home');
        
        return Inertia::render("General/Login");
    }


    // Redirect to google
    function redirect()
    {
        if (Auth::check())
            return redirect()->route('home');

        return Socialite::driver('google')->setScopes(['openid', 'email'])->redirect();
    }

    // Callback
    function callback(Request $request)
    {
        if (Auth::check())
            return redirect()->route('home');

        $email = Socialite::driver('google')->user()->email;

        $em = Email::where('address', $email)->first();

        if ($em) {
            if ($em->can('login', Email::class)) {
                Auth::login($em);
                $request->session()->regenerate();
                
                LogController::log(LogEvents::LOGIN, $em);

                $em->token = null;
                $em->last_login = Carbon::now();
                $em->save();

                // For any reason there is a looping problem with this route, prevent it
                if( str_contains( $request->session()->get('url.intended', ""), "contacts" ) )
                    return redirect()->to(route('home'));

                return redirect()->intended(route('home'));
            }
            return redirect()->route('home')->with('notistack', ['error', 'Non hai ancora il permesso di accedere.']);
        }

        return redirect()->route('auth.askaccess')->with('email', $email);
    }

    // Logout
    function logout(Request $request)
    {
        if (Auth::check())
            Auth::logout();
        
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }

    // Set OTP
    function sendOtp(Request $request)
    {
        $validated = $request->validate([
            'address' => 'required|email'
        ]);

        $em = Email::where('address', $validated['address'])->first();
        if( !$em )
            throw ValidationException::withMessages(['address' => 'unknown']);
        
        if (!$em->can('login', Email::class))
            throw ValidationException::withMessages(['address' => 'not_enabled']);

        $em->otp = rand(100000, 999999);
        $em->otp_expiration = Carbon::now()->addMinutes(2);
        $em->otp_session = $request->session()->getId();
        $em->save();

        MailerController::sendEmail(
            [$em],
            "Il tuo OTP è {$em->otp}",
            "Il tuo OTP per accedere a soci.alumniscuolagalileiana.it è {$em->otp}."
        );

        return redirect()->back();
    }

    // Validate OTP
    function validateOtp(Request $request)
    {
        $validated = $request->validate([
            'otp' => 'required|string|min:6'
        ]);

        $em = Email::where('otp', $validated['otp'])
            ->where('otp_session', $request->session()->getId())
            ->first();

        if( !$em )
            throw ValidationException::withMessages(['otp' => 'unknown']);

        if( !$em->otp_expiration->isFuture() )
            throw ValidationException::withMessages(['otp' => 'expired']);
        
        if (!$em->can('login', Email::class))
            throw ValidationException::withMessages(['otp' => 'not_enabled']);

        Auth::login($em);
        $request->session()->regenerate();

        LogController::log(LogEvents::LOGIN_OTP, $em);

        $goto = $request->session()->get('url.intended', route('home') );
        $request->session()->forget('url.intended');
        return Inertia::location( $goto );
    }

    // Level 2 login
    function redirect_lv2()
    {
        return Socialite::driver('google')->setScopes(['openid', 'email', \Google\Service\PeopleService::CONTACTS])
            ->with(['redirect_uri' => route('auth.callback_lv2.google')])
            ->redirect();
    }

    // Level 2 callback
    function callback_lv2(Request $request)
    {
        $user = Socialite::driver('google')->with(['redirect_uri' => route('auth.callback_lv2.google')])->user();

        $email = $user->email;
        $scopes = $user->approvedScopes;

        if (!in_array(\Google\Service\PeopleService::CONTACTS, $scopes))
            return redirect()->route('home')->with('notistack', ['error', 'Non hai garantito il permesso di accedere al tuo archivio contatti.']);

        $em = Email::where('address', $email)->first();

        if ($em) {
            if ($em->can('login', Email::class) && $em->can('login_lv2', Email::class)) {
                Auth::login($em);
                $request->session()->regenerate();

                LogController::log(LogEvents::LOGIN_LV2, $em, 'scopes', '', $user->approvedScopes);

                $em->last_login = Carbon::now();
                $em->token = $user->token;
                $em->token_expdate = now()->addSeconds($user->expiresIn);
                $em->save();

                return redirect()->intended(route('home'));
            }
        }

        return redirect()->route('home')->with('notistack', ['error', 'Non hai il permesso di accedere a questo livello.']);
    }

    function askaccess(Request $request)
    {
        if (Auth::check())
            return redirect()->route('home');
        
        if (session()->has('email'))
            return Inertia::render('Accesses/AskAccess', ['email' => session('email')]);
        
        if ($request->has('email'))
            return Inertia::render('Accesses/AskAccess', ['email' => request()->input('email')]);
        
        return redirect()->route('home');
    }

    function askaccess_post(Request $request)
    {
        if (Auth::check())
            return redirect()->route('home');

        $validated = $request->validate([
            'comment' => 'required|min:3',
            'address' => 'required|email|unique:emails,address'
        ]);

        Email::create(['address' => $validated['address'], 'comment' => $validated['comment']]);

        $message = "E' stata inserita una nuova richiesta d'accesso\n";
        $message .= "Indirizzo mail richiedente: " . $validated['address'] . "\n";
        $message .= "Messaggio:\n" . $validated['comment'];

        MailerController::sendEmail(
            Identity::allWithPermission('accesses-receive-request-emails'),
            'Nuova richiesta di accesso a soci.alumniscuolagalileiana.it',
            $message,
            $validated['address']
        );

        return redirect()->route('home')->with(['notistack' => ['success', 'La richiesta è stata inoltrata alla segreteria.']]);
    }
}
