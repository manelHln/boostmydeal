<?php

namespace Database\Factories;

use App\Models\TenantInvitation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TenantInvitationFactory extends Factory
{
    protected $model = TenantInvitation::class;

    public function definition(): array
    {
        return [
            'email' => fake()->unique()->safeEmail(),
            'role' => fake()->randomElement(['Owner', 'Admin', 'Member']),
            'invited_by' => User::factory(),
            'token' => fake()->unique()->sha256(),
            'expires_at' => now()->addDays(7),
        ];
    }
}
