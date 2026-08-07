<?php

namespace App\Models\TicketTypes;

use App\Models\Alumnus;
use App\Models\Identity;
use App\Models\Stamp;
use App\Models\Ticket;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;

class ProfileEdit implements TicketTypeInterface
{
    public Ticket $ticket;
    public string $subject;
    public string $content;

    public function jsonSerialize(): array
    {
        return [
            'subject' => $this->subject,
            'content' => $this->content
        ];
    }

    public function deSerialize(): void {}

    public static function commonName(): string
    {
        return 'Modifica dati del profilo';
    }

    public static function selfCreatable(): bool
    {
        return true;
    }

    public static function canBeSeen(Identity $identity): bool
    {
        return $identity->hasPermissionTo('helpdesk-master') || Auth()->user()->can('edit', Alumnus::class);
    }

    public function fieldList(): array
    {
        return [
            'subject' => ['label' => 'Oggetto', 'type' => 'fixed', 'currentValue' => $this->subject],
            'content' => ['label' => 'Richiesta', 'type' => 'longText', 'currentValue' => $this->content],
        ];
    }

    public static function fromParams(Ticket $ticket, array $params): TicketTypeInterface
    {
        $it = new ProfileEdit();
        $it->subject = $params['subject'];
        $it->content = $params['content'];
        $it->ticket = $ticket;
        return $it;
    }

    public static function fromRequest(Request $request): ?TicketTypeInterface
    {
        $it = new ProfileEdit();
        $it->subject = "Richiesta di modifica profilo per " . Auth()->user()->identity->nameAndSurname();
        $it->content = "";
        return $it;
    }

    public function validateInput(Request $request): array
    {
        $params = $request->validate([
            'subject' => 'required|min:3',
            'content' => 'required|min:3',
        ]);

        return $params;
    }

    public function refObject(): ?object
    {
        return null;
    }

    public function actionList(): array
    {
        $actions = [];
        if ($this->ticket->status == 'open') {
            if ($this->ticket->author()->is(Auth()->user()->identity))
                $actions['retire'] = 'Ritira richiesta';
            if (Auth()->user()->can('edit', Alumnus::class)) {
                $actions['set_accepted'] = 'Segna come risolto';
                $actions['set_refused'] = 'Segna come rifiutato';
            }
        }

        return $actions;
    }

    public function doAction(string $action): ?string
    {
        if (($action == 'retire') && $this->ticket->author()->is(Auth()->user()->identity)) {
            $this->ticket->status = 'retired';
            $this->ticket->save();
        }

        if (Auth()->user()->can('edit', Stamp::class)) {

            if ($action == 'set_accepted') {
                $this->ticket->status = 'accepted';
                $this->ticket->save();
            }
            if ($action == 'set_refused') {
                $this->ticket->status = 'refused';
                $this->ticket->save();
            }
        }
        return null;
    }

    public static function notifyOnCreation(): array
    {
        return Identity::allWithPermission('helpdesk-master');
    }
}
