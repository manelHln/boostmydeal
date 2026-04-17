<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\PaymentStatus;
use App\Models\Credit;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * @authenticated
 * @group Payments
 */
class PaymentController extends Controller
{
    /**
     * Get current user's credit balance
     *
     * @authenticated
     * @response {"balance": 5000, "total_purchased": 10000, "total_used": 5000}
     */
    public function credits(Request $request): JsonResponse
    {
        $user = Auth::user();
        $credit = $user->credit ?? Credit::create([
            'user_id' => $user->id,
            'balance' => 0,
            'total_purchased' => 0,
            'total_used' => 0,
        ]);

        return response()->json([
            'balance' => $credit->balance,
            'total_purchased' => $credit->total_purchased,
            'total_used' => $credit->total_used,
        ]);
    }

    /**
     * Create a payment intent for purchasing credits
     *
     * @authenticated
     * @bodyParam amount int required Amount in cents (min: 500, max: 100000)
     * @bodyParam credits_amount int required Number of credits to purchase (min: 100, max: 10000)
     * @bodyParam currency string optional Currency code (usd, eur, gbp) default: usd
     * @bodyParam description string optional Payment description
     * @response {"client_secret": "pi_...", "payment_intent_id": "pi_...", "amount": 5000, "credits_amount": 100, "currency": "usd"}
     */
    public function createIntent(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'amount' => 'required|integer|min:500|max:100000', // Amount in cents
            'credits_amount' => 'required|integer|min:100|max:10000', // Credits to purchase
            'currency' => 'sometimes|string|in:usd,eur,gbp',
            'description' => 'sometimes|string|max:255',
        ]);

        // Calculate amount in dollars for Stripe (credits * cost per credit)
        $creditPrice = $validated['amount'] / $validated['credits_amount']; // Price per credit in cents

        try {
            $paymentIntent = $user->createSetupIntent($validated['amount'], [
                'currency' => $validated['currency'] ?? 'usd',
                'description' => $validated['description'] ?? "Purchase {$validated['credits_amount']} credits",
                'metadata' => [
                    'user_id' => $user->id,
                    'credits_amount' => $validated['credits_amount'],
                    'credit_price' => $creditPrice,
                ],
            ]);

            return response()->json([
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
                'amount' => $validated['amount'],
                'credits_amount' => $validated['credits_amount'],
                'currency' => $validated['currency'] ?? 'usd',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create payment intent: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle Stripe payment webhook
     *
     * @unauthenticated
     * @response {"message": "Webhook processed successfully"}
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        $payload = $request->input('data.object');
        $eventType = $request->input('type');

        try {
            DB::beginTransaction();

            switch ($eventType) {
                case 'payment_intent.succeeded':
                    $this->handlePaymentSucceeded($payload);
                    break;

                case 'payment_intent.payment_failed':
                    $this->handlePaymentFailed($payload);
                    break;

                case 'charge.refunded':
                    $this->handleRefund($payload);
                    break;

                case 'charge.failed':
                    $this->handleChargeFailed($payload);
                    break;

                default:
                    // Ignore other events for now
                    break;
            }

            DB::commit();

            return response()->json(['message' => 'Webhook processed successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Payment webhook error: '.$e->getMessage());

            return response()->json([
                'error' => 'Failed to process webhook',
            ], 500);
        }
    }

    /**
     * Handle successful payment
     */
    protected function handlePaymentSucceeded(array $payload): void
    {
        $paymentIntent = $payload;

        // Find or create payment record
        $payment = Payment::where('stripe_payment_intent_id', $paymentIntent['id'])->first();

        if (! $payment) {
            $userId = $paymentIntent['metadata']['user_id'] ?? null;
            $creditsAmount = $paymentIntent['metadata']['credits_amount'] ?? 0;

            $payment = Payment::create([
                'user_id' => $userId,
                'stripe_payment_intent_id' => $paymentIntent['id'],
                'amount' => $paymentIntent['amount'],
                'currency' => $paymentIntent['currency'] ?? 'usd',
                'description' => $paymentIntent['description'] ?? null,
                'status' => PaymentStatus::COMPLETED->value,
                'paid_at' => now(),
                'metadata' => $paymentIntent['metadata'] ?? null,
            ]);

            // Add credits to user's balance
            $credit = Credit::where('user_id', $userId)->first();
            if ($credit) {
                $credit->addCredits($creditsAmount);
            }
        } else {
            // Update existing payment
            $payment->update([
                'status' => PaymentStatus::COMPLETED->value,
                'paid_at' => now(),
            ]);
        }
    }

    /**
     * Handle failed payment
     */
    protected function handlePaymentFailed(array $payload): void
    {
        $paymentIntent = $payload;

        $payment = Payment::where('stripe_payment_intent_id', $paymentIntent['id'])->first();

        if ($payment) {
            $payment->update([
                'status' => PaymentStatus::FAILED->value,
                'failure_reason' => ($paymentIntent['last_payment_error']['message'] ?? null),
            ]);
        }
    }

    /**
     * Handle refund
     */
    protected function handleRefund(array $payload): void
    {
        $charge = $payload;
        $payment = Payment::where('stripe_charge_id', $charge['id'])->first();

        if ($payment) {
            $payment->update([
                'status' => PaymentStatus::REFUNDED->value,
                'refunded_at' => now(),
            ]);

            // Deduct credits from user's balance
            $credit = $payment->credit;
            if ($credit && $payment->metadata && isset($payment->metadata['credits_amount'])) {
                $credit->balance -= $payment->metadata['credits_amount'];
                $credit->save();
            }
        }
    }

    /**
     * Handle failed charge
     */
    protected function handleChargeFailed(array $payload): void
    {
        $charge = $payload;
        $payment = Payment::where('stripe_charge_id', $charge['id'])->first();

        if ($payment) {
            $payment->update([
                'status' => PaymentStatus::FAILED->value,
                'failure_reason' => $charge['failure_message'] ?? 'Unknown error',
            ]);
        }
    }

    /**
     * Get payment history
     *
     * @authenticated
     * @queryParam status string optional Filter by payment status
     * @queryParam per_page int optional Items per page (default: 15)
     * @response {"data": [{"id": 1, "amount": 5000, "status": "completed", "paid_at": "2024-01-01T00:00:00Z"}], "meta": {...}}
     */
    public function history(Request $request): JsonResponse
    {
        $user = Auth::user();

        $payments = Payment::query()
            ->where('user_id', $user->id)
            ->when($request->has('status'), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($payments);
    }

    /**
     * Get payment details
     *
     * @authenticated
     * @urlParam payment int required The ID of the payment
     * @response {"id": 1, "amount": 5000, "status": "completed", "user": {...}, "invoice": {...}}
     */
    public function show(Payment $payment): JsonResponse
    {
        $payment->load(['user', 'invoice']);

        return response()->json($payment);
    }
}
