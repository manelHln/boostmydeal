<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Cashier\SubscriptionItem as CashierSubscriptionItem;

#[Guarded(['id', 'stripe_id', 'created_at', 'updated_at'])]
#[Hidden(['id', 'created_at', 'updated_at'])]
class SubscriptionItem extends CashierSubscriptionItem
{
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }
}
