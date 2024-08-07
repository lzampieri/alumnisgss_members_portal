<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\External;
use App\Models\Identity;
use App\Models\LoginMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class LoginMethodController extends Controller
{
    public function list()
    {
        $this->authorize('viewAny', LoginMethod::class);

        $lmthds = [
            'alumni' => Alumnus::has('loginMethods')->with('loginMethods')->orderBy('surname')->orderBy('name')->get(),
            'externals' => External::has('loginMethods')->with('loginMethods')->orderBy('surname')->orderBy('name')->get(),
            'requests' => LoginMethod::where('identity_id', null)->orderBy('created_at', 'desc')->get(),
        ];

        foreach (['alumni', 'externals'] as $key) {
            foreach ($lmthds[$key] as $lmthd) {
                $lmthd->roles = $lmthd->getAllRoles();
            }
        }

        return Inertia::render('Accesses/List', [
            'lmthds' => $lmthds,
            'editableRoles' => Auth::user()->identity->editableRoles(),
            'canAssociate' => Auth::user()->can('associate', LoginMethod::class),
            'canAdd' => Auth::user()->can('add', LoginMethod::class)
        ]);
    }

    public function delete(Request $request, LoginMethod $lmth)
    {

        $this->authorize('delete', $lmth);
        $same = ($lmth->id == Auth::user()->id);

        $lmth->delete();

        if ($same) {
            Auth::logout();
            return redirect()->route('home');
        }

        return redirect()->back();
    }

    function askaccess()
    {
        if (Auth::check())
            return redirect()->route('home');

        if (session()->has('email'))
            return Inertia::render('Accesses/AskAccess', ['email' => session('email')]);

        return redirect()->route('home');
    }

    function askaccess_post(Request $request)
    {
        if (Auth::check())
            return redirect()->route('home');

        $validated = $request->validate([
            'message' => 'required|min:3',
            'email' => 'required|email'
        ]);

        $lm = LoginMethod::create(['driver' => 'google', 'credential' => $validated['email'], 'comment' => $validated['message']]);

        $emails = [];
        foreach (LoginMethod::where('driver', 'google')->hasMorph('identity', [Alumnus::class, External::class])->get() as $lm) {
            if ($lm->hasPermissionTo('accesses-receive-request-emails'))
                $emails[] = $lm->credential;
        }

        $message = "E' stata inserita una nuova richiesta d'accesso\n";
        $message .= "Indirizzo mail richiedente: " . $validated['email'] . "\n";
        $message .= "Messaggio:\n" . $validated['message'];

        Mail::raw($message, function (\Illuminate\Mail\Message $message) use ($emails, $validated) {
            $message->to($emails);
            $message->replyTo($validated['email']);
            $message->subject('Nuova richiesta di accesso a soci.alumnuscuolagalileiana.it');
        });
        LogController::log( LogEvents::MAIL_SENT, $lm, 'Access request', [$emails, $message]);

        return redirect()->route('home')->with(['notistack' => ['success', 'La richiesta è stata inoltrata alla segreteria.']]);
    }

    function manually_add()
    {
        $this->authorize('add', LoginMethod::class);

        return Inertia::render('Accesses/ManuallyAdd', ['drivers' => LoginMethod::$drivers]);
    }

    function manually_add_post(Request $request)
    {
        $this->authorize('add', LoginMethod::class);

        $validated = $request->validate([
            'driver' => 'required|in:' . implode(",", LoginMethod::$drivers),
            'credential' => 'required'
        ]);

        $lm = LoginMethod::create($validated);

        return redirect()->route('accesses')->with(['notistack' => ['success', 'Aggiunto.']]);
    }

    function associate(Request $request, LoginMethod $lmth)
    {
        $this->authorize('associate', LoginMethod::class);

        return Inertia::render('Accesses/Association', [
            'lmth' => $lmth,
            'alumni' => Alumnus::orderBy('surname')->orderBy('name')->get(),
            'externals' => External::orderBy('surname')->orderBy('name')->get(),
        ]);
    }

    function associate_post(Request $request, LoginMethod $lmth)
    {
        $this->authorize('associate', LoginMethod::class);

        $validated = $request->validate([
            'id' => 'required|numeric',
            'type' => 'required|in:alumnus,external'
        ]);

        $identity = $validated['type'] == 'alumnus' ? Alumnus::find($validated['id']) : External::find($validated['id']);

        $lmth->identity()->associate($identity)->save();

        if (!$identity->enabled) {
            $identity->givePermissionTo('login');
        }

        return redirect()->route('accesses')->with(['notistack' => ['success', 'Utente abilitato']]);
    }
}
