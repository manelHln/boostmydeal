<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

#[Guarded(['id', 'created_at', 'updated_at'])]
#[Hidden(['id', 'created_at', 'updated_at'])]
class Onboarding extends Model
{
    use BelongsToTenant, HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected function casts(): array
    {
        return [
            'current_step' => 'integer',
            'completed' => 'boolean',
            'skipped' => 'boolean',
            'step_1_data' => 'array',
            'step_2_data' => 'array',
            'step_3_data' => 'array',
            'step_4_data' => 'array',
            'step_5_data' => 'array',
            'completed_at' => 'datetime',
            'last_activity_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isCompleted(): bool
    {
        return $this->completed === true;
    }

    public function isSkipped(): bool
    {
        return $this->skipped === true;
    }

    public function markStepComplete(int $step, array $data): void
    {
        $this->{"step_{$step}_data"} = $data;
        $this->current_step = $step + 1;
        $this->last_activity_at = now();
        $this->save();
    }

    public function markCompleted(): void
    {
        $this->completed = true;
        $this->current_step = 6;
        $this->completed_at = now();
        $this->last_activity_at = now();
        $this->save();
    }

    public function markSkipped(): void
    {
        $this->skipped = true;
        $this->completed = true;
        $this->current_step = 6;
        $this->completed_at = now();
        $this->last_activity_at = now();
        $this->save();
    }
}
