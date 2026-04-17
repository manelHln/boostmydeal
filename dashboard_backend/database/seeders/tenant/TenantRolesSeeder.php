<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class TenantRolesSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'Owner', 'guard_name' => 'sanctum'],
            ['name' => 'Admin', 'guard_name' => 'sanctum'],
            ['name' => 'Member', 'guard_name' => 'sanctum'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate($role);
        }
    }
}
