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

    public function path()
    {
        return storage_path() . '/app/files/' . $this->handle;
    }

    public function computeSha256()
    {
        return hash_file( 'sha256', $this->path() );
    }
    public function verifyHash()
    {
        return ( $this->sha256 == $this->computeSha256() );
    }
}
