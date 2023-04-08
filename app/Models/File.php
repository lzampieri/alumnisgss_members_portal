<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    const ALLOWED_FORMATS = [
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', 'txt', 'rtf'
    ];

    protected $fillable = [
        'handle',
        'parent_type',
        'parent_id'
    ];

    
    public function parent()
    {
        return $this->morphTo();
    }
}
