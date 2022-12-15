<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Inertia\Inertia;

class MemberController extends Controller
{
    public function view() {
        return Inertia::render('Members', [ 'members' => Member::all() ] );
    }
}
