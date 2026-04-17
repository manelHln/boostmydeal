<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('workflow_nodes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('workflow_id')->constrained('workflows')->cascadeOnDelete();
            $table->string('node_type'); // TRIGGER, AI_AGENT, CONDITION, EMAIL_TOOL, HUBSPOT_TOOL, ZOHO_TOOL, OUTBOUND_CALL
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('position_x')->default(0);
            $table->integer('position_y')->default(0);
            $table->foreignUuid('next_node_id')->nullable();
            $table->timestamps();

            $table->index(['workflow_id', 'node_type']);
        });

        Schema::table('workflow_nodes', function (Blueprint $table) {
            $table->foreign('next_node_id')
                ->references('id')
                ->on('workflow_nodes')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workflow_nodes');
    }
};
