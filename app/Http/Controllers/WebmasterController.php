<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\Email;
use App\Models\External;
use App\Models\Identity;
use App\Models\Log;
use App\Models\Permission;
use Defuse\Crypto\File as CryptoFile;
use Defuse\Crypto\Key;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Ifsnop\Mysqldump\Mysqldump;
use Illuminate\Encryption\Encrypter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Mail;
use RuntimeException;
use App\Utils\Settings;
use Illuminate\Support\Facades\DB;

class WebmasterController extends Controller
{
    public function home()
    {
        $this->authorizeRole('webmaster');

        return Inertia::render('Webmaster/List');
    }

    public function do_backup()
    {
        // No authorization: visible by anyone

        $tempFile = storage_path() . '/app/backups/temp.sql';

        $dump = new Mysqldump(
            env('DB_CONNECTION') . ':host=' . env('DB_HOST') . ';dbname=' . env('DB_DATABASE'),
            env('DB_USERNAME'),
            env('DB_PASSWORD'),
            array(
                'add-drop-table' => true,
                'no-create-db' => true,
                'no-create-info' => false,
            )
        );
        $dump->start($tempFile);
        $filename = storage_path() . '/app/backups/database_' . date('Ymd') . '.sql';

        CryptoFile::encryptFile($tempFile, $filename, Key::loadFromAsciiSafeString(env('APP_KEY_CR')));

        File::delete($tempFile);

        LogController::log(LogEvents::BACKUP_DONE, NULL, 'filename', NULL, $filename);
    }

    public function backup()
    {
        // No authorization: visible by anyone
        // return response()->streamDownload(function () {
        //     echo Key::createNewRandomKey()->saveToAsciiSafeString();
        // }, "key_dec.txt");

        try {
            $this->do_backup();
        } catch (\Exception $e) {
            return redirect()->back()->with('notistack', ['error', $e->getMessage()]);
        }

        return redirect()->back()->with('notistack', ['success', 'Backup effettuato']);
    }

    public function decryptUtility()
    {
        // Must be logged in - guaranteed in middleware

        return Inertia::render('Webmaster/DecryptUtility', [
            '_token' => csrf_token()
        ]);
    }

    public function decryptUtilityPost(Request $request)
    {
        // Must be logged in - guaranteed in middleware

        try {
            // $validated = $request->validate([
            //     'file' => 'required',
            //     'key' => 'required',
            // ]);

            // $key = base64_decode($validated['key']);
            // $encrypter = new Encrypter($key, 'AES-256-CBC');

            // $content = $validated['file']->get();
            // $filename = $validated['file']->getClientOriginalName();

            // $output =  $encrypter->decryptString($content);

            // return response()->streamDownload(function () use ($output) {
            //     echo $output;
            // }, $filename . "_dec");


            $validated = $request->validate([
                'file' => 'required',
                'key' => 'required',
            ]);

            $tempFile = storage_path() . '/app/' . $validated['file']->storeAs('backups', 'tempd');

            $tempFileDownload = storage_path() . '/app/backups/tempd.dec';
            CryptoFile::decryptFile($tempFile, $tempFileDownload, Key::loadFromAsciiSafeString($validated['key']));

            File::delete($tempFile);

            return response()->download($tempFileDownload, $validated['file']->getClientOriginalName() . '_dec')->deleteFileAfterSend(true);
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

        $rows = Log::with(['agent', 'item'])->orderBy('id', 'desc')->paginate($perPage, ['*'], 'page', $page); // todo check if here I should add a +1

        return json_encode($rows);
    }

    public function enableAllPublic()
    {
        $this->authorizeRole('webmaster'); // Todo add specific authorization

        $alumnus = Alumnus::whereIn('status', Alumnus::public_status)
            ->where('coorte', '>', 0)
            ->get();

        foreach ($alumnus as $a)
            $a->givePermissionTo('login');

        return redirect()->back()->with('notistack', ['success', 'Tutti i soci con ruolo pubblico abilitati al login!']);
    }

    public function sendTestMail()
    {
        $this->authorizeRole('webmaster'); // Todo add specific authorization

        $message = "Questo è un messaggio di prova inviato su richiesta del webmaster dal portale soci.";

        $message .= "Le mail di richiesta accesso sono tipicamente inviate a:\n";
        $message .= implode("\n", MailerController::getAddresses(Identity::allWithPermission('accesses-receive-request-emails')));

        $email = Auth::user()->address;

        LogController::log(LogEvents::MAIL_SENT, NULL, 'email', NULL, $email);

        Mail::raw(
            $message,
            function (\Illuminate\Mail\Message $message) use ($email) {
                $message->to([$email, 'webmaster@alumniscuolagalileiana.it']);
                $message->subject('Messaggio di test da soci.alumniscuolagalileiana.it');
            }
        );

        return redirect()->back()
            ->with('notistack', ['success', "Mail inviata."]);
    }


    public function settings()
    {
        $this->authorizeRole('webmaster'); // Todo add specific authorization

        $keyval = [];
        foreach (Settings::getAll() as $key => $value) {
            $keyval[] = [ 'key' => $key, 'value' => $value ];
        }

        return Inertia::render('Webmaster/Settings', ['settings' => $keyval]);
    }
    
    public function settings_post(Request $request)
    {
        $this->authorizeRole('webmaster'); // Todo add specific authorization

        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'sometimes|string|nullable',
            'settings.*.value' => 'sometimes',
        ]);

