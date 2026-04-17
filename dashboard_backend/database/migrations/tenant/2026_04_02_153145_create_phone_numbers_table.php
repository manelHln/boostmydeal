<?php

use App\Enums\PhoneNumberProvider;
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
        Schema::create('phone_numbers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('did')->nullable(false);
            $table->string('country_code')->nullable(false);
            $table->string('provider')->nullable(false)->default(PhoneNumberProvider::VOXSUN->value);
            $table->json('provider_config')->nullable(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('phone_numbers');
    }
};
