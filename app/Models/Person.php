<?php
namespace App\Models;

use App\Http\Controllers\LogController;
use App\Http\Controllers\LogEvents;
use App\Policies\PersonPolicy;
use App\Traits\EditsAreLogged;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\User;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Traits\HasRoles;

use Illuminate\Database\Eloquent\Casts\Attribute;

class Person extends User
{
    use EditsAreLogged;

    use HasRoles {
        hasPermissionTo as protected traitHasPermissionTo;
        givePermissionTo as protected traitGivePermissionTo;
        revokePermissionTo as protected traitRevokePermissionTo;
        assignRole as protected traitAssignRole;
        removeRole as protected traitRemoveRole;
    }

    const COORTE_EXTERNAL = -1;
    const COORTE_HONORARY = 0;


    protected $guard_name = 'web';


    // Utilities functions for attributes access
    protected $appends = ['enabled'];
    protected $visible = [
        'id',
        'surname',
        'name',
        'notes',
        'coorte',
        'status',
        'tags',
        'consent_to_network_share',
        'consent_to_email_share',
        'enabled',
        'created_at',
        'updated_at'
    ];
    protected $fillable = [
        'name',
        'surname',
        'notes',
        'coorte',
        'status',
        'tags',
        'consent_to_email_share',
        'consent_to_network_share'
    ];
    protected $casts = [
        'tags' => 'array'
    ];
    protected function enabled(): Attribute
    {
        return Attribute::make(get: fn(mixed $_, array $attributes) =>  $this->hasPermissionTo('login'));
    }
    protected function allRoles(): Attribute
    {
        return Attribute::make(get: fn(mixed $_, array $attributes) =>  $this->getAllRoles());
    }
    protected function canView(): Attribute // If the logged in user can view this person
    {
        return Attribute::make(get: fn(mixed $_, array $attributes) => Auth::check() && (new PersonPolicy)->view(Auth::user(), $this));
    }

    protected function isAlumnus(): Attribute
    {
        return Attribute::make(get: fn(mixed $_, array $attributes) => $attributes['coorte'] > 0);
    }
    protected function pendingRatificationsCount(): Attribute
    {
        return Attribute::make(get: fn(mixed $_, array $attributes) => $this->pendingRatifications()->count());
    }
    public function surnameAndName()
    {
        return $this->surname . " " . $this->name;
    }

    public function nameAndSurname()
    {
        return $this->name . " " . $this->surname;
    }

    public function lev2_loggedin() {
        foreach ($this->emails as $email) {
            if( $email->lev2_loggedin_thisaddress() ) return true;
        }
        return false;
    }

    // List of roles this person can edit
    public function editableRoles()
    {
        if (!Auth::check()) return [];
        $editableRoles = array_values(Role::all()->append('can_edit')->filter->can_edit->toArray());
        return $editableRoles;
    }

    // Relations
    public function emails()
    {
        return $this->hasMany(Email::class, 'identity_id')->orderBy('primary', 'desc');
    }
    public function newsletters()
    {
        return $this->hasMany(Newsletter::class, 'owner_id');
    }
    public function positions()
    {
        return $this->hasMany(Position::class, 'owner_id');
    }
    public function validPositions()
    {
        return $this->hasMany(Position::class, 'owner_id')->whereDate('from', '<=', Carbon::now())->whereDate('to', '>=', Carbon::now());
    }
    public function documents()
    {
        return $this->hasMany(Document::class, 'author_id');
    }
    public function stamps()
    {
        return $this->hasMany(Stamp::class, 'employee_id');
    }
    public function authoredTickets()
    {
        return $this->hasMany(Ticket::class, 'author_id');
    }
    public function aDetails()
    {
        return $this->hasMany(ADetail::class, 'identity_id');
    }
    public function getADetailsKeydAttribute()
    {
        return $this->getRelationValue('aDetails')->keyBy('a_details_type_id');
    }
    public function ratifications()
    {
        return $this->hasMany(Ratification::class, 'alumnus_id');
    }
    public function pendingRatifications()
    {
        return $this->hasMany(Ratification::class, 'alumnus_id')->whereNull('document_id');
    }

    // ----------- COLLECTIVE FUNCTIONS ----------- //
    public static function allTags()
    {
        $all_tags = array_filter(Person::all('tags')->pluck('tags')->toArray());
        if (count($all_tags) == 0) return [];
        return array_unique(array_merge(...$all_tags));
    }

    // ----------- ROLES MANAGEMENT ----------- //
    public function getAllRoles()
    {
        $roles = $this->roles;
        $already_there = $roles->map(function ($r) {
            return $r['name'];
        })->toArray();

        // Everyone
        if (!in_array('everyone', $already_there))
            $roles->push(Role::findByName('everyone'));

        // Position
        foreach ($this->validPositions as $pos) {
            if (!in_array($pos->type, $already_there))
                $roles->push(Role::findByName($pos->type));
        }

        // Status
        if ($this->is_alumnus && !in_array($this->status, $already_there)) {
            $role = Role::findByNameOrNull($this->status);
            if ($role)
                $roles->push($role);
        }
        return $roles;
    }

    public static function allWithPermission(string $permissionName)
    {
        return Person::permission($permissionName)->get();
    }

    // ----------- PERMISSIONS MANAGEMENT ----------- //

    // hasPermissionTo is overrided to include extra roles, i.e. 'everyone' and 'position' case
    public function hasPermissionTo($permission, $guardName = null): bool
    {
        // Direct permissions
        if ($this->traitHasPermissionTo($permission))
            return true;
        // Roles-based and status-based permissions
        foreach ($this->getAllRoles() as $role)
            if ($role->hasPermissionTo($permission))
                return true;
        return false;
    }

    // ----------- LOGGING MANAGEMENT ----------- //
    // Some of the trait method are overrided for logging purpose
    public function givePermissionTo(...$permissions)
    {
        foreach ($permissions as $permission) {
            LogController::log(LogEvents::PERMISSION_GIVEN, $this, 'permission', null, $permission);
            $this->traitGivePermissionTo($permission);
        }
    }
    public function revokePermissionTo(...$permissions)
    {
        foreach ($permissions as $permission) {
            LogController::log(LogEvents::PERMISSION_REVOKEN, $this, 'permission', $permission);
            $this->traitRevokePermissionTo($permission);
        }
    }
    public function assignRole(...$roles)
    {
        foreach ($roles as $role) {
            LogController::log(LogEvents::ROLE_GIVEN, $this, 'role', null, $role);
            $this->traitAssignRole($role);
        }
    }
    public function removeRole(...$roles)
    {
        foreach ($roles as $role) {
            LogController::log(LogEvents::ROLE_REVOKEN, $this, 'role', $role);
            $this->traitRemoveRole($role);
        }
    }
}