        $previous = Settings::getAll();

        $newdict = [];
        foreach ($validated['settings'] as $ss) {
            if( array_key_exists( 'key', $ss ) && strlen( $ss['key'] ) > 0 ) {
                $newdict[$ss['key']] = array_key_exists( 'value', $ss ) ? $ss['value'] : 0;
            }
        }
        Settings::setAll($newdict);
        Settings::save();

        LogController::log(LogEvents::SETTINGS_CHANGED,
            NULL, 'settings', $previous, $newdict);

        return redirect()->back()->with('notistack', ['success', 'Impostazioni salvate!']);
    }

    public function fix_rows()
    {
        $fields = [
            ['ticket_comments','author'],
            ['tickets','author'],
            ['tickets','assigner'],
            ['stamps','employee'],
            ['documents','author'],
            ['positions','owner'],
            ['newsletters','owner'],
            ['a_details','identity'],
            ['logs','agent'],
            ['emails','identity']
        ];

        foreach ($fields as $f) {
            DB::table($f[0])->where($f[1].'_type', 'App\Models\External')->where($f[1].'_id', '<', 1000)->increment($f[1].'_id',2000);
            DB::table($f[0])->where($f[1].'_type', 'App\Models\Alumnus')->where($f[1].'_id', '<', 1000)->increment($f[1].'_id',1000);
        }

        DB::table('ratifications')->where('alumnus_id', '<=', 1000)->increment('alumnus_id',1000);

        DB::table('alumni')->where('id', '<=', 1000)->increment('id',1000);
        DB::table('externals')->where('id', '<=', 1000)->increment('id',2000);

        $alumni = DB::table('alumni')->select('*')->get()->toArray();
        foreach ($alumni as $a) {
            DB::table('people')->insertOrIgnore((array)$a);
        }
        $externals = DB::table('externals')->select('*')->get()->toArray();
        foreach ($externals as $a) {
            DB::table('people')->insertOrIgnore((array)$a);
        }

        DB::table('people')->where('id', '>=', 2000)->update(['coorte' => -1]);

        
        DB::table('model_has_permissions')->where('model_type', 'App\Models\External')->where('model_id', '<', 1000)->increment('model_id',2000);
        DB::table('model_has_permissions')->where('model_type', 'App\Models\Alumnus')->where('model_id', '<', 1000)->increment('model_id',1000);
        DB::table('model_has_permissions')->where('model_type', 'App\Models\External')->where('model_id', '>=', 2000)->update(['model_type'=>'App\Models\Person']);
        DB::table('model_has_permissions')->where('model_type', 'App\Models\Alumnus')->where('model_id', '>=', 1000)->update(['model_type'=>'App\Models\Person']);
        
        
        DB::table('model_has_roles')->where('model_type', 'App\Models\External')->where('model_id', '<', 1000)->increment('model_id',2000);
        DB::table('model_has_roles')->where('model_type', 'App\Models\Alumnus')->where('model_id', '<', 1000)->increment('model_id',1000);
        DB::table('model_has_roles')->where('model_type', 'App\Models\External')->where('model_id', '>=', 2000)->update(['model_type'=>'App\Models\Person']);
        DB::table('model_has_roles')->where('model_type', 'App\Models\Alumnus')->where('model_id', '>=', 1000)->update(['model_type'=>'App\Models\Person']);
    }
}
