<?php

namespace App\Http\Controllers;

use App\Policies\GeneralPolicy;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Ifsnop\Mysqldump\Mysqldump;

class WebmasterController extends Controller
{
    public function home()
    {
        $this->authorizeRole('webmaster');

        return Inertia::render('Webmaster/List');
    }

    public function do_backup()
    {
        $dump = new Mysqldump(
            env('DB_CONNECTION') . ':host=' . env('DB_HOST') . ';dbname=' . env('DB_DATABASE'),
            env('DB_USERNAME'),
            env('DB_PASSWORD')
        );
        $dump->start(storage_path() . '/app/backups/database_' . date('Ymd') . '.sql');
    }

    public function backup()
    {

        try {
            $this->do_backup();
        } catch (\Exception $e) {
            return redirect()->back()->with('notistack', ['error', $e->getMessage()]);
        }

        return redirect()->back()->with('notistack', ['success', 'Backup effettuato']);
    }

    public function migrate()
    {
        $this->authorizeRole('webmaster');

        try {
            $this->do_backup();
            Artisan::call('migrate', ['--force' => true]);
        } catch (\Exception $e) {
            return redirect()->back()->with('notistack', ['error', $e->getMessage()]);
        }

        return Artisan::output();
    }

    public function remigrate()
    {
        $this->authorizeRole('webmaster');

        try {
            $this->do_backup();
            Artisan::call('migrate:refresh', ['--force' => true, '--seed' => true]);
        } catch (\Exception $e) {
            return redirect()->back()->with('notistack', ['error', $e->getMessage()]);
        }

        return Artisan::output();
    }
}
