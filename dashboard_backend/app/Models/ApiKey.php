<?php

namespace App\Models;

use App\Enums\ApiKeyStatus;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

#[Guarded(['id', 'key_hash', 'created_at', 'updated_at'])]
#[Hidden(['id', 'key_hash', 'created_at', 'updated_at'])]
class ApiKey extends Model
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected function casts(): array
    {
        return [
            'last_used_at' => 'datetime',
            'status' => ApiKeyStatus::class,
        ];
    }
}
