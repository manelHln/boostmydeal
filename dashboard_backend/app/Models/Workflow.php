<?php

namespace App\Models;

use App\Enums\WorkflowNodeType;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

#[Guarded(['id', 'created_at', 'updated_at'])]
#[Hidden(['id', 'created_at', 'updated_at'])]
class Workflow extends Model
{
    use BelongsToTenant, HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'trigger_config' => 'array',
        ];
    }

    public function nodes(): HasMany
    {
        return $this->hasMany(WorkflowNode::class)->orderBy('position_x', 'asc');
    }

    public function executions(): HasMany
    {
        return $this->hasMany(WorkflowExecution::class)->orderBy('created_at', 'desc');
    }

    public function triggerNode(): ?WorkflowNode
    {
        return $this->nodes()->where('node_type', WorkflowNodeType::TRIGGER->value)->first();
    }

    public function activate(): void
    {
        $this->is_active = true;
        $this->save();
    }

    public function deactivate(): void
    {
        $this->is_active = false;
        $this->save();
    }
}
