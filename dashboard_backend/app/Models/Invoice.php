<?php

namespace App\Models;

use App\Enums\InvoiceStatus;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

#[Guarded(['id', 'created_at', 'updated_at'])]
#[Hidden(['id', 'created_at', 'updated_at'])]
class Invoice extends Model
{
    use BelongsToTenant, HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'credits_purchased' => 'integer',
            'billing_period_start' => 'date',
            'billing_period_end' => 'date',
            'line_items' => 'array',
            'sent_at' => 'datetime',
            'paid_at' => 'datetime',
            'failed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class)->orderBy('created_at', 'desc');
    }

    public function credit(): ?BelongsTo
    {
        return $this->belongsTo(Credit::class);
    }

    public function isPaid(): bool
    {
        return $this->status === InvoiceStatus::PAID->value;
    }

    public function isPending(): bool
    {
        return $this->status === InvoiceStatus::PENDING->value;
    }

    public function getAmountInDollars(): float
    {
        return $this->amount / 100;
    }

    public function getPeriod(): string
    {
        return $this->billing_period_start->format('M Y').' - '.$this->billing_period_end->format('M Y');
    }
}
