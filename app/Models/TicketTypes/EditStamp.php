<?php

namespace App\Models\TicketTypes;

use App\Models\Person;
use App\Models\Stamp;
use App\Models\Ticket;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EditStamp implements TicketTypeInterface
{
    public Ticket $ticket;
    public Stamp $stamp;
    public Carbon $clockin;
    public Carbon $clockout;
    public string $oldclockin;
    public string $oldclockout;
    public string $motivation;

    public function jsonSerialize(): array
    {
        return [
            'subject' => "Richiesta di modifica timbratura del " . $this->stamp->date->format('d/m/Y'),
        ];
    }

    public function deSerialize(): void {}

    public static function commonName(): string
    {
        return 'Modifica timbratura';
    }

    public static function selfCreatable(): bool
    {
        return false;
    }

    public static function canBeSeen(Person $identity): bool
    {
        return $identity->hasPermissionTo('helpdesk-master') || Auth()->user()->can('edit', Stamp::class);
    }

    public function fieldList(): array
    {
        $clockin = $this->clockin->format('H:i');
        $clockout = $this->clockout->format('H:i');

        return [
            'date' => ['label' => 'Data', 'type' => 'fixed', 'currentValue' => $this->stamp->date->format('d/m/Y')],
            'type' => ['label' => 'Tipo', 'type' => 'fixed', 'currentValue' => $this->stamp->type->label],
            'clockin' => ['label' => 'Ingresso - precedentemente ' . $this->oldclockin, 'type' => 'time', 'currentValue' => $clockin],
            'clockout' => ['label' => 'Uscita - precedentemente ' . $this->oldclockout, 'type' => 'time', 'currentValue' => $clockout],
            'motivation' => ['label' => 'Motivazione', 'type' => 'longText', 'currentValue' => $this->motivation],
        ];
    }

    public static function fromParams(Ticket $ticket, array $params): TicketTypeInterface
    {
        $it = new EditStamp();
        $it->ticket = $ticket;
        $it->stamp = $ticket->reference;
        $it->clockin = Carbon::createFromFormat('H:i', $params['clockin']);
        $it->clockout = Carbon::createFromFormat('H:i', $params['clockout']);
        $it->oldclockin = $params['oldclockin'];
        $it->oldclockout = $params['oldclockout'];
        $it->motivation = $params['motivation'];
        return $it;
    }

    public static function fromRequest(Request $request): ?TicketTypeInterface
    {
        if ($request && $request->has('stampId')) {
            $it = new EditStamp();
            $it->stamp = Stamp::find($request->input('stampId'));
            if (!$it->stamp)
                return null;

            if (!Auth()->user()->can('edit', Stamp::class) && !$it->stamp->employee->is(Auth::user()))
                return null;

            if ($it->stamp->clockin) {
                $it->clockin = $it->stamp->clockin;
                $it->oldclockin = $it->clockin->format('H:i');
            } else {
                $it->clockin = Carbon::createFromFormat('H:i', '00:01');
                $it->oldclockin = "assente";
            }

            if ($it->stamp->clockout) {
                $it->clockout = $it->stamp->clockout;
                $it->oldclockout = $it->clockout->format('H:i');
            } else {
                $it->clockout = Carbon::createFromFormat('H:i', '23:59');
                $it->oldclockout = "assente";
            }

            $it->motivation = '';

            return $it;
        }
        return null;
    }

    public function validateInput(Request $request): array
    {
        $params = $request->validate([
            'clockin' => 'required|date_format:H:i',
            'clockout' => 'required|date_format:H:i|after:clockin',
            'motivation' => 'required|min:3'
        ]);

        $params['oldclockin'] = $this->oldclockin;
        $params['oldclockout'] = $this->oldclockout;

        return $params;
    }

    public function refObject(): ?object
    {
        return $this->stamp;
    }

    public function actionList(): array
    {
        $actions = [];
        if ($this->ticket->status == 'open') {
            if ($this->ticket->author()->is(Auth::user()))
                $actions['retire'] = 'Ritira richiesta';
            if (Auth()->user()->can('edit', Stamp::class)) {
                $actions['accept'] = 'Accetta variazione orari';
                $actions['refuse'] = 'Rifiuta variazione orari';
            }
        }

        return $actions;
    }

    public function doAction(string $action): ?string
    {
        if (($action == 'retire') && $this->ticket->author()->is(Auth::user())) {
            $this->ticket->status = 'retired';
            $this->ticket->save();
        }

        if (Auth()->user()->can('edit', Stamp::class)) {

            if ($action == 'accept') {
                $this->stamp->clockin = $this->clockin;
                $this->stamp->clockout = $this->clockout;
                $this->stamp->save();
                $this->ticket->status = 'accepted';
                $this->ticket->save();
                return "Accettato";
            }
            if ($action == 'refuse') {
                $this->ticket->status = 'refused';
                $this->ticket->save();
                return "Rifiutato";
            }
        }
        return null;
    }

    public static function notifyOnCreation(): iterable
    {
        return Person::allWithPermission('helpdesk-master');
    }
}
