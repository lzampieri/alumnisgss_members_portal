<?php

namespace App\Http\Controllers;

use App\Models\Log;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Ifsnop\Mysqldump\Mysqldump;
use Illuminate\Encryption\Encrypter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\File;
use RuntimeException;

class WebmasterController extends Controller
{
    public function home()
    {
        $this->authorizeRole('webmaster');

        return Inertia::render('Webmaster/List');
    }

    public function do_backup()
    {
        $tempFile = storage_path() . '/app/backups/temp.sql';

        $dump = new Mysqldump(
            env('DB_CONNECTION') . ':host=' . env('DB_HOST') . ';dbname=' . env('DB_DATABASE'),
            env('DB_USERNAME'),
            env('DB_PASSWORD'),
            array(
                'no-create-db' => true,
                'no-create-info' => true,
            )
        );
        $dump->start($tempFile);

        $encrypted = Crypt::encryptString(file_get_contents($tempFile));

        file_put_contents(storage_path() . '/app/backups/database_' . date('Ymd') . '.sql', $encrypted);
        File::delete($tempFile);
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

    public function decryptUtility()
    {
        return Inertia::render('Webmaster/DecryptUtility', [
            '_token' => csrf_token()
        ]);
    }

    public function decryptUtilityPost(Request $request)
    {
        try {
            $validated = $request->validate([
                'file' => 'required',
                'key' => 'required',
            ]);

            $key = base64_decode($validated['key']);
            $encrypter = new Encrypter($key, 'AES-256-CBC');

            $content = $validated['file']->get();
            $filename = $validated['file']->getClientOriginalName();

            $output =  $encrypter->decryptString($content);

            return response()->streamDownload(function () use ($output) {
                echo $output;
            }, $filename . "_dec");
        } catch (RuntimeException $e) {
            return redirect()->back()->with('notistack', ['error', 'Unable to decrypt. ' . $e->getMessage()]);
        }
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

    public function partremigrate($count)
    {
        $this->authorizeRole('webmaster');

        if ($count == 0) {
            return redirect()->back();
        }

        try {
            $this->do_backup();
            Artisan::call('migrate:refresh', ['--force' => true, '--step' => $count]);
        } catch (\Exception $e) {
            return redirect()->back()->with('notistack', ['error', $e->getMessage()]);
        }

        return Artisan::output();
    }

    public function log_internal()
    {
        $this->authorizeRole('webmaster'); // Todo add specific authorization

        return Inertia::render('Webmaster/InternalLog');
    }

    public function log_internal_getrows(int $perPage, int $page)
    {
        $this->authorizeRole('webmaster'); // Todo add specific authorization

        $rows = Log::with(['agent','item'])->orderBy('id', 'desc')->paginate( $perPage, ['*'], 'page', $page );

        return json_encode($rows);
    }
}
