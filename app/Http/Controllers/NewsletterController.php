<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\Email;
use App\Models\External;
use App\Models\Newsletter;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class NewsletterController extends Controller
{
    public function list()
    {
        if (Auth::user()->can('viewAll', Newsletter::class)) {
            $newsletters = Newsletter::with('owner')->orderBy('updated_at','desc')->get();
        } else {
            $newsletters = Auth::user()->identity->newsletters()->with('owner')->orderBy('updated_at','desc')->get();
        }

        return Inertia::render(
            'Newsletter/List',
            [
                'list' => $newsletters,
                'canCreate' => Auth::user()->can('create', Newsletter::class)
            ]
        );
    }

    public function create()
    {
        $this->authorize('create', Newsletter::class);

        $newletter = new Newsletter();
        $newletter->owner()->associate(Auth::user()->identity);
        $newletter->save();

        return redirect()->route('newsletter.edit', ['newsletter' => $newletter->id]);
    }

    public function edit(Newsletter $newsletter)
    {
        $this->authorize('edit', $newsletter);

        $emails = Email::with('identity')->get();
        $emails = $emails->sortBy([['identity.surname','asc'],['identity.name','asc'],['primary','desc']]);
        $emails = $emails->append('canView')->filter->canView->toArray();

        for($i = 0; $i < count($emails); $i++) {
            if( $i == 0 || $emails[$i]['identity']['id'] != $emails[$i-1]['identity']['id'] ) {
                $emails[$i]['isPrimary'] = true;
            }
            else $emails[$i]['isPrimary'] = false;
        }

        $user = Auth::user();

        $roles = Role::all()->filter(function ($role) use ($user) {
            if( $user->hasPermissionTo('emails-view-all') ) return true;

            if( $role->name == 'everyone' ) return false;
            if( in_array( $role->name, Alumnus::public_status ) )
                return $user->hasPermissionTo('emails-view-public-alumnus');

            return $user->hasPermissionTo('user-edit-' . $role->name);
        });

        foreach ($roles as &$role) {
            if( $role->name == 'everyone' ) $role->identities = Alumnus::with('emails')->get()->concat(External::with('emails')->get());
            else if( in_array( $role->name, Alumnus::public_status ) ) $role->identities = Alumnus::where('status',$role->name)->with('emails')->get();
            else $role->identities = Alumnus::role($role)->with('emails')->get()->concat(External::role($role)->with('emails')->get());
        }
        

        return Inertia::render(
            'Newsletter/Edit',
            [
                'newsletter' => $newsletter,
                'rubrica' => array_values( $emails ),
                'groups' => $roles
            ]
        );
    }

    public function edit_post(Newsletter $newsletter, Request $request)
    {
        $this->authorize('edit', $newsletter);

        $validated = $request->validate([
            'subject' => 'required',
            'to' => 'array',
            'to.*' => 'required|email',
            'body' => 'required'
        ], [
            'to.*.email' => ':input non è un indirizzo email valido '
        ]);

        $newsletter->subject = $validated['subject'];
        $newsletter->to = in_array('to',$validated) ? $validated['to'] : [];
        $newsletter->body = $validated['body'];
        $newsletter->save();

        return redirect()->back()->with('notistack', ['success', 'Bozza salvata']);
    }
}
