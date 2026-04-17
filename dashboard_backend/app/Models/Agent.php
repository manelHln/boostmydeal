<?php

namespace App\Models;

use App\Enums\AgentVoiceAIMode;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

#[Guarded(['id', 'created_at', 'updated_at'])]
#[Hidden(['id', 'created_at', 'updated_at'])]
class Agent extends Model
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected function casts(): array
    {
        return [
            'user_speaks_first' => 'boolean',
            'call_recording' => 'boolean',
            'remember_lead_preference' => 'boolean',
            'enable_human_transfer' => 'boolean',
            'enable_background_sound' => 'boolean',
            'enable_interruptions' => 'boolean',
            'enable_vad' => 'boolean',
            'temperature' => 'float',
            'mode' => AgentVoiceAIMode::class,
        ];
    }

    public function phoneNumber(): BelongsTo
    {
        return $this->belongsTo(PhoneNumber::class);
    }

    public function knowledgeBases(): BelongsToMany
    {
        return $this->belongsToMany(KnowledgeBase::class, 'knowledge_bases_agents');
    }

    public function calls(): HasMany
    {
        return $this->hasMany(Call::class);
    }
}
