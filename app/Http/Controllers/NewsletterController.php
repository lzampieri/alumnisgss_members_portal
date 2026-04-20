<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\Email;
use App\Models\External;
use App\Models\File;
use App\Models\MailingList;
use App\Models\Newsletter;
use App\Models\Position;
use App\Models\Role;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email as MimeEmail;
use Symfony\Component\Mime\Message;
use Symfony\Component\Mime\Part\DataPart;

class NewsletterController extends Controller
{

    public function list()
    {
        if (Auth::user()->can('viewAll', Newsletter::class)) {
            $prequery = Newsletter::with('owner');
        } else {
            $prequery = Auth::user()->identity->newsletters()->with('owner');
        }
        $newsletters = $prequery->orderBy('updated_at', 'desc')->doesntHave('parent')->get();
        $newsletters->load('childrens');

        $newsletters = $newsletters->append(['totalCountTo','totalSentTo','totalScheduled']);

        return Inertia::render(
            'Newsletter/List',
            [
                'list' => $newsletters,
                'canCreate' => Auth::user()->can('create', Newsletter::class)
            ]
        );
    }

    public function listAll()
    {
        if (Auth::user()->can('viewAll', Newsletter::class)) {
            $newsletters = Newsletter::with('owner')->orderBy('updated_at', 'desc')->get();
        } else {
            $newsletters = Auth::user()->identity->newsletters()->with('owner')->orderBy('updated_at', 'desc')->get();
        }

        $newsletters = $newsletters->append(['countTo']);

        return Inertia::render(
            'Newsletter/ListAll',
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
        $newsletter->load(['mailingLists','childrens','parent']);

        $emails = Email::whereHas('identity')->with('identity')->get()->makeVisible('identity');
        $emails = $emails->sortBy([['identity.surname', 'asc'], ['identity.name', 'asc'], ['primary', 'desc']]);
        $emails = array_values($emails->append('canView')->filter->canView->toArray());

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

            // If it is an automatic role, it should be available to everyone
            if ($role->isAutomatic) return true;

            return $user->hasPermissionTo('user-edit-' . $role->name);
        });

        $aspirant_toappend = [];

        $position_defined_roles = Position::select('type')->distinct()->get()->pluck('type')->toArray();

        foreach ($roles as &$role) {
            if ($role->name == 'everyone') $role->identities = Alumnus::with('emails')->get()->concat(External::with('emails')->get());
            else if (in_array($role->name, Alumnus::public_status)) $role->identities = Alumnus::where('status', $role->name)->with('emails')->get();
            else if (in_array($role->name, $position_defined_roles)) $role->identities = Alumnus::whereHas('positions', function (Builder $query) use ($role) {
                $query->where('type', $role->name)->whereNowOrPast('from')->whereNowOrFuture('to');
            })->with('emails')->get()->concat(External::whereHas('positions', function (Builder $query) use ($role) {
                $query->where('type', $role->name)->whereNowOrPast('from')->whereNowOrFuture('to');
            })->with('emails')->get());
            else $role->identities = Alumnus::role($role)->with('emails')->get()->concat(External::role($role)->with('emails')->get());

            $role->identities->makeVisible('emails');

            if (in_array($role->name, Alumnus::require_ratification)) $aspirant_toappend[] = $role->name;
        }

        $roles = array_values($roles->toArray());

        // Aspirant
        foreach ($aspirant_toappend as $i => $status) {
            $roles[] = [
                'id' => -$i - 1,
                'name' => 'aspirant_' . $status,
                'common_name' => 'Candidati ' . Alumnus::AlumnusStatusLabels[$status],
                'identities' => Alumnus::where('status', '!=', $status)->whereHas('ratifications', function ($query) use ($status) {
                    $query->where('required_state', $status)->whereNull('document_id');
                })->with('emails')->get()
            ];
        }

        $mailingLists = MailingList::all()->filter->canView->values();


