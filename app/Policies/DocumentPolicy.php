<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\DynamicPermission;
use Illuminate\Foundation\Auth\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\Auth;

class DocumentPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view a document.
     * Remember that, if the document is an attachment, the permission on the parent document will be checked
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @param  \App\Models\Document  $document
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(?User $user, Document $document)
    {
        if ($document->attached_to_id) return $this->view($user, $document->attached_to);
        return DynamicPermission::UserCanViewPermissable($document, $user ? $user->identity : null);
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(User $user)
    {
        return $user->hasPermissionTo('documents-upload');
    }

    /**
     * Determine whether the user can edit the document.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @param  \App\Models\Document  $document
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function edit(User $user, Document $document)
    {
        return $this->view($user, $document) && $user->hasPermissionTo('documents-edit');
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @param  \App\Models\Document  $document
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(User $user, Document $document)
    {
        return $this->view($user, $document) && $user->hasPermissionTo('documents-edit');
    }

    /**
     * Determine whether the user can restore the model.
     *
     * @param  \Illuminate\Support\Facades\Auth\User  $user
     * @param  \App\Models\Document  $document
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function restore(User $user, Document $document)
    {
        return $this->view($user, $document) && $user->hasPermissionTo('documents-edit');
    }
}
