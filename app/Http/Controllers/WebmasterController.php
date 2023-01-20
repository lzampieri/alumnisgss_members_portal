<?php

namespace App\Http\Controllers;

use App\Policies\GeneralPolicy;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;

class WebmasterController extends Controller
{
    public function home()
    {
        $this->authorizeRole('webmaster');

        return Inertia::render('Webmaster/List');
    }

    public function backup()
    {
        Artisan::call('backup:run', ['--only-db' => true]);

        return redirect()->back()->with('notistack',['success','Backup effettuato']);
        return Inertia::render('Members/List', ['members' => $members]);
    }
}
