<?php

namespace App\Models;

use App\Http\Controllers\LogControllerFile;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\LogEvents;
use App\Traits\EditsAreLogged;
use Spatie\Permission\Models\Role;

class Alumnus extends Identity
{
    use EditsAreLogged;
    
    // Available status
    const status = [
        'member',
        'student_member',
        'pre_enrolled',
        'not_reached', 'student_not_reached', 'student_not_agreed', 'hasnt_right',
        'dead',
        'not_agreed'
    ];
    // Public visible status
    const public_status = ['member', 'student_member'];

    // Status for which entering or exiting required ratification
    const require_ratification = ['member', 'student_member'];

    // Assignable status
    public static function availableStatus(Alumnus $alumnus = null)
    {
        // THE PERMISSION bypassRatification HAS BEEN REMOVED
        // if (Auth::user()->can('bypassRatification', Alumnus::class))
        //     $availableStatus = Alumnus::status;
        // else
        //     $availableStatus = array_diff(Alumnus::status, Alumnus::require_ratification);
        // if ($alumnus && $alumnus->id && !in_array($alumnus->status, $availableStatus))
        //     $availableStatus[] = $alumnus->status;
        // return array_values($availableStatus);

        // If the alumnus already exists, and it is stucked in a state that requires ratification, it remains there:
        if ($alumnus && $alumnus->id && in_array($alumnus->status, Alumnus::require_ratification) )
            return [ $alumnus->status ]; // If the alumnus is stucked in a state that requires ratification, it remains there

        // Else, return all applicable status
        return array_diff(Alumnus::status, Alumnus::require_ratification);
    }
    // All used tags
    public static function allTags()
    {
        $all_tags = array_filter(Alumnus::all('tags')->pluck('tags')->toArray());
        if (count($all_tags) == 0) return [];
        return array_unique(array_merge(...$all_tags));
    }
    // Labels
    const AlumnusStatusLabels = [
        'member' => 'Socio',
        'student_member' => 'Socio studente',
        'pre_enrolled' => 'Preiscritto',
        'not_reached' => 'Non raggiunto',
        'student_not_reached' => 'Studente non raggiunto',
        'student_not_agreed' => 'Studente rifiutante',
        'hasnt_right' => 'Non avente diritto',
        'dead' => 'Deceduto',
        'not_agreed' => 'Rifiutante'
    ];
    // Colors ( for export xlsx )
    const AlumnusStatusColors = [
        'member' => '00CC00',
        'student_member' => '00FF99',
        'pre_enrolled' => '00FFFF',
        'not_reached' => 'FFFF00',
        'student_not_reached' => 'FF9900',
        'student_not_agreed' => 'FF0000',
        'hasnt_right' => 'FF00FF',
        'dead' => '003300',
        'not_agreed' => 'FF0000',
    ];


    protected $fillable = [
        'name',
        'surname',
        'coorte',
        'status',
        'tags'
    ];
    protected $casts = [
        'tags' => 'array',
    ];

    public function hasPermissionTo($permission, $guardName = null): bool
    {
        return parent::hasPermissionTo($permission) || $this->checkMemberRole($permission);
    }

    public function checkMemberRole($permission)
    {
        if ($this->status == 'member' && Role::findByName('member')->hasPermissionTo($permission)) return true;
        if ($this->status == 'student_member' && Role::findByName('student_member')->hasPermissionTo($permission)) return true;
        return false;
    }

    public function getAllRoles()
    {
        $roles = parent::getAllRoles();
        if ($this->status == 'member') $roles->push(Role::findByName('member'));
        if ($this->status == 'student_member') $roles->push(Role::findByName('student_member'));
        return $roles;
    }

    public function ratifications()
    {
        return $this->hasMany(Ratification::class);
    }

    // For the ratification export
    public static function romanize($num)
    {
        if ($num == 0)
            return "Socio onorario";
        $digits = str_split(str_pad(strval($num), 3, '0', STR_PAD_LEFT));
        $roman = "";
        $key = [
            "", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
            "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
            "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"
        ];

        $i = count($digits);
        while ($i--)
            $roman = $key[intval($digits[$i]) + $i * 10] . $roman;

        return $roman . " coorte";
    }

    public function getPendingRatificationsAttribute()
    {
        return $this->ratifications()->whereNull('document_id')->count();
    }

}
