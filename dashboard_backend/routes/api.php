<?php

use App\Http\Controllers\Api\V1\TenantController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/tenants')->group(function () {
    Route::post('/register', [TenantController::class, 'store']);
    Route::post('signup.checkEmail', [TenantController::class, 'checkEmail']);
    Route::post('signup.verifyOtp', [TenantController::class, 'verifyOtp']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('{tenant}', [TenantController::class, 'show']);
        Route::put('{tenant}', [TenantController::class, 'update']);
        Route::delete('{tenant}', [TenantController::class, 'destroy']);
    });
});