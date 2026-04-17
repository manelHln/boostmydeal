<?php

namespace App\Models;

use App\Enums\CallDirection;
use App\Enums\CallStatus;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Guarded(['id', 'created_at', 'updated_at'])]
#[Hidden(['id', 'created_at', 'updated_at'])]
class Call extends Model
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected function casts(): array
    {
        return [
            'direction' => CallDirection::class,
            'status' => CallStatus::class,
        ];
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }

    public function phoneNumber(): BelongsTo
    {
        return $this->belongsTo(PhoneNumber::class);
    }

    public function transcripts(): HasMany
    {
        return $this->hasMany(CallTranscript::class);
    }

    public function recordings(): HasMany
    {
        return $this->hasMany(CallRecording::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(CallEvent::class);
    }

    public function scopeDateRange($query, $dateRange)
    {
        if (! $dateRange || ! is_array($dateRange)) {
            return $query;
        }

        if (isset($dateRange['from'])) {
            $query->where('created_at', '>=', $dateRange['from']);
        }

        if (isset($dateRange['to'])) {
            $query->where('created_at', '<=', $dateRange['to']);
        }

        return $query;
    }
}
