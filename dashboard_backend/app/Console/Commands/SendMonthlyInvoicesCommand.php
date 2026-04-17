<?php

namespace App\Console\Commands;

use App\Enums\InvoiceStatus;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SendMonthlyInvoicesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'invoices:send-monthly';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send monthly invoices to all users with active subscriptions or credits';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting monthly invoice generation...');

        $invoicesSent = 0;
        $invoicesFailed = 0;

        // Get all users with credits
        $users = User::has('credit')->get();

        foreach ($users as $user) {
            try {
                DB::beginTransaction();

                $credit = $user->credit;
                $previousBalance = $credit->balance;
                $totalUsed = $credit->total_used;

                // Calculate amount for this month's usage
                $monthlyUsage = $this->calculateMonthlyUsage($user->id);

                if ($monthlyUsage > 0) {
                    $invoice = Invoice::create([
                        'user_id' => $user->id,
                        'invoice_number' => $this->generateInvoiceNumber($user->id),
                        'amount' => $monthlyUsage * 100, // Convert to cents
                        'credits_purchased' => 0, // This is usage-based, not purchase
                        'currency' => 'usd',
                        'description' => 'Monthly usage invoice',
                        'billing_period_start' => now()->subMonth()->startOfMonth(),
                        'billing_period_end' => now()->endOfMonth(),
                        'line_items' => [
                            [
                                'description' => 'Credits used this month',
                                'quantity' => $monthlyUsage,
                                'unit_price' => 1.00, // Price per credit
                                'amount' => $monthlyUsage,
                            ],
                        ],
                        'status' => InvoiceStatus::DRAFT->value,
                    ]);

                    $invoicesSent++;

                    $this->info("Invoice created for user {$user->id}: {$invoice->invoice_number}");
                }

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                $invoicesFailed++;
                $this->error("Failed to create invoice for user {$user->id}: ".$e->getMessage());
            }
        }

        $this->info("Invoice generation completed. Sent: {$invoicesSent}, Failed: {$invoicesFailed}");

        return Command::SUCCESS;
    }

    /**
     * Send a single invoice
     */
    public function sendInvoice(int $userId): int
    {
        $user = User::find($userId);

        if (! $user) {
            $this->error("User not found: {$userId}");

            return Command::FAILURE;
        }

        $credit = $user->credit;
        if (! $credit) {
            $this->error("No credit record found for user: {$userId}");

            return Command::FAILURE;
        }

        try {
            DB::beginTransaction();

            $invoice = Invoice::create([
                'user_id' => $user->id,
                'invoice_number' => $this->generateInvoiceNumber($user->id),
                'amount' => $credit->balance * 100, // Convert to cents
                'credits_purchased' => $credit->total_purchased,
                'currency' => 'usd',
                'description' => 'Credit balance invoice',
                'billing_period_start' => now()->startOfMonth(),
                'billing_period_end' => now()->endOfMonth(),
                'status' => InvoiceStatus::DRAFT->value,
            ]);

            DB::commit();

            $this->info("Invoice created for user {$userId}: {$invoice->invoice_number}");

            return Command::SUCCESS;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("Failed to create invoice for user {$userId}: ".$e->getMessage());

            return Command::FAILURE;
        }
    }

    /**
     * Calculate monthly usage for a user
     */
    protected function calculateMonthlyUsage(int $userId): int
    {
        // This is a placeholder - implement based on your actual usage tracking
        // For example: count calls made, emails sent, etc.
        $startOfMonth = now()->subMonth()->startOfMonth();
        $endOfMonth = now()->endOfMonth();

        // Example: Count calls in this month
        $callCount = DB::table('calls')
            ->where('user_id', $userId) // Note: You might need to track user_id in calls table
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->count();

        return $callCount;
    }

    /**
     * Generate unique invoice number
     */
    protected function generateInvoiceNumber(int $userId): string
    {
        $timestamp = now()->format('YmdHis');
        $random = strtoupper(substr(md5(uniqid().$userId), 0, 4));

        return "INV-{$timestamp}-{$random}";
    }
}
