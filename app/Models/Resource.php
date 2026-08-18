<?php

namespace App\Models;

use App\Traits\EditsAreLogged;
use App\Traits\SoftEditsAreLogged;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Resource extends Model
{
    use \Staudenmeir\LaravelAdjacencyList\Eloquent\HasRecursiveRelationships;

    use SoftDeletes;
    use EditsAreLogged, SoftEditsAreLogged;

    protected $fillable = [
        'title',
        'content',
        'type',
        'archive'
    ];
    protected $hidden = [
        'access_token'
    ];

    public function dynamicPermissions()
    {
        return $this->morphMany(DynamicPermission::class, 'permissable');
    }

    public function files()
    {
        return $this->morphMany(File::class, 'parent');
    }

    public function getCanViewAttribute()
    {
        $token = request()->get('tk');
        if ($token) {
            $res = $this;
            while ($res) {
                if ($res->access_token == $token) return true;
                $res = $res->parent;
            }
        }

        return DynamicPermission::PersonCanViewPermissable($this) || DynamicPermission::PersonCanEditPermissable($this);
    }
    public function getCanEditAttribute()
    {
        return DynamicPermission::PersonCanEditPermissable($this);
    }

    public function permalinks()
    {
        return $this->morphMany(Permalink::class, 'linkable');
    }

    public function childrenCount()
    {
        return $this->children()->count();
    }

    public function isChildOfArchived()
    {
        return $this->ancestors()->where('archived', true)->exists();
    }

    public function getIsChildOfArchivedAttribute()
    {
        return $this->isChildOfArchived();
    }

    public function getVisibleChildrenAttribute()
    {
        if ($this->archived || $this->isChildOfArchived()) {
            // It is already child of an archived resource, and therefore archive navigation is active: should show also archived resources
            $children = $this->children();
        } else {
            // Outside of archive, non archived resources should be hidden
            $children = $this->children()->where('archived', false);
        }

        return $children->with(['permalinks'])->withCount(['children'])->get()->filter->canView->map->only(['id', 'title', 'archived', 'permalinks', 'children_count'])->values();
    }
    public function getVisibleAncestorsAttribute()
    {
        return $this->ancestors()->with(['permalinks'])->withCount(['children'])->get()->filter->canView->map->only(['id', 'title', 'archived', 'permalinks', 'children_count'])->values();
    }
    public function getPluckedParentAttribute()
    {
        $parent = $this->parent()->with(['permalinks'])->withCount(['children'])->first();
        if (!$parent || !$parent->canView) return null;
        return $parent->only(['id', 'title', 'archived', 'permalinks', 'children_count']);
    }


    public function logify()
    {
        return "Resource " . $this->title . ": " . json_encode($this->content);
    }
}
