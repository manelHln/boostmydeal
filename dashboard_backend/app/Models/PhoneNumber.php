<?php

namespace App\Models;

use App\Enums\PhoneNumberProvider;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Guarded(['id', 'created_at', 'updated_at'])]
#[Hidden(['id', 'created_at', 'updated_at', 'provider_config'])]
class PhoneNumber extends Model
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected function casts(): array
    {
        return [
            'provider_config' => 'encrypted:array',
            'provider' => PhoneNumberProvider::class,
        ];
    }

    public function agents(): BelongsToMany
    {
        return $this->belongsToMany(Agent::class, 'phone_numbers_agents');
    }

    public function calls(): HasMany
    {
        return $this->hasMany(Call::class);
    }
}
