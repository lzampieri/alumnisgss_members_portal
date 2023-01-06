<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // create permissions

        // Users
        Permission::create(['name' => 'login']);
        Permission::create(['name' => 'user-view']);
        Permission::create(['name' => 'user-enabling']);
        
        // Assign roles
        Permission::create(['name' => 'user-edit-secretariat']);
        Permission::create(['name' => 'user-edit-webmaster']);

        // Edit permissions
        Permission::create(['name' => 'permissions-view']);
        Permission::create(['name' => 'permissions-edit']);
        
        // Log
        Permission::create(['name' => 'log-manage']);

        // Registry
        Permission::create(['name' => 'alumnus-view']);
        Permission::create(['name' => 'alumnus-edit']);
        Permission::create(['name' => 'alumnus-bulk']);


        // create roles
        Role::create(['name' => 'secretariat'])
            ->givePermissionTo([ 'user-view', 'user-enabling', 'user-edit-secretariat', 'alumnus-view', 'alumnus-edit']);

        Role::create(['name' => 'webmaster'])
            ->givePermissionTo(Permission::all());
    }
}