        return Inertia::render(
            'Newsletter/Edit',
            [
                'newsletter' => $newsletter,
                'rubrica' => $emails,
                'groups' => $roles,
                'mailingLists' => $mailingLists,
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
            'attachments.*' => 'integer|exists:files,id',
            'mailingLists' => 'array',
            'mailingLists.*' => 'integer|exists:mailing_lists,id',
        ], [
            'to.*.email' => ':input non è un indirizzo email valido '
        ]);

        $newsletter->subject = $validated['subject'];
        $newsletter->to = array_key_exists('to', $validated) ? $validated['to'] : [];
        $newsletter->body = $validated['body'];

        // Illegal to associate attachments to daughter newsletter
        if ($newsletter->parent_id == null) {
            $toRemove = $newsletter->attch_mine()->whereNotIn('id', $validated['attachments'])->get();
            foreach ($toRemove as $att) {
                $att->parent()->dissociate()->save();
            }

            // This should not be needed, meaning when a file is uploaded it is automatically
            // associated to the newsletter. But who knows, bug can happen, so this is
            // redundancy
            $toAdd = File::whereIn('id', $validated['attachments'])->whereNull('parent_id')->get();
            foreach ($toAdd as $att) {
                $att->parent()->associate($newsletter)->save();
            }
        }

        $newsletter->save();

        // Mailing lists
        $current_ids = $newsletter->mailingLists->pluck('id')->toArray();
        $new_ids = $validated['mailingLists'];
        foreach( array_diff( $current_ids, $new_ids ) as $toRemove ) {
            $newsletter->mailingLists()->detach($toRemove);
        }
        foreach( array_diff( $new_ids, $current_ids ) as $toAdd ) {
            $newsletter->mailingLists()->attach($toAdd);
        }


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

    public function upload_img(Request $request, Newsletter $newsletter)
    {
        $this->authorize('edit', $newsletter);


        $validated = $request->validate([
            'image' => 'required|mimes:' . implode(",", File::ALLOWED_IMAGES_FORMATS)
        ]);

        $filename = $validated['image']->getClientOriginalName();
        $extension = pathinfo($filename)['extension'];
        $filename = Str::uuid7() . '.' . $extension;
        $validated['image']->storeAs('newsimgs', $filename);

        return response()->json(['handle' => $filename]);
    }

    public function media(String $handle)
    {
        return response()->file(storage_path('app/newsimgs/' . $handle));
    }

    public function preview(Newsletter $newsletter)
    {
        $this->authorize('edit', $newsletter);

        $newsletter->append('attachments');

        $user = Auth::user()->identity->load('emails', 'emails.identity');
        $email = null;

        if (count($user->emails) > 0) {
            $email = $user->emails[0]->address;

            Mail::send([], [], function (\Illuminate\Mail\Message $msg) use ($email, $newsletter) {
                $msg->to($email);
                $msg->replyTo("info@alumniscuolagalileiana.it");
                $msg->from("info@alumniscuolagalileiana.it");
                $msg->subject("Test | " . $newsletter->subject);
                $msg->html($newsletter->body);
                foreach ($newsletter->attachments as $att) {
                    $msg->attach($att->path());
                }
            });
            LogController::log(LogEvents::NEWSLETTER_TEST_SENT, NULL, $newsletter->subject, [$email, $newsletter]);
        }

        $newsletter->append('allToList');

        $serverETA = count($newsletter->allToList) / env('SERVER_MAIL_MAXDEST',1) * env('SERVER_MAIL_INTERVAL',1) / 60;

        return Inertia::render(
            'Newsletter/Preview',
            [
                'newsletter' => $newsletter,
                'sentTo' => $email,
                'canSend' => Auth::user()->can('send', $newsletter),
                'canSendServer' => Auth::user()->can('sendServer', $newsletter),
                'serverETA' => $serverETA
            ]
        );
    }

