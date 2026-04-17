<?php

namespace App\Jobs;

use App\Models\CentralUser;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CreateFirstUser
{
    /** @var Tenant */
    protected $tenant;

    public function __construct(Tenant $tenant)
    {
        $this->tenant = $tenant;
    }

    public function handle(): void
    {
        DB::transaction(function () {
            Log::debug('RAW tenant', [
                'id'         => $this->tenant->id,
                'attributes' => $this->tenant->getAttributes(),
                'first_user' => $this->tenant->first_user,
            ]);
            $userData = $this->tenant->first_user;

            if (! $userData) {
                return;
            }

            // tenancy()->initialize($this->tenant);

            // $tenant_user = User::create([
            //     'first_name' => $userData['first_name'],
            //     'last_name' => $userData['last_name'],
            //     'email' => $userData['email'],
            //     'password' => $userData['password'],
            // ])->assignRole('owner');

            // tenancy()->end();
            $centralUser = CentralUser::create([
                'global_id'  => (string) \Str::uuid7(),
                'email'      => $userData['email'],
                'first_name' => $userData['first_name'],
                'last_name'  => $userData['last_name'],
            ]);

            // 2. Attach to tenant (THIS triggers sync)
            $centralUser->tenants()->attach($this->tenant->id);
        });
    }
}
