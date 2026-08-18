<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function home()
    {
        $this->authorize('viewAny', Ticket::class);

        return Inertia::render(
            'Tickets/Home',
        );
    }

    public function addList()
    {
        $this->authorize('create', Ticket::class);

        $availableTypes = Ticket::getAllTypes();
        $availableTypes = $availableTypes->map(function ($item) {
            return [
                'key' => $item,
                'name' => call_user_func(Ticket::fullName($item) . "::commonName"),
            ];
        })->filter(function ($item) {
            return call_user_func(Ticket::fullName($item['key']) . "::selfCreatable");
        })->toArray();

        return Inertia::render(
            'Tickets/AddList',
            [
                'availableTypes' => array_values($availableTypes)
            ]
        );
    }

    public function add(Request $request, String $type)
    {
        $this->authorize('create', Ticket::class);

        if (!Ticket::getAllTypes()->contains($type))
            return abort(501);

        $tti = call_user_func(Ticket::fullName($type) . "::fromRequest", $request);
        if (!$tti)
            return abort(422);

        return Inertia::render(
            'Tickets/Add',
            [
                'author' => Auth::user()->surnameAndName(),
                'type' => $type,
                'name' => $tti->commonName(),
                'fieldList' => $tti->fieldList(),
            ]
        );
    }

    public function addPost(String $type, Request $request)
    {
        $this->authorize('create', Ticket::class);

        if (!Ticket::getAllTypes()->contains($type))
            return abort(501);

        $tti = call_user_func(Ticket::fullName($type) . "::fromRequest", $request);
        if (!$tti)
            return abort(422);

        $params = $tti->validateInput($request);

        $newTicket = Auth::user()->authoredTickets()->create([
            'type' => $type,
            'params' => $params
        ]);
        if ($tti->refObject()) {
            $newTicket->reference()->associate($tti->refObject());
            $newTicket->save();
        }

        $message = "<b>È stato inserita una nuova richiesta nel portale soci</b>\n";
        $message .= "Ticket  #" . $newTicket->id . " - " . call_user_func(Ticket::fullName($type) . "::commonName") . "\n";
        $message .= "Creato da " . Auth::user()->surnameAndName() . "\n\n";

        foreach ($newTicket->instance->fieldList() as $key => $field)
            $message .= "<i>" . $field['label'] . "</i>\n" . $field['currentValue'] . "\n\n";

        $message .= "<a href='" . route('ticket.view', $newTicket) . "'>Visualizza e rispondi alla richiesta</a>\n";


        MailerController::sendEmail(
            $newTicket->instance->notifyOnCreation(),
            'Ticket #' . $newTicket->id . ' - ' . call_user_func(Ticket::fullName($type) . "::commonName"),
            $message
        );

        return redirect()->route('helpdesk')->with('notistack', ['success', 'Richiesta inserita']);;
    }

    public function view(Ticket $ticket)
    {
        $this->authorize('view', $ticket);

        $ticket->load(['comments', 'author', 'assigner', 'reference', 'comments.author']);

        return Inertia::render(
            'Tickets/View',
            [
                'ticket' => $ticket,
                'commonName' => $ticket->instance->commonName(),
                'fieldList' => $ticket->instance->fieldList(),
                'actionList' => $ticket->instance->actionList(),
                'canComment' => in_array($ticket->status, ['open'])
            ]
        );
    }

    public function addComment(Ticket $ticket, Request $request)
    {
        $this->authorize('comment', $ticket);

        $validated = $request->validate([
            'content' => 'required|min:3'
        ]);

        $newComment = new TicketComment([
            'content' => $validated['content']
        ]);
        $newComment->author()->associate(Auth::user());
        $newComment->ticket()->associate($ticket);
        $newComment->save();

        $message = "<b>È stato inserito un nuovo commento</b>\n";
        $message .= "Ticket  #" . $ticket->id . " - " . $ticket->instance->commonName() . "\n";
        $message .= $ticket->instance->jsonSerialize()['subject'] . "\n\n";

        $message .= "<i>Commento di " . Auth::user()->surnameAndName() . "</i>\n";
        $message .= $validated['content'] . "\n\n";

        $message .= "<a href='" . route('ticket.view', $ticket) . "'>Visualizza e rispondi alla richiesta</a>\n";

        $sendingTo = [$ticket->author, $ticket->assigner];
        foreach ($ticket->comments as $comment)
            $sendingTo[] = $comment->author;

        // But not sending to myself!
        $sendingTo = array_filter($sendingTo, function ($identity) {
            return $identity && ($identity->id != Auth::user()->id);
        });

        MailerController::sendEmail(
            $sendingTo,
            'Nuovo commento al ticket #' . $ticket->id,
            $message
        );

        return redirect()->back()->with('notistack', ['success', 'Commento aggiunto']);
    }

    public function doAction(Ticket $ticket, string $action)
    {
        $this->authorize('view', $ticket);

        $prevStatus = $ticket->status;

        $output = $ticket->instance->doAction($action);

        if ($output) {
            $newComment = new TicketComment([
                'content' => $output
            ]);
            $newComment->author()->associate(Auth::user());
            $newComment->ticket()->associate($ticket);
            $newComment->save();
        }

        if (($ticket->status != $prevStatus) && !($ticket->author()->is(Auth::user()))) {

            $message = "<b>È stato cambiato lo stato della richiesta</b>\n";
            $message .= "Ticket  #" . $ticket->id . " - " . call_user_func(Ticket::fullName($ticket->type) . "::commonName") . "\n";
            $message .= "Creato da " . $ticket->author->surnameAndName() . "\n\n";

            $message .= "È stato cambiato lo stato della richiesta da " . Auth::user()->surnameAndName() . "\n\n";

            $message .= "<a href='" . route('ticket.view', $ticket) . "'>Visualizza la richiesta aggiornata</a>\n";

            MailerController::sendEmail(
                [$ticket->author],
                'Cambio di stato del ticket #' . $ticket->id,
                $message
            );
        }

        return redirect()->back();
    }


    public function list_getrows(int $perPage, int $page)
    {
        $this->authorize('viewAny', Ticket::class);

        $identity = Auth::user();

        $rows = Ticket::where('author_id', $identity->id)
            ->orWhere('assigner_id', $identity->id)
            ->orWhereIn('type', Ticket::getVisibleTypes())
            ->with(['author'])->withCount('comments')
            ->orderBy('id', 'desc')->paginate($perPage, ['*'], 'page', $page + 1);

        return json_encode($rows);
    }
}
