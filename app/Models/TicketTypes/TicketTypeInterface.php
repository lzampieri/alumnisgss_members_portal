<?php

namespace App\Models\TicketTypes;

use App\Models\Identity;
use App\Models\Ticket;
use JsonSerializable;

interface TicketTypeInterface extends JsonSerializable {

    public static function commonName(): string;
    public static function selfCreatable(): bool;

    public static function canBeSeen(Identity $identity): bool;

    public static function fieldList(): array;

    public static function fromParams(Ticket $ticket, array $params): TicketTypeInterface;

    public function actionList(): array;
    public function doAction(string $action): void;

    public static function notifyOnCreation(): array;
};