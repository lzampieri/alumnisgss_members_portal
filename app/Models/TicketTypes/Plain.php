<?php

namespace App\Models\TicketTypes;

use App\Models\External;
use App\Models\Identity;
use App\Models\Permission;
use App\Models\Ticket;

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

    public static function canBeSeen(Identity $identity): bool
    {
        return $identity->hasPermissionTo('helpdesk-master');
    }

    public static function fieldList(): array
    {
        return [
            'subject' => ['label' => 'Oggetto', 'type' => 'shortText', 'validationRule' => 'required|min:3'],
            'content' => ['label' => 'Richiesta', 'type' => 'longText', 'validationRule' => 'required|min:3'],
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

    public function actionList(): array
    {
        if ($this->ticket->status == 'open')
            return [
                'solve' => 'Segna come risolto'
            ];
        return [];
    }

    public function doAction(string $action): void
    {
        if ($action == 'solve') {
            $this->ticket->status = 'solved';
            $this->ticket->save();
        }
    }
    
    public static function notifyOnCreation(): array {
        return Identity::allWithPermission('helpdesk-master');
    }
}
