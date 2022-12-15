<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Inertia\Inertia;

class MemberController extends Controller
{
    public function list() {
        return Inertia::render('Members/List', [ 'members' => Member::all() ] );
    }
}
