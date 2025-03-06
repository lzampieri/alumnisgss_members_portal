<?php

namespace App\Policies;

use App\Models\LoginMethod;
use App\Models\Stamp;
use Illuminate\Auth\Access\HandlesAuthorization;

class StampPolicy // TODO this should be managed
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     *
     * @param  \App\Models\LoginMethod  $loginMethod
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(LoginMethod $loginMethod)
    {
        //
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param  \App\Models\LoginMethod  $loginMethod
     * @param  \App\Models\Stamp  $stamp
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(LoginMethod $loginMethod, Stamp $stamp)
    {
        //
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  \App\Models\LoginMethod  $loginMethod
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(LoginMethod $loginMethod)
    {
        //
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  \App\Models\LoginMethod  $loginMethod
     * @param  \App\Models\Stamp  $stamp
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function update(LoginMethod $loginMethod, Stamp $stamp)
    {
        //
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  \App\Models\LoginMethod  $loginMethod
     * @param  \App\Models\Stamp  $stamp
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(LoginMethod $loginMethod, Stamp $stamp)
    {
        //
    }

    /**
     * Determine whether the user can restore the model.
     *
     * @param  \App\Models\LoginMethod  $loginMethod
     * @param  \App\Models\Stamp  $stamp
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function restore(LoginMethod $loginMethod, Stamp $stamp)
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the model.
     *
     * @param  \App\Models\LoginMethod  $loginMethod
     * @param  \App\Models\Stamp  $stamp
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function forceDelete(LoginMethod $loginMethod, Stamp $stamp)
    {
        //
    }
}
