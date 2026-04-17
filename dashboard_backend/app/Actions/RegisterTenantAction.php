<?php

namespace App\Actions;

use App\Data\Api\V1\RegisterTenantData;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;

class RegisterTenantAction
{
    public function execute(RegisterTenantData $data): Tenant
    {
        // return DB::transaction(function () use ($data) {
        $tenant = Tenant::create([
            'name' => $data->name,
            'slug' => $data->slug,
            'status' => 'active',
            'website' => $data->website,
            'phone' => $data->phone,
            'first_user' => [
                'first_name' => $data->first_name,
                'last_name' => $data->last_name,
                'email' => $data->email,
            ],
        ]);

        return $tenant;
        // });
    }
}
