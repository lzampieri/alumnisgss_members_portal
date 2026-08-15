<?php

namespace App\Http\Controllers;

use App\Models\ADetailsType;
use App\Models\Alumnus;
use App\Models\Email;
use App\Models\Person;
use App\Models\Ratification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PersonController extends Controller
{
    // Create and edit person
    public function edit(Request $request, ?Person $person = null)
    {
        $data = [];
        
        if ($person) {
            $this->authorize('viewGeneral', $person);
        } else {
            $this->authorize('create', Person::class);

            // Auto association of email request
            if($request->has('associate_to')) {
                $eq = Email::find(intval($request->input('associate_to')));
                if($eq) {
                    $data['associate_to'] = $eq->setVisible(['id','address']);
                }
            }
        }


        // Edit general details
        $person_tocheck = $person ? $person : Person::class;
        $data['edit_general'] = Auth::user()->can('editGeneral', $person_tocheck);
        $data['edit_emails'] = Auth::user()->can('editEmails', $person_tocheck);
        $data['edit_consent'] = Auth::user()->can('editConsent', $person_tocheck);
        $data['edit_login'] = Auth::user()->can('enable', $person_tocheck);
        $data['edit_details'] = Auth::user()->can('editDetails', $person_tocheck);

        // Case in which it is himselves and annot modify general details (typical member):
        // redirect to the fancier profile editor
        if(Auth::user()->is($person) && !$data['edit_general']) {
            return redirect()->route('profile');
        }

        if (!$data['edit_general'] && !$data['edit_emails'] && !$data['edit_consent'] && !$data['edit_login'] && !$data['edit_details']) {
            abort(403);
        }

        // Basic informations are available to everyone,
        // like name, surname, notes, coorte, status, tags
        // ratifications for history
        if ($person) {
            $person->load(['ratifications', 'ratifications.document']);

            // Only visible emails are in fact visible, and the total count of emails
            $person['emails'] = Auth::user()->can('viewEmails',$person) ? $person->emails : [];
            $person['emails_count'] = $person->emails()->count();
            
            $person->makeVisible(['ratifications', 'ratifications.document', 'emails', 'emails_count']);

        }

        // Moreover, if they are editable, more details are available
        if ($data['edit_general']) {
            $data['allStatus'] = Alumnus::status;
            $data['noRatStatus'] = Alumnus::availableStatus($person);
            $data['allTags'] = Person::allTags();
        }

        // Also, it is generally known if there are pending ratifications
        $data['pendingRats'] = $person ? $person->pendingRatifications : null;

        // If the user has access to network details, they are also included
        if (Auth::user()->can('viewDetails', $person_tocheck)) {
            $adtlist = ADetailsType::allOrdered();
            if($person )
                $adtlist->load(['aDetails' => function ($query) use ($person) {
                    $query->where('identity_id', $person->id);
                }]);
            $adtlist->append('usedValues');
            $data['adts'] = $adtlist;
        }

        $data['person'] = $person;

        return Inertia::render('People/Edit', $data);
    }

    public function edit_post(Request $request, ?Person $person = null)
    {
        if ($person) {
            $this->authorize('viewGeneral', $person);
            $is_update = true;
        } else {
            $this->authorize('create', Person::class);
            $is_update = false;
        }
        $updated = false;

        $toValidate = [];

        $person_tocheck = $person ? $person : Person::class;
        $edit_general = Auth::user()->can('editGeneral', $person_tocheck);
        $edit_emails = Auth::user()->can('editEmails', $person_tocheck);
        $edit_consent = Auth::user()->can('editConsent', $person_tocheck);
        $edit_login   = Auth::user()->can('enable', $person_tocheck);
        $edit_details = Auth::user()->can('editDetails', $person_tocheck);
        if (!$edit_general && !$edit_consent && !$edit_login && !$edit_details)
            abort(403);

        // General details
        if ($edit_general)
            $toValidate += [
                'surname' => 'required|regex:/^[A-zÀ-ú\s\'_]+$/',
                'name' => 'required|regex:/^[A-zÀ-ú\s\'_]+$/',
                'notes' => '',
                'coorte' => 'required|numeric',
                'status' => 'required|in:' . implode(',', Alumnus::status),
                'tags' => 'nullable|array'
            ];

        if( !$is_update )
            $toValidate += [
                'associate_to' => 'sometimes|numeric|exists:emails,id'
            ];

        // Emails
        if($edit_emails)
            $toValidate += [
                'emails' => 'nullable|array'
            ];

        // Consents
        if ($edit_consent)
            $toValidate += [
                'consent_to_email_share' => 'required|boolean',
                'consent_to_network_share' => 'required|boolean'
            ];

        // Login
        if ($edit_login)
            $toValidate += [
                'enabled' => 'required|boolean'
            ];

        // Details
        if ($edit_details)
            $toValidate += [
                'adts' => 'array',
                'adts.*' => 'array',
                'adts.*.id' => 'required|distinct|exists:a_details_types,id',
                'adts.*.value' => 'nullable|array',
            ];

        $validated = $request->validate($toValidate);

        // General details
        if ($edit_general) {
            // Check for new status, if ratification needed
            $rat_needed = false;
            $rat_newstatus = '';
            if (!in_array($validated['status'], Alumnus::availableStatus($person))) {
                $rat_needed = true;
                $rat_newstatus = $validated['status'];
                $validated['status'] = $person ? $person->status : 'not_reached';
            }

            // Create or update alumnus
            if ($person) {
                foreach (['surname', 'name', 'notes', 'coorte', 'status', 'tags'] as $key) {
                    if ($validated[$key] !== $person[$key]) {
                        $person[$key] = $validated[$key];
                        $updated = true;
                    }
                }
                if( $person['coorte'] <= 0 && strlen($person['status']) > 0 ) {
                    $person['status'] = '';
                    $updated = true;
                }
                if ($updated) $person->save();
            } else {
                $person = Person::create($validated);
            }


            // Eventually create ratification
            if ($rat_needed) {
                // Check for existing ratifications
                foreach ($person->pendingRatifications as $pr) {
                    if ($pr->required_state == $rat_newstatus) {
                        $rat_needed = false;
                        break;
                    }
                }
                if ($rat_needed) {
                    Ratification::create(['alumnus_id' => $person->id, 'required_state' => $rat_newstatus]);
                }
            }

        }

        if($edit_emails) {
            // Update email addresses
            $visible_emails = Auth::user()->can('viewEmails',$person) ? $person->emails : [];
            $emails = $visible_emails->map(function ($email) {
                return $email->address;
            })->toArray();
            // Create new addresses
            foreach (array_diff($validated['emails'], $emails) as $email) {
                if(!Email::where('address', $email)->exists()) {
                    $person->emails()->create(['address' => $email]);
                    $updated = true;
                }
            }
            foreach (array_diff($emails, $validated['emails']) as $email) {
                $person->emails()->where('address', $email)->delete();
                $updated = true;
            }

            // Primary email
            if (count($validated['emails'])>2) {
                $first = $person->emails()->where('address', $validated['emails'][0])->first();
                $primary_count = max($person->emails()->where('address', '!=', $validated['emails'][0])->pluck('emails.primary')->toArray());
                if ($first->primary <= $primary_count) {
                    $first->primary = $primary_count + 1;
                    $first->save();
                    $updated = true;
                }
            }
        }

        if (!$person)
            abort(403);

        // Automatic association
        if( array_key_exists('associate_to',$validated) ) {
            $em = Email::find($validated['associate_to']);
            if($em) {
                $em->identity()->associate($person);
                $em->save();
            }
        }

        // Consents
        if ($edit_consent) {
            $uu = false;
            foreach (['consent_to_email_share', 'consent_to_network_share'] as $key) {
                if ($validated[$key] !== $person[$key]) {
                    $person[$key] = $validated[$key];
                    $updated = true;
                    $uu = true;
                }
            }
            if ($uu) $person->save();
        }

        // Login
        if ($edit_login) {
            // Check for consent to login
            if ($person->enabled && !$validated['enabled']) {
                // Request to disabled
                if (!$person->hasRole('webmaster')) { // No effects on webmaster
                    $person->revokePermissionTo('login');
                    $updated = true;
                }
            }
            if (!$person->enabled && $validated['enabled']) {
                $person->givePermissionTo('login');
                $updated = true;
            }
        }

        if ($edit_details) {
            // Update ADetails
            foreach ($validated['adts'] as $adts) {

                if ((count($adts['value']) == 1) && is_array($adts['value'][0])) // Extra check to prevent array of array
                    $adts['value'] = $adts['value'][0];

                $person->aDetails()->updateOrCreate(
                    ['a_details_type_id' => $adts['id']],
                    ['value' => $adts['value']]
                );
            }
        }

        return redirect()->route('person.edit', ['person' => $person])->with('notistack', ['success', $is_update ? ( $updated ? 'Alumno aggiornato' : 'Nessuna modifica') : 'Alumno creato']);
    }
    
    public function accessesList()
    {
        $this->authorize('enable', Person::class);

        $people = Person::orderBy('surname')->orderBy('name')->get()
            ->filter->canView->setVisible(['id','name','surname','coorte','enabled']);

        foreach ($people as $person) {
            $person['emails'] = Auth::user()->can('viewEmails',$person) ? $person->emails : [];
            $person['emails_count'] = $person->emails()->count();
            $person->makeVisible(['emails','emails_count']);
            
            $person->roles = $person->getAllRoles();
            foreach ($person->emails as $em) {
                $em->append('can_delete')->makeVisible('can_delete');
            }
            $person->makeVisible('roles');

            $person['canAddEmails'] = Auth::user()->can('editEmails', $person);
            $person->makeVisible('canAddEmails');
        }
        
        $requests = Auth::user()->can('associate', Email::class) ?
            Email::whereNull('identity_id')->orderBy('created_at', 'desc')->get() : [];

        return Inertia::render('Accesses/List', [
            'people' => $people->values(),
            'totpeople' => Person::count(),
            'requests' => $requests,
            'editableRoles' => Auth::user()->editableRoles(),
            'canAssociate' => Auth::user()->can('associate', Email::class),
            'canAddPeople' => Auth::user()->can('create', Person::class)
        ]);
    }

    public function enabled(Request $request)
    {
        $validated = $request->validate([
            'identity' => 'required|numeric|exists:people,id',
            'enabled' => 'required|boolean'
        ]);

        $identity = Person::find($validated['identity']);
        
        $this->authorize('enable', $identity);

        if (!$identity) {
            return redirect()->back()->with('notistack', ['error', 'Identità non trovata']);
        }

        if ($identity->hasRole('webmaster')) {
            return redirect()->back()->with('notistack', ['error', 'Impossibile disabilitare il webmaster']);
        }

        if ($identity->enabled && !$validated['enabled']) {
            $identity->revokePermissionTo('login');
        }

        if (!$identity->enabled && $validated['enabled']) {
            $identity->givePermissionTo('login');
        }

        return redirect()->back();
    }
}
