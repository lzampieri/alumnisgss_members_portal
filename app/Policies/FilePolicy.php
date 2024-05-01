<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\File;
use App\Models\Resource;
use Illuminate\Foundation\Auth\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class FilePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the model.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @param  \App\Models\Resource  $resource
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(?User $user, File $file)
    {
        $parent_type = $file->parent_type;

        // Resource
        if ($parent_type == Resource::class) {
            $resource = $file->parent;
            /** @var Resource $resource */

            // Assert that the resource can be seen
            if (!(new ResourcePolicy)->view($user, $resource))
                return false;

            // Assert that the file is actually present in the resource
            $resource_blocks = json_decode($resource->content, true);

            foreach ($resource_blocks as $block) {
                if ($block['type'] == 'file') {
                    if ($block['fileHandle'] == $file->handle)
                        return true;
                }
            }
        }

        // Document
        if ($parent_type == Document::class) {
            return false;
            // Document cannot be seen from here, but must be seen from the document app
            // which will add the footer and everything else
        }

        return false;
    }
}
