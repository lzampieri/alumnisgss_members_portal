<?php

namespace App\Models;

use App\Models\TicketTypes\Error as TicketTypesError;
use App\Traits\EditsAreLogged;
use App\Traits\SoftEditsAreLogged;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\TicketTypes\TicketTypeInterface;
use Carbon\Carbon;
use Error;
use Illuminate\Support\Facades\Auth;

class Ticket extends Model
{
    use SoftDeletes;
    use EditsAreLogged, SoftEditsAreLogged;

    protected $fillable = [
        'type',
        'params',
        'status'
    ];

    protected $casts = [
        'params' => 'json'
    ];

    protected $appends = ['instance'];

    public static function getAllTypes()
    {
        return collect(glob(app_path('Models/TicketTypes') . '/*.php'))
            ->map(function ($item) {
                return  basename($item, '.php');
            })
            ->filter(function ($item) {
                return in_array(TicketTypeInterface::class, class_implements(Ticket::fullName($item)));
            });
    }

    public static function getVisibleTypes()
    {
        return Ticket::getAllTypes()->filter(
            function ($type) { return Auth()->check() && call_user_func( Ticket::fullName( $type ) . "::canBeSeen", Auth()->user()->identity ); }
        );
    }

    public static function fullName($basename)
    {
        return 'App\\Models\\TicketTypes\\' . $basename;
    }

    public static function parseField($type, $value)
    {
        if (($type == 'shortText') || ($type == 'longText')) return $value;
        if ($type == 'date') return Carbon::parse($value)->format('d/m/Y');
    }

    public function author()
    {
        return $this->morphTo('author');
    }
    public function assigner()
    {
        return $this->morphTo('assigner');
    }
    public function reference()
    {
        return $this->morphTo('reference');
    }

    public function getInstanceAttribute()
    {
        if( $this->getAllTypes()->contains($this->type) )
            return call_user_func( Ticket::fullName( $this->type ) . "::fromParams", $this, $this->params );
        return TicketTypesError::fromParams($this,$this->params);
    }

    public function comments()
    {
        return $this->hasMany(TicketComment::class)->orderBy('created_at', 'asc');
    }
    
    public function logify()
    {
        return "Ticket #{$this->id} of {$this->author->name} type {$this->type}";
    }
}
