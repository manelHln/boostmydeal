<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

#[Guarded(['id', 'created_at', 'updated_at'])]
#[Hidden(['id', 'created_at', 'updated_at'])]
class Payment extends Model
{
    use BelongsToTenant, HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'paid_at' => 'datetime',
            'refunded_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function invoice(): ?BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function credit(): ?BelongsTo
    {
        return $this->belongsTo(Credit::class);
    }

    public function isPaid(): bool
    {
        return $this->status === PaymentStatus::COMPLETED->value;
    }

    public function isFailed(): bool
    {
        return $this->status === PaymentStatus::FAILED->value;
    }

    public function isPending(): bool
    {
        return $this->status === PaymentStatus::PENDING->value ||
               $this->status === PaymentStatus::PROCESSING->value;
    }

    public function getAmountInDollars(): float
    {
        return $this->amount / 100;
    }
}
