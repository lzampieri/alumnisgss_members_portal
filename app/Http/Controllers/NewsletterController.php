<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\Email;
use App\Models\External;
use App\Models\File;
use App\Models\Newsletter;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Mail\Mailer;
use Illuminate\Mail\MailServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Swift_Attachment;
use Swift_Mailer;
use Swift_Message;
use Swift_Preferences;
use Swift_SmtpTransport;

class NewsletterController extends Controller
{
    public function list()
    {
        if (Auth::user()->can('viewAll', Newsletter::class)) {
            $newsletters = Newsletter::with('owner')->orderBy('updated_at', 'desc')->get();
        } else {
            $newsletters = Auth::user()->identity->newsletters()->with('owner')->orderBy('updated_at', 'desc')->get();
        }

        return Inertia::render(
            'Newsletter/List',
            [
                'list' => $newsletters,
                'canCreate' => Auth::user()->can('create', Newsletter::class)
            ]
        );
    }

    public function create()
    {
        $this->authorize('create', Newsletter::class);

        $newletter = new Newsletter();
        $newletter->owner()->associate(Auth::user()->identity);
        $newletter->save();

        return redirect()->route('newsletter.edit', ['newsletter' => $newletter->id]);
    }

    public function edit(Newsletter $newsletter)
    {
        $this->authorize('edit', $newsletter);

        $newsletter->append('attachments');

        $emails = Email::whereHas('identity')->with('identity')->get();
        $emails = $emails->sortBy([['identity.surname', 'asc'], ['identity.name', 'asc'], ['primary', 'desc']]);
        $emails = array_values( $emails->append('canView')->filter->canView->toArray() );

        for ($i = 0; $i < count($emails); $i++) {
            if ($i == 0 || ($emails[$i]['identity']['id'] != $emails[$i - 1]['identity']['id'])) {
                $emails[$i]['isPrimary'] = true;
            } else $emails[$i]['isPrimary'] = false;
        }

        $user = Auth::user();

        $roles = Role::all()->filter(function ($role) use ($user) {
            if ($user->hasPermissionTo('emails-view-all')) return true;

            if ($role->name == 'everyone') return false;
            if (in_array($role->name, Alumnus::public_status))
                return $user->hasPermissionTo('emails-view-public-alumnus');

            return $user->hasPermissionTo('user-edit-' . $role->name);
        });

        $aspirant_toappend = [];

        foreach ($roles as &$role) {
            if ($role->name == 'everyone') $role->identities = Alumnus::with('emails')->get()->concat(External::with('emails')->get());
            else if (in_array($role->name, Alumnus::public_status)) $role->identities = Alumnus::where('status', $role->name)->with('emails')->get();
            else $role->identities = Alumnus::role($role)->with('emails')->get()->concat(External::role($role)->with('emails')->get());

            if( in_array( $role->name, Alumnus::require_ratification ) ) $aspirant_toappend[] = $role->name;
        }

        $roles = array_values( $roles->toArray() );

        // Aspirant
        foreach ($aspirant_toappend as $i=>$status) {
            $roles[] = [
                'id' => -$i-1,
                'name' => 'aspirant_' . $status,
                'common_name' => 'Candidati ' . Alumnus::AlumnusStatusLabels[ $status ],
                'identities' => Alumnus::where('status','!=',$status)->whereHas('ratifications', function ($query) use ($status) {
                    $query->where('required_state', $status)->whereNull('document_id');
                })->with('emails')->get()
            ];
        }


        return Inertia::render(
            'Newsletter/Edit',
            [
                'newsletter' => $newsletter,
                'rubrica' => $emails,
                'groups' => $roles,
                'allowedFormats' => [...File::ALLOWED_FORMATS, ...File::ALLOWED_IMAGES_FORMATS]
            ]
        );
    }

