<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

#[Guarded(['id', 'created_at', 'updated_at'])]
#[Hidden(['id', 'created_at', 'updated_at'])]
class Credit extends Model
{
    use BelongsToTenant, HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected function casts(): array
    {
        return [
            'balance' => 'integer',
            'total_purchased' => 'integer',
            'total_used' => 'integer',
            'last_reset_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function availableCredits(): int
    {
        return $this->balance;
    }

    public function hasSufficientCredits(int $required): bool
    {
        return $this->balance >= $required;
    }

    public function deductCredits(int $amount): bool
    {
        if (! $this->hasSufficientCredits($amount)) {
            return false;
        }

        $this->balance -= $amount;
        $this->total_used += $amount;
        $this->save();

        return true;
    }

    public function addCredits(int $amount): void
    {
        $this->balance += $amount;
        $this->total_purchased += $amount;
        $this->save();
    }
}