    public function preview_post(Request $request, Newsletter $newsletter)
    {
        $this->authorize('edit', $newsletter);

        $newsletter->append('attachments');

        $validated = $request->validate([
            'sendTo' => 'required|email',
        ]);
        $email = $validated['sendTo'];

        Mail::send([], [], function (\Illuminate\Mail\Message $msg) use ($email, $newsletter) {
            $msg->to($email);
            $msg->replyTo("info@alumniscuolagalileiana.it");
            $msg->from("info@alumniscuolagalileiana.it");
            $msg->subject("Test | " . $newsletter->subject);
            $msg->html($newsletter->body);
            foreach ($newsletter->attachments as $att) {
                $msg->attach($att->path());
            }
        });
        LogController::log(LogEvents::NEWSLETTER_TEST_SENT, NULL, $newsletter->subject, [$email, $newsletter]);

        return response()->json(['sentTo' => $email]);
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

        $newsletter->append('allToList');
        $allTo = $newsletter->allToList;

        if (count($allTo) == 0) {
            return redirect()->back()->with('notistack', ['error', 'Nessun destinatario']);
        }

        $used_from = Newsletter::whereDate('sent_at', '>=', now()->subDays(1))->select('from')->distinct()->pluck('from')->toArray();
        $froms = array_values(array_diff($froms_all, $used_from));

        if (count($allTo) > $emails_per_page * $pages_per_address * count($froms)) {
            return redirect()->back()->with('notistack', ['error', 'Troppi indirizzi email. Max ' . ($emails_per_page * $pages_per_address * count($froms)) . ' rimanenti oggi, richiesti ' . count($allTo)]);
        }

        $newsletters = [];

        $page = 1;
        $address = 0;
        $newsletter->from = $froms[0];

        $attachments = [];

        foreach ($newsletter->attachments as $att) {
            $attachments[] =  DataPart::fromPath($att->path());
        }

        while (count($allTo) > $emails_per_page) {
            $newsletters[] = Newsletter::create([
                'subject' => $newsletter->subject,
                'to' => array_slice($allTo, -$emails_per_page),
                'body' => $newsletter->body,
                'owner_id' => $newsletter->owner_id,
                'owner_type' => $newsletter->owner_type,
                'from' => $froms[$address],
                'parent_id' => $newsletter->id
            ]);
            $allTo = array_slice($allTo, 0, -$emails_per_page);

            $page++;
            if ($page >= $pages_per_address) {
                $page = 0;
                $address++;
            }
        }

        $newsletter->to = $allTo;
        $newsletter->mailingLists()->detach();
        $newsletter->save();
        $newsletters[] = $newsletter;

        $reuseaddress = "";
        $symfony_mailer = null;

        $count = 1;

        foreach ($newsletters as &$nl) {
            if ($reuseaddress != $nl->from) {
                $transport = new EsmtpTransport(
                    env('MAIL_HOST', 'localhost'),
                    env('MAIL_PORT', 465),
                    env('MAIL_ENCRYPTION', 'tls') == 'tls'
                );
                $transport->setUsername($nl->from);
                $reuseaddress = $nl->from;
                $transport->setPassword($froms_pw);

                $symfony_mailer = new Mailer($transport);
            }

            $message = new MimeEmail();
            $message->subject($nl->subject);
            $message->html($nl->body);
            $message->bcc($debug_addr);
            foreach ($nl->to as $t)
                $message->addBcc($t);
            $message->replyTo("info@alumniscuolagalileiana.it");
            $message->from(new Address("info@alumniscuolagalileiana.it", "Associazione Alumni Scuola Galileiana"));

            foreach ($attachments as $att) {
                $message->addPart($att);
            }

            // Add reference to the newsletter
            $headers = $message->getHeaders();
            $headers->addTextHeader('X-Newsletter-ID', $nl->id . " daughter of " . $newsletter->id);
            $headers->addTextHeader('X-Newsletter-progress', $count . "/" . count($newsletters));

            $symfony_mailer->send($message);

            // TODO distinguish MAIL_SENT, NEWSLETTER_SENT, NEWSLETEER_DEBUG_SENT
            $nl->sent_at = now();
            $nl->save();

            LogController::log(LogEvents::NEWSLETTER_SENT, NULL, $nl->subject || '', [...$nl->to, $debug_addr]);

            $count++;
        }

        return redirect()->route('newsletters')->with('notistack', ['success', 'Invio avvenuto con successo']);
    }

