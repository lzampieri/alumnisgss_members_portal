<?php

namespace App\Models\TicketTypes;

use App\Models\Identity;
use App\Models\Permission;
use App\Models\Ticket;
use Illuminate\Http\Request;

class Error implements TicketTypeInterface
{
    public string $content;
    private Ticket $ticket;

    public function jsonSerialize(): array
    {
        return [
            'subject' => 'Errore',
            'content' => $this->content
        ];
    }

    public static function commonName(): string
    {
        return 'Errore';
    }

    public static function selfCreatable(): bool
    {
        return false;
    }

    public static function canBeSeen(Identity $identity): bool
    {
        return $identity->hasPermissionTo('helpdesk-master');
    }

    public function fieldList(): array
    {
        return [];
    }

    public static function fromParams(Ticket $ticket, array $params): TicketTypeInterface
    {
        $it = new Error();
        $it->content = json_encode($params);
        $it->ticket = $ticket;
        return $it;
    }

    public static function fromRequest(Request $request): ?TicketTypeInterface
    {
        return null;
    }

    public function validateInput(Request $request): array
    {
        return [];
    }

    public function refObject(): ?object
    {
        return null;
    }

    public function actionList(): array
    {
        if (Auth()->user()->hasPermissionTo('helpdesk-master')) {
            if ($this->ticket->status == 'open')
                return [
                    'solve' => 'Segna come risolto'
                ];
        }
        return [];
    }

    public function doAction(string $action): ?string
    {
        if (Auth()->user()->hasPermissionTo('helpdesk-master') && ($action == 'solve')) {
            $this->ticket->status = 'solved';
            $this->ticket->save();
        }
        return null;
    }

    public static function notifyOnCreation(): array
    {
        return Identity::allWithPermission('helpdesk-master');
    }
}