    public function edit_post(Newsletter $newsletter, Request $request)
    {
        $this->authorize('edit', $newsletter);

        $validated = $request->validate([
            'subject' => 'required',
            'to' => 'array',
            'to.*' => 'required|email',
            'body' => 'required',
            'attachments' => 'array',
            'attachments.*' => 'integer|exists:files,id'
        ], [
            'to.*.email' => ':input non è un indirizzo email valido '
        ]);

        $newsletter->subject = $validated['subject'];
        $newsletter->to = array_key_exists('to', $validated) ? $validated['to'] : [];
        $newsletter->body = $validated['body'];

        // Illegal to associate attachments to daughter newsletter
        if ($newsletter->parent_id == null) {
            $toRemove = $newsletter->attch_mine()->whereNotIn('id', $validated['attachments'])->get();
            foreach( $toRemove as $att ) {
                $att->parent()->dissociate()->save();
            }

            // This should not be needed, meaning when a file is uploaded it is automatically
            // associated to the newsletter. But who knows, bug can happen, so this is
            // redundancy
            $toAdd = File::whereIn('id', $validated['attachments'])->whereNull('parent_id')->get();
            foreach( $toAdd as $att ) {
                $att->parent()->associate($newsletter)->save();
            }
        }

        $newsletter->save();

        return redirect()->back()->with('notistack', ['success', 'Bozza salvata']);
    }

    public function uploadAttachments(Newsletter $newsletter, Request $request)
    {
        $this->authorize('edit', $newsletter);

        $validated = $request->validate([
            'attachments' => 'required|array',
            'attachments.*' => 'required|mimes:' . implode(",", [...File::ALLOWED_FORMATS, ...File::ALLOWED_IMAGES_FORMATS])
        ]);

        $outputs = [];

        foreach ($validated['attachments'] as $attch) {
            $filename = $attch->getClientOriginalName();
            $extension = pathinfo($filename)['extension'];

            // Compute cleaned file name
            $cleaned_name = preg_replace("([^\w\s\d\_])", "", str_replace(" ", "_", pathinfo($filename)['filename']));

            // Upload file
            $file = File::create();
            $file->handle =  $cleaned_name . '_' . $file->id . '.' . $extension;
            $file->parent()->associate($newsletter)->save();
            $file->save();

            $attch->storeAs('files', $file->handle);

            $outputs[] = $file;
        }

        return response()->json($outputs);
    }

    public function preview(Newsletter $newsletter)
    {
        $this->authorize('edit', $newsletter);

        $newsletter->append('attachments');

        $user = Auth::user()->identity->load('emails','emails.identity');
        $email = null;

        if( env('APP_ENV', 'local') == 'local' ) {
            Swift_Preferences::getInstance()->setCacheType('null');
            // Local development is done on windows, which does not
            // like swiftmailer's cache system
        }

        if (count($user->emails) > 0) {
            $email = $user->emails[0]->address;

            Mail::send([], [], function (\Illuminate\Mail\Message $msg) use ($email, $newsletter) {
                $msg->to($email);
                $msg->replyTo("info@alumniscuolagalileiana.it");
                $msg->from("info@alumniscuolagalileiana.it");
                $msg->subject("Test | " . $newsletter->subject);
                $msg->setBody($newsletter->body, 'text/html');
                foreach( $newsletter->attachments as $att ) {
                    $msg->attach($att->path());
                }
            });
            LogController::log(LogEvents::MAIL_SENT, NULL, $newsletter->subject, [$email, $newsletter]);
        }

        return Inertia::render(
            'Newsletter/Preview',
            [
                'newsletter' => $newsletter,
                'sentTo' => $email,
                'canSend' => Auth::user()->can('send', $newsletter)
            ]
        );
    }