    public function sendSMTP(Newsletter $newsletter)
    {
        $this->authorize('sendServer', $newsletter);

        $emails_per_page = env('SERVER_MAIL_MAXDEST', 45);

        $newsletter->append('allToList');
        $allTo = $newsletter->allToList;

        if (count($allTo) == 0) {
            return redirect()->back()->with('notistack', ['error', 'Nessun destinatario']);
        }

        $newsletters = [];

        $attachments = [];

        foreach ($newsletter->attachments as $att) {
            $attachments[] =  DataPart::fromPath($att->path());
        }

        while (count($allTo) > $emails_per_page) {
            $newsletters[] = Newsletter::create([
                'subject' => $newsletter->subject,
                'to' => array_slice($allTo, -$emails_per_page),
                'body' => $newsletter->body,
                'owner_id' => $newsletter->owner_id,
                'owner_type' => $newsletter->owner_type,
                'from' => 'SMTP',
                'parent_id' => $newsletter->id
            ]);
            $allTo = array_slice($allTo, 0, -$emails_per_page);
        }

        $newsletter->to = $allTo;
        $newsletter->from = 'SMTP';
        $newsletter->mailingLists()->detach();
        $newsletter->save();

        return redirect()->route('newsletters')->with('notistack', ['success', 'Invio programmato con successo']);
    }

    public function smtpCallback(Newsletter $newsletter)
    {

        $delay = env('SERVER_MAIL_INTERVAL',1);
        $extra = Newsletter::where('from','SMTP')
            ->whereNotNull('sent_at')
            ->whereDate('sent_at', '<=', now()->subMinutes($delay))
            ->first();

        if( $extra )
            return response("Nothing done, too early");

        $nl = Newsletter::where('from','SMTP')
            ->whereNull('sent_at')
            ->orderBy('ID')
            ->first();

        $parent = $nl->parent ?: $nl;

        if( !$nl )
            return response("Nothing done, nothing to be done");

        $transport = new EsmtpTransport(
            env('SERVER_MAIL_HOST', 'localhost'),
            env('SERVER_MAIL_PORT', 465),
            env('SERVER_MAIL_ENCRYPTION', 'tls') == 'tls'
        );
        $transport->setUsername(env('SERVER_MAIL_USERNAME', ''));
        $transport->setPassword(env('SERVER_MAIL_PASSWORD', ''));

        $symfony_mailer = new Mailer($transport);

            
        $message = new MimeEmail();
        $message->subject($nl->subject);
        $message->html($nl->body);
        $message->bcc(env('SERVER_MAIL_DEBUG_ADDRESS', ''));
        foreach ($nl->to as $t)
            $message->addBcc($t);
        $message->replyTo(env('SERVER_MAIL_FROM_ADDRESS', ''));
        $message->from(new Address(
            env('SERVER_MAIL_FROM_ADDRESS', ''),
            env('SERVER_MAIL_FROM_NAME', '')));
            
        foreach ($parent->attachments as $att) {
            $message->addPart( DataPart::fromPath($att->path()) );
        }
                
        // Add reference to the newsletter
        $headers = $message->getHeaders();
        $headers->addTextHeader('X-Newsletter-ID', $nl->id . " daughter of " . $parent->id);
                
        $symfony_mailer->send($message);
                
        LogController::log(LogEvents::NEWSLETTER_SMTP_SENT, NULL, $newsletter->subject, [$nl]);
        $nl->sent_at = now();
        $nl->save();

        return response("Done");
    }

    public function view(Newsletter $newsletter)
    {
        $this->authorize('view', $newsletter);

        $newsletter->load(['parent','mailingLists','childrens']);
        $newsletter->append('attachments');

        $parent = $newsletter;
        if ($newsletter->parent) $parent = $newsletter->parent;

        $alladdresses_sent    =  $parent->childrens()->whereNotNull('sent_at')->pluck('to')->flatten() ?: [];
        $alladdresses_waiting =  $parent->childrens()->whereNull('sent_at')->pluck('to')->flatten() ?: [];

        if ($parent->sent_at) $alladdresses_sent = $alladdresses_sent->concat($parent['to'] ?: []);
        else $alladdresses_waiting = $alladdresses_waiting->concat($parent['to'] ?: [] );

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
