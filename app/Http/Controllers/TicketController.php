<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketComment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function home() {
        $this->authorize('viewAny', Ticket::class);

        return Inertia::render(
            'Tickets/Home',
            );
    }

    public function addList() {
        $this->authorize('create', Ticket::class);

        $availableTypes = Ticket::getAllTypes();
        $availableTypes = $availableTypes->map( function($item) {
            return [
                'key' => $item,
                'name' => call_user_func( Ticket::fullName( $item ) . "::commonName" ),
            ];
        })->filter( function($item) {
            return call_user_func( Ticket::fullName( $item['key'] ) . "::selfCreatable" );
        })->toArray();

        return Inertia::render(
            'Tickets/AddList',
            [
                'availableTypes' => array_values( $availableTypes )
            ]
        );
    }
    
    public function add(String $type) {
        $this->authorize('create', Ticket::class);

        if( !Ticket::getAllTypes()->contains($type) )
            return abort(501);

        if( !call_user_func( Ticket::fullName( $type ) . "::selfCreatable" ) )
            return abort(422);
        
        return Inertia::render(
            'Tickets/Add',
            [
                'author' => Auth()->user()->identity->surnameAndName(),
                'type' => $type,
                'name' => call_user_func( Ticket::fullName( $type ) . "::commonName" ),
                'fieldList' => call_user_func( Ticket::fullName( $type ) . "::fieldList" ),
            ]
        );
    }
    
    public function addPost(String $type, Request $request) {
        $this->authorize('create', Ticket::class);

        if( !Ticket::getAllTypes()->contains($type) )
            return abort(501);

        if( !call_user_func( Ticket::fullName( $type ) . "::selfCreatable" ) )
            return abort(422);

        $validationRules = collect( call_user_func( Ticket::fullName( $type ) . "::fieldList" ) )
            ->map( function($item) {
                return $item['validationRule'];
            } )->toArray();

        $validated = $request->validate( $validationRules );

        $newTicket = Auth()->user()->identity->authoredTickets()->create([
            'type' => $type,
            'params' => $validated
        ]);

        $message = "<b>È stato inserita una nuova richiesta nel portale soci</b>\n";
        $message .= "Ticket  #" . $newTicket->id . " - " . call_user_func( Ticket::fullName( $type ) . "::commonName" ) . "\n";
        $message .= "Creato da " . Auth()->user()->identity->surnameAndName() . "\n\n";

        foreach( call_user_func( Ticket::fullName( $type ) . "::fieldList" ) as $key => $field ) {
            $message .= "<i>" . $field['label'] . "</i>\n";
            $message .= Ticket::parseField( $field['type'], $newTicket->instance->$key ) . "\n\n";
        }

        $message .= "<a href='" . route('ticket.view', $newTicket) . "'>Visualizza e rispondi alla richiesta</a>\n";

        
        MailerController::sendEmail(
            $newTicket->instance->notifyOnCreation(),
            'Ticket #'.$newTicket->id.' - '.call_user_func( Ticket::fullName( $type ) . "::commonName" ),
            $message
        );
        
        return redirect()->route('helpdesk')->with('notistack', ['success', 'Richiesta inserita']);;
    }

    public function view(Ticket $ticket) {
        $this->authorize('view', $ticket);

        $ticket->load(['comments','author','assigner','reference','comments.author']);

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

    public function addComment(Ticket $ticket, Request $request) {
        $this->authorize('comment', $ticket);

        $validated = $request->validate([
            'content' => 'required|min:3'
        ]);

        $newComment = new TicketComment([
            'content' => $validated['content']
        ]);
        $newComment->author()->associate(Auth()->user()->identity);
        $newComment->ticket()->associate($ticket);
        $newComment->save();

        $message = "<b>È stato inserito un nuovo commento</b>\n";
        $message .= "Ticket  #" . $ticket->id . " - " . $ticket->instance->commonName() . "\n";
        $message .= $ticket->instance->jsonSerialize()['subject'] . "\n\n";

        $message .= "<i>Commento di " . Auth()->user()->identity->surnameAndName() . "</i>\n";
        $message .= $validated['content'] . "\n\n";

        $message .= "<a href='" . route('ticket.view', $ticket) . "'>Visualizza e rispondi alla richiesta</a>\n";

        $sendingTo = [$ticket->author,$ticket->assigner];
        foreach( $ticket->comments as $comment )
            $sendingTo[] = $comment->author;
        // But not sending to myself!
        $sendingTo = array_filter($sendingTo, function($identity) {
            return $identity && ($identity->id != Auth()->user()->identity->id);
        });

        MailerController::sendEmail(
            $sendingTo,
            'Nuovo commento al ticket #' . $ticket->id,
            $message
        );
        
        return redirect()->back()->with('notistack', ['success', 'Commento aggiunto']);
    }

    public function doAction(Ticket $ticket, string $action) {
        $this->authorize('view', $ticket);

        $ticket->instance->doAction($action);

        return redirect()->back();
    }

    
    public function list_getrows(int $perPage, int $page)
    {
        $this->authorize('viewAny', Ticket::class);

        $identity = Auth()->user()->identity;

        $rows = Ticket::whereHasMorph('author', [ get_class($identity) ], function ($query) use ($identity) { $query->where('id', $identity->id ); } )
            ->orWhereHasMorph('assigner', [ get_class($identity) ], function ($query) use ($identity) { $query->where('id', $identity->id ); } )
            ->orWhereIn('type', Ticket::getVisibleTypes() )
            ->with(['author'])->withCount('comments')
            ->orderBy('id', 'desc')->paginate( $perPage, ['*'], 'page', $page + 1 );

        return json_encode($rows);
    }
}
