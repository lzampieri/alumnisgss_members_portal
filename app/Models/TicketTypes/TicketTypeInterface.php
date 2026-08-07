<?php

namespace App\Models\TicketTypes;

use App\Models\Identity;
use App\Models\Ticket;
use Illuminate\Http\Request;
use JsonSerializable;

interface TicketTypeInterface extends JsonSerializable {

    public static function commonName(): string;
    public static function selfCreatable(): bool;

    public static function canBeSeen(Identity $identity): bool;

    public function fieldList(): array;

    public static function fromParams(Ticket $ticket, array $params): TicketTypeInterface;
    public static function fromRequest(Request $request): ?TicketTypeInterface;

    public function validateInput(Request $request): array;
    public function refObject(): ?object;

    public function actionList(): array;
    public function doAction(string $action): ?string;

    public static function notifyOnCreation(): array;
};