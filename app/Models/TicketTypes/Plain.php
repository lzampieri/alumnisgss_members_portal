<?php

namespace App\Models\TicketTypes;

use App\Models\Person;
use App\Models\Ticket;
use Illuminate\Http\Request;

class Plain implements TicketTypeInterface
{
    public string $subject;
    public string $content;
    private Ticket $ticket;

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
        return 'Richiesta semplice';
    }

    public static function selfCreatable(): bool
    {
        return true;
    }

    public static function canBeSeen(Person $identity): bool
    {
        return $identity->hasPermissionTo('helpdesk-master') || $identity->hasPermissionTo('helpdesk-solve-plain');
    }

    public function fieldList(): array
    {
        return [
            'subject' => ['label' => 'Oggetto', 'type' => 'shortText', 'currentValue' => $this->subject],
            'content' => ['label' => 'Richiesta', 'type' => 'longText', 'currentValue' => $this->content],
        ];
    }

    public static function fromParams(Ticket $ticket, array $params): TicketTypeInterface
    {
        $it = new Plain();
        $it->subject = $params['subject'];
        $it->content = $params['content'];
        $it->ticket = $ticket;
        return $it;
    }

    public static function fromRequest(Request $request): ?TicketTypeInterface
    {
        $it = new Plain();
        $it->subject = "";
        $it->content = "";
        return $it;
    }

    public function validateInput(Request $request): array
    {
        return $request->validate([
            'subject' => 'required|min:3',
            'content' => 'required|min:3',
        ]);
    }

    public function refObject(): ?object
    {
        return null;
    }

    public function actionList(): array
    {
        if (Auth()->user()->hasPermissionTo('helpdesk-solve-plain')) {
            if ($this->ticket->status == 'open')
                return [
                    'solve' => 'Segna come risolto'
                ];
        }
        return [];
    }

    public function doAction(string $action): ?string
    {
        if (Auth()->user()->hasPermissionTo('helpdesk-solve-plain') && ($action == 'solve')) {
            $this->ticket->status = 'solved';
            $this->ticket->save();
        }
        return null;
    }

    public static function notifyOnCreation(): array
    {
        return Person::allWithPermission('helpdesk-master');
    }
}
