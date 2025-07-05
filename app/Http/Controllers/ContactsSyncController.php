<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class ContactsSyncController extends Controller
{
    public function contactsTest(Request $request)
    {
        // TODO hande authorization

        return response()->json([
            'token' => $request->session()->pull('scope')
        ]);
    }
}