<?php

namespace App\Models;

use App\Enums\WorkflowExecutionStatus;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

#[Guarded(['id', 'created_at', 'updated_at'])]
#[Hidden(['id', 'created_at', 'updated_at'])]
class WorkflowExecution extends Model
{
    use BelongsToTenant, HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected function casts(): array
    {
        return [
            'input_data' => 'array',
            'output_data' => 'array',
            'error_message' => 'array',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }

    public function call(): ?BelongsTo
    {
        return $this->belongsTo(Call::class);
    }

    public function markAsRunning(): void
    {
        $this->status = WorkflowExecutionStatus::RUNNING->value;
        $this->started_at = now();
        $this->save();
    }

    public function markAsCompleted(array $outputData = []): void
    {
        $this->status = WorkflowExecutionStatus::COMPLETED->value;
        $this->completed_at = now();
        if (! empty($outputData)) {
            $this->output_data = $outputData;
        }
        $this->save();
    }

    public function markAsFailed(array $errorData = []): void
    {
        $this->status = WorkflowExecutionStatus::FAILED->value;
        $this->completed_at = now();
        if (! empty($errorData)) {
            $this->error_message = $errorData;
        }
        $this->save();
    }

    public function duration(): ?int
    {
        if (! $this->started_at || ! $this->completed_at) {
            return null;
        }

        return $this->started_at->diffInSeconds($this->completed_at);
    }
}
