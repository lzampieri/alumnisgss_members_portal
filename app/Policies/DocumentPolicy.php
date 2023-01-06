<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\Auth;

class DocumentPolicy
{
    use HandlesAuthorization;

    /**
     * Determine the list of visible privacies
     *
     * @return string[]
     */
    public static function visiblePrivacies()
    {
        $visiblePrivacies = [];
        foreach( Document::$privacies as $privacy ) {
            if( $privacy == 'everyone' ) {
                $visiblePrivacies[] = $privacy;
                continue;
            }
            if( Auth::check() ) {
                if( Auth::user()->hasPermissionTo( 'documents-view-' . $privacy ) ) {
                    $visiblePrivacies[] = $privacy;
                }
            }
        }

        return $visiblePrivacies;
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Document  $document
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(User $user, Document $document)
    {
        return $user->hasPermissionTo( 'documents-view-' . $document->privacy );
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(User $user)
    {
        return $user->hasPermissionTo( 'documents-upload' );
    }

    /**
     * Determine whether the user can edit the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Document  $document
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function edit(User $user)
    {
        return $user->hasPermissionTo( 'documents-edit' );
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Document  $document
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(User $user, Document $document)
    {
        return $user->hasPermissionTo( 'documents-edit' );
    }

    /**
     * Determine whether the user can restore the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Document  $document
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function restore(User $user, Document $document)
    {
        return $user->hasPermissionTo( 'documents-edit' );
    }
}
