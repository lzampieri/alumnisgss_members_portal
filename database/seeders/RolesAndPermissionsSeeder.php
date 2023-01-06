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
        
        // Edit permissions
        Permission::create(['name' => 'permissions-view']);
        Permission::create(['name' => 'permissions-edit']);

        // create roles
        Role::create(['name' => 'secretariat']);

        Role::create(['name' => 'webmaster'])
            ->givePermissionTo(Permission::all());
    }
}
