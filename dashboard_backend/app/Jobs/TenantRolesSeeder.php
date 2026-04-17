<?php

namespace App\Jobs;

use App\Models\Role;
use App\Models\Tenant;

class TenantRolesSeeder
{
    /** @var Tenant */
    protected $tenant;

    public function __construct(Tenant $tenant)
    {
        $this->tenant = $tenant;
    }

    public function handle(): void
    {
        tenancy()->initialize($this->tenant);
        $roles = [
            ['name' => 'owner', 'guard_name' => 'sanctum', 'label' => 'Owner', 'description' => 'Tenant owner'],
            ['name' => 'admin', 'guard_name' => 'sanctum', 'label' => 'Administrator', 'description' => 'Tenant administrator'],
            ['name' => 'member', 'guard_name' => 'sanctum', 'label' => 'Member', 'description' => 'Tenant member'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate($role);
        }
        tenancy()->end();
    }
}
