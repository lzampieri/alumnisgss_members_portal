<?php

namespace App\Models;

use App\Traits\EditsAreLogged;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use SplFileObject;

class MailingList extends Model
{
    use EditsAreLogged;

    protected $fillable = [
        'name', 'count'
    ];
    
    protected $appends = ['canView','canEdit'];
    public function getCanViewAttribute()
    {
        return Auth::check() && Auth::user()->can('view', $this);
    }
    public function getCanEditAttribute()
    {
        return Auth::check() && Auth::user()->can('edit', $this);
    }

    public function getToAttribute()
    {
        return "Mailing list " . $this->name . " (" . $this->count . ")";
    }

    public function dynamicPermissions()
    {
        return $this->morphMany(DynamicPermission::class, 'permissable');
    }

    public function newsletters()
    {
        return $this->belongsToMany(Newsletter::class);
    }

    public function getFilename()
    {
        return "/app/mailinglists/" . $this->id . ".csv";
    }

    public function getAllTo()
    {
        $output = [];
        $filename = $this->getFilename();

        if( !file_exists(storage_path() . $filename) ) return [];
        
        foreach (new SplFileObject(storage_path() . $filename) as $line) {
            $addr = trim($line);
            if( strlen($addr) > 0 && filter_var($addr, FILTER_VALIDATE_EMAIL))
                $output[] = $addr;
        }

        return $output;
    }
}
