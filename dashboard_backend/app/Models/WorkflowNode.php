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
class WorkflowNode extends Model
{
    use BelongsToTenant, HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected function casts(): array
    {
        return [
            'position_x' => 'integer',
            'position_y' => 'integer',
            'config' => 'array',
            'conditions' => 'array',
        ];
    }

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }

    public function nextNode(): ?WorkflowNode
    {
        return $this->belongsTo(WorkflowNode::class, 'next_node_id');
    }

    public function trueNode(): ?WorkflowNode
    {
        return $this->belongsTo(WorkflowNode::class, 'true_node_id');
    }

    public function falseNode(): ?WorkflowNode
    {
        return $this->belongsTo(WorkflowNode::class, 'false_node_id');
    }

    public function outgoingNodes(): HasMany
    {
        return $this->hasMany(WorkflowNode::class, 'next_node_id');
    }
}
