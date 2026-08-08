<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\DynamicPermission;
use App\Models\Person;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\Auth;

class DocumentPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the person can view a document.
     * Remember that, if the document is an attachment, the permission on the parent document will be checked
     *
     * @param  \App\Models\Person  $user
     * @param  \App\Models\Document  $document
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(?Person $user, Document $document)
    {
        if ($document->attached_to_id) return $this->view($user, $document->attached_to);
        return DynamicPermission::PersonCanViewPermissable($document, $user ? $user->identity : null);
    }

    /**
     * Determine whether the person can create models.
     *
     * @param  \Illuminate\Support\Facades\Auth\Person  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(Person $user)
    {
        return $user->hasPermissionTo('documents-upload');
    }

    /**
     * Determine whether the person can edit the document.
     *
     * @param  \Illuminate\Support\Facades\Auth\Person  $user
     * @param  \App\Models\Document  $document
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function edit(Person $user, Document $document)
    {
        return $this->view($user, $document) && $user->hasPermissionTo('documents-edit');
    }

    /**
     * Determine whether the person can delete the model.
     *
     * @param  \Illuminate\Support\Facades\Auth\Person  $user
     * @param  \App\Models\Document  $document
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(Person $user, Document $document)
    {
        return $this->view($user, $document) && $user->hasPermissionTo('documents-edit');
    }

    /**
     * Determine whether the person can restore the model.
     *
     * @param  \Illuminate\Support\Facades\Auth\Person  $user
     * @param  \App\Models\Document  $document
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function restore(Person $user, Document $document)
    {
        return $this->view($user, $document) && $user->hasPermissionTo('documents-edit');
    }
}