    public function send(Newsletter $newsletter)
    {
        $this->authorize('send', $newsletter);

        $froms_all = explode(",", env('MAIL_FROM_BULK', ""));
        $froms_pw = env('MAIL_FROM_BULK_PASSWORD', "");

        $emails_per_page = env('EMAILS_PER_PAGE', 45);
        $pages_per_address = env('PAGES_PER_ADDRESS', 4);

        $debug_addr = env('MAIL_FROM_ADDRESS', "");

        if (count($froms_all) == 0) {
            return redirect()->back()->with('notistack', ['error', 'Nessun indirizzo di invio configurato']);
        }

        if (count($newsletter->to) == 0) {
            return redirect()->back()->with('notistack', ['error', 'Nessun destinatario']);
        }

        // TODO add check for multiple emails on the same day
        $used_from = Newsletter::whereDate('sent_at', '>=', now()->subDays(1))->select('from')->distinct()->pluck('from')->toArray();
        $froms = array_values( array_diff($froms_all, $used_from) );

        if (count($newsletter->to) > $emails_per_page * $pages_per_address * count($froms)) {
            return redirect()->back()->with('notistack', ['error', 'Troppi indirizzi email. Max ' . ($emails_per_page * $pages_per_address * count($froms)) . ' rimanenti oggi, richiesti ' . count($newsletter->to)]);
        }

        $newsletters = [];

        $page = 1;
        $address = 0;
        $newsletter->from = $froms[0];

        $attachments = [];

        if( env('APP_ENV', 'local') == 'local' ) {
            Swift_Preferences::getInstance()->setCacheType('null');
            // Local development is done on windows, which does not
            // like swiftmailer's cache system
        }
            
        foreach ($newsletter->attachments as $att) {
            $attachments[] = Swift_Attachment::fromPath( $att->path());
        }

        while (count($newsletter->to) > $emails_per_page) {
            $newsletters[] = Newsletter::create([
                'subject' => $newsletter->subject,
                'to' => array_slice($newsletter->to, -$emails_per_page),
                'body' => $newsletter->body,
                'owner_id' => $newsletter->owner_id,
                'owner_type' => $newsletter->owner_type,
                'from' => $froms[$address],
                'parent_id' => $newsletter->id
            ]);
            $newsletter->to = array_slice($newsletter->to, 0, -$emails_per_page);

            $page++;
            if ($page >= $pages_per_address) {
                $page = 0;
                $address++;
            }
        }

        $newsletter->save();
        $newsletters[] = $newsletter;

        $reuseaddress = "";
        $swift_mailer = null;

        $count = 1;

        foreach ($newsletters as &$nl) {
            if ($reuseaddress != $nl->from) {
                $transport = new Swift_SmtpTransport(
                    env('MAIL_HOST', 'localhost'),
                    env('MAIL_PORT', 587)
                );
                $transport->setEncryption(env('MAIL_ENCRYPTION', 'tls'));
                $transport->setUsername($nl->from);
                $reuseaddress = $nl->from;
                $transport->setPassword($froms_pw);

                $swift_mailer = new Swift_Mailer($transport);
            }

            LogController::log(LogEvents::MAIL_SENT, NULL, $nl->subject, [...$nl->to, $debug_addr]);

            $message = new Swift_Message($nl->subject);
            $message->setBody($nl->body, 'text/html');
            $message->setBcc([...$nl->to, $debug_addr]);
            $message->setReplyTo("info@alumniscuolagalileiana.it");
            $message->setFrom(["info@alumniscuolagalileiana.it" => "Associazione Alumni Scuola Galileiana"]);

            foreach( $attachments as $att ) {
                $message->attach($att);
            }

            // Add reference to the newsletter
            $headers = $message->getHeaders();
            $headers->addTextHeader('X-Newsletter-ID', $nl->id . " daughter of " . $newsletter->id);
            $headers->addTextHeader('X-Newsletter-progress', $count . "/" . count($newsletters));

            $swift_mailer->send($message);

            // TODO distinguish MAIL_SENT, NEWSLETTER_SENT, NEWSLETEER_DEBUG_SENT
            LogController::log(LogEvents::MAIL_SENT, NULL, $newsletter->subject, [$nl]);
            $nl->sent_at = now();
            $nl->save();

            $count++;
        }

        return redirect()->route('newsletters')->with('notistack', ['success', 'Invio avvenuto con successo']);
    }

    public function view(Newsletter $newsletter)
    {
        $this->authorize('view', $newsletter);

        $newsletter->load('parent');
        $newsletter->append('attachments');

        $parent = $newsletter;
        if( $newsletter->parent ) $parent = $newsletter->parent;

        $alladdresses_sent    =  $parent->childrens()->whereNotNull('sent_at')->pluck('to')->flatten();
        $alladdresses_waiting =  $parent->childrens()->whereNull('sent_at')   ->pluck('to')->flatten();

        if( $parent->sent_at ) $alladdresses_sent = $alladdresses_sent->concat($parent['to']);
        else $alladdresses_waiting = $alladdresses_waiting->concat($parent['to']);

        return Inertia::render(
            'Newsletter/View',
            [
                'newsletter' => $newsletter,
                'alladdresses_sent' => $alladdresses_sent,
                'alladdresses_waiting' => $alladdresses_waiting,
            ]
        );
    }
}
