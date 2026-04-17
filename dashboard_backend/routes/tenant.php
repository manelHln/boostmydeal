<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AgentController;
use App\Http\Controllers\Api\V1\ApiKeyController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CallController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\InvoiceController;
use App\Http\Controllers\Api\V1\KnowledgeBaseController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\OnboardingController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\PhoneNumberController;
use App\Http\Controllers\Api\V1\TenantInvitationController;
use App\Http\Controllers\Api\V1\TokenController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\UserPreferenceController;
use App\Http\Controllers\Api\V1\WorkflowController;
use App\Http\Middleware\UseTenantGuard;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;
use Stancl\Tenancy\Middleware\InitializeTenancyByRequestData;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

// Configure the header name for request data identification
InitializeTenancyByRequestData::$header = 'X-Tenant-ID';

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Here you can register the tenant routes for your application.
| These routes are loaded by the TenantRouteServiceProvider.
|
| Feel free to customize them however you want. Good luck!
|
*/

Route::group(['prefix' => config('sanctum.prefix', 'sanctum')], static function () {
    Route::get('/csrf-cookie', [CsrfCookieController::class, 'show'])
        ->middleware([
            InitializeTenancyByRequestData::class,
            'web',
        ])->name('sanctum.csrf-cookie');
});

Route::middleware([
    InitializeTenancyByRequestData::class,
    'web',
    UseTenantGuard::class
])->prefix('api/v1')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->name('login');
});

Route::middleware([
    InitializeTenancyByRequestData::class,
    'web',
    UseTenantGuard::class,
    'auth:sanctum',
])->prefix('api/v1')->group(function () {
    // Authentication (Sanctum tokens)
    Route::post('/tokens', [TokenController::class, 'store']);
    Route::get('/tokens', [TokenController::class, 'index']);
    Route::delete('/tokens/{tokenId}', [TokenController::class, 'destroy']);

    // Auth & Profile
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('refresh-token', [AuthController::class, 'refresh'])->name('refresh');
    Route::post('/logout', [AuthController::class, 'logout']);

    // Dashboard & Analytics
    Route::get('/dashboard/metrics', [DashboardController::class, 'metrics']);
    Route::get('/dashboard/call-evolution', [DashboardController::class, 'callEvolution']);
    Route::get('/dashboard/agent-stats', [DashboardController::class, 'agentStats']);
    Route::get('/dashboard/phone-number-stats', [DashboardController::class, 'phoneNumberStats']);

    // User Preferences
    Route::get('/preferences', [UserPreferenceController::class, 'index']);
    Route::put('/preferences', [UserPreferenceController::class, 'update']);

    // Onboarding
    Route::get('/onboarding/status', [OnboardingController::class, 'status']);
    Route::post('/onboarding/step', [OnboardingController::class, 'saveStep']);
    Route::post('/onboarding/skip', [OnboardingController::class, 'skip']);
    Route::post('/onboarding/complete', [OnboardingController::class, 'complete']);
    Route::get('/onboarding/step/{step}', [OnboardingController::class, 'getStep']);

    // Agents
    Route::apiResource('agents', AgentController::class);

    // Phone Numbers
    Route::apiResource('phone-numbers', PhoneNumberController::class);

    // API Keys
    Route::apiResource('api-keys', ApiKeyController::class);
    Route::post('/api-keys/{apiKey}/revoke', [ApiKeyController::class, 'revoke']);

    // Knowledge Bases
    Route::apiResource('knowledge-bases', KnowledgeBaseController::class);

    // Calls
    Route::apiResource('calls', CallController::class);
    Route::post('/calls/start', [CallController::class, 'startCall']);
    Route::get('/calls/export-csv', [CallController::class, 'exportCsv']);
    Route::get('/calls/{call}/webhooks', [CallController::class, 'webhooks']);

    // Workflows
    Route::apiResource('workflows', WorkflowController::class);
    Route::get('/workflows/{workflow}/executions', [WorkflowController::class, 'executions']);
    Route::post('/workflows/{workflow}/trigger', [WorkflowController::class, 'trigger']);
    Route::post('/workflows/{workflow}/activate', [WorkflowController::class, 'activate']);
    Route::post('/workflows/{workflow}/deactivate', [WorkflowController::class, 'deactivate']);

    // Billing & Payments
    Route::get('/credits', [PaymentController::class, 'credits']);
    Route::post('/payments/create-intent', [PaymentController::class, 'createIntent']);
    Route::get('/payments', [PaymentController::class, 'history']);
    Route::get('/payments/{payment}', [PaymentController::class, 'show']);
    Route::post('/payments/webhook', [PaymentController::class, 'handleWebhook'])->withoutMiddleware('auth:sanctum');
    Route::apiResource('invoices', InvoiceController::class);
    Route::post('/invoices/{invoice}/send', [InvoiceController::class, 'send']);
    Route::put('/invoices/{invoice}/status', [InvoiceController::class, 'updateStatus']);

    // Notifications
    Route::apiResource('notifications', NotificationController::class)->only(['index', 'show']);
    Route::post('/notifications/{notification}/mark-read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);

    // User Management
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    // Tenant Invitations
    Route::apiResource('invitations', TenantInvitationController::class);
    Route::post('/invitations/{invitation}/accept', [TenantInvitationController::class, 'accept']);
});
