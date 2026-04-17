<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Guarded(['id', 'created_at', 'updated_at'])]
#[Hidden(['id', 'created_at', 'updated_at'])]
class KnowledgeBase extends Model
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    public function agents(): BelongsToMany
    {
        return $this->belongsToMany(Agent::class, 'knowledge_bases_agents');
    }
}
