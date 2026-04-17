<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\InvoiceStatus;
use App\Models\Credit;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * @authenticated
 * @group Invoices
 */
class InvoiceController extends Controller
{
    /**
     * Get user's invoices
     *
     * @authenticated
     * @queryParam status string optional Filter by invoice status
     * @queryParam per_page int optional Items per page (default: 15)
     *response {"data": [{"id": 1, "invoice_number": "INV-20240101-ABCD", "amount": 10000, "status": "paid"}], "meta": {...}}
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        $invoices = Invoice::query()
            ->where('user_id', $user->id)
            ->when($request->has('status'), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($invoices);
    }

    /**
     * Get specific invoice details
     *
     * @authenticated
     * @urlParam invoice int required The ID of the invoice
     * @response {"id": 1, "invoice_number": "INV-20240101-ABCD", "amount": 10000, "status": "paid", "user": {...}, "payments": [...]}
     */
    public function show(Invoice $invoice): JsonResponse
    {
        $invoice->load(['user', 'payments']);

        return response()->json($invoice);
    }

    /**
     * Send invoice manually
     *
     * @authenticated
     * @urlParam invoice int required The ID of the invoice
     * @response {"message": "Invoice sent successfully", "invoice": {...}}
     * @response 403 {"error": "You do not have permission to send this invoice"}
     */
    public function send(Invoice $invoice): JsonResponse
    {
        $user = Auth::user();

        if ($invoice->user_id !== $user->id) {
            return response()->json([
                'error' => 'You do not have permission to send this invoice',
            ], 403);
        }

        if ($invoice->isPaid()) {
            return response()->json([
                'error' => 'Invoice is already paid',
            ], 422);
        }

        try {
            // Here you would integrate with your email service
            // For now, just mark as sent
            $invoice->update([
                'status' => InvoiceStatus::PENDING->value,
                'sent_at' => now(),
            ]);

            return response()->json([
                'message' => 'Invoice sent successfully',
                'invoice' => $invoice->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to send invoice: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new invoice manually
     *
     * @authenticated
     * @bodyParam amount int required Invoice amount in cents
     * @bodyParam credits_purchased int required Number of credits purchased
     * @bodyParam description string optional Invoice description
     * @bodyParam billing_period_start date required Billing period start date
     * @bodyParam billing_period_end date required Billing period end date
     * @bodyParam currency string optional Currency code (usd, eur, gbp) default: usd
     * @response {"message": "Invoice created successfully", "invoice": {...}}
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'amount' => 'required|integer|min:0',
            'credits_purchased' => 'required|integer|min:0',
            'description' => 'sometimes|string|max:255',
            'billing_period_start' => 'required|date',
            'billing_period_end' => 'required|date|after:billing_period_start',
            'line_items' => 'sometimes|array',
            'currency' => 'sometimes|string|in:usd,eur,gbp',
        ]);

        $invoice = Invoice::create([
            'user_id' => $user->id,
            'invoice_number' => $this->generateInvoiceNumber(),
            'amount' => $validated['amount'],
            'credits_purchased' => $validated['credits_purchased'],
            'currency' => $validated['currency'] ?? 'usd',
            'description' => $validated['description'] ?? null,
            'billing_period_start' => $validated['billing_period_start'],
            'billing_period_end' => $validated['billing_period_end'],
            'line_items' => $validated['line_items'] ?? null,
            'status' => InvoiceStatus::DRAFT->value,
        ]);

        return response()->json([
            'message' => 'Invoice created successfully',
            'invoice' => $invoice,
        ], 201);
    }

    /**
     * Update invoice status
     *
     * @authenticated
     * @urlParam invoice int required The ID of the invoice
     * @bodyParam status string required New status (draft, pending, paid, failed, cancelled)
     * @bodyParam notes string optional Notes about the status update
     * @response {"message": "Invoice updated successfully", "invoice": {...}}
     */
    public function updateStatus(Request $request, Invoice $invoice): JsonResponse
    {
        $user = Auth::user();

        if ($invoice->user_id !== $user->id) {
            return response()->json([
                'error' => 'You do not have permission to update this invoice',
            ], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:draft,pending,paid,failed,cancelled',
            'notes' => 'sometimes|string|max:1000',
        ]);

        $invoice->update([
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
        ]);

        // Update credit balance if paid
        if ($invoice->status === InvoiceStatus::PAID->value && ! $invoice->isPaid()) {
            $credit = $invoice->credit;
            if ($credit) {
                $credit->addCredits($invoice->credits_purchased);
            }
        }

        return response()->json([
            'message' => 'Invoice updated successfully',
            'invoice' => $invoice->fresh(),
        ]);
    }

    /**
     * Delete invoice
     *
     * @authenticated
     * @urlParam invoice int required The ID of the invoice
     * @response 204
     * @response 403 {"error": "You do not have permission to delete this invoice"}
     * @response 422 {"error": "Cannot delete paid invoice"}
     */
    public function destroy(Invoice $invoice): JsonResponse
    {
        $user = Auth::user();

        if ($invoice->user_id !== $user->id) {
            return response()->json([
                'error' => 'You do not have permission to delete this invoice',
            ], 403);
        }

        if ($invoice->isPaid()) {
            return response()->json([
                'error' => 'Cannot delete paid invoice',
            ], 422);
        }

        $invoice->delete();

        return response()->json(null, 204);
    }

    /**
     * Generate unique invoice number
     */
    protected function generateInvoiceNumber(): string
    {
        $timestamp = now()->format('YmdHis');
        $random = strtoupper(substr(md5(uniqid()), 0, 4));

        return "INV-{$timestamp}-{$random}";
    }
}
