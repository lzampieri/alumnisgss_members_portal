<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\Email;
use App\Models\External;
use App\Models\Log;
use App\Models\LoginMethod;
use App\Models\Permission;
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

        $encrypted = Crypt::encryptString(file_get_contents($tempFile));

        $filename = '/app/backups/database_' . date('Ymd') . '.sql';
        file_put_contents(storage_path() . $filename, $encrypted);
        File::delete($tempFile);

        LogController::log( LogEvents::BACKUP_DONE, NULL, 'filename', NULL, $filename );
    }

    public function backup()
    {
        // No authorization: visible by anyone

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

        $rows = Log::with(['agent','item'])->orderBy('id', 'desc')->paginate( $perPage, ['*'], 'page', $page ); // todo check if here I should add a +1

        return json_encode($rows);
    }

    public function sendTestMail()
    {
        $this->authorizeRole('webmaster'); // Todo add specific authorization

        $message = "Questo è un messaggio di prova inviato su richiesta del webmaster dal portale soci.";

        $message .= "Le mail di richiesta accesso sono tipicamente inviate a:\n";
        $message .= implode("\n",MailerController::getAddresses( array_merge( Alumnus::allWithPermission('accesses-receive-request-emails'), External::allWithPermission('accesses-receive-request-emails'))) );

        $email = Auth::user()->address;

        LogController::log( LogEvents::MAIL_SENT, NULL, 'email', NULL, $email );
        
        Mail::raw(
            $message,
            function (\Illuminate\Mail\Message $message) use ($email) {
                $message->to($email);
                $message->subject('Messaggio di test da soci.alumnuscuolagalileiana.it');
        });

        return redirect()->back()
            ->with('notistack', ['success', "Mail inviata."]);
    }

    public function translateLoginMethodsToEmails() // TODO REMOVE
    {
        $lmth = LoginMethod::all();

        foreach ($lmth as $lm) {
            $em = new Email([
                'address' => $lm->credential,
                'primary' => false,
                'comment' => $lm->comment,
            ]);

            $em->last_login = $lm->last_login;
            $em->created_at = $lm->created_at;

            if( $lm->identity ) {
                $em->identity()->associate($lm->identity);
            }
            $em->save();
        }
    }
}
