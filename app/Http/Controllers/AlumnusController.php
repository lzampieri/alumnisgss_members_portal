<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use Inertia\Inertia;

class AlumnusController extends Controller
{
    public function membersList() {
        Log::debug('Members list produced');
        
        $this->authorize( 'viewMembers', Alumnus::class );
        $members = Alumnus::all()->only(['name','coorte']); // TODO select only members

        return Inertia::render('Members/List', [ 'members' => $members ] );
    }
}
