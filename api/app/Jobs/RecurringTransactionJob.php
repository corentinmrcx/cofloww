<?php

namespace App\Jobs;

use App\Models\RecurringRule;
use App\Services\TransactionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class RecurringTransactionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(TransactionService $transactionService): void
    {
        $today = Carbon::today();

        RecurringRule::withoutGlobalScopes()
            ->where('is_active', true)
            ->where('starts_at', '<=', $today)
            ->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', $today))
            ->each(function (RecurringRule $rule) use ($today, $transactionService) {
                $next = $rule->nextOccurrence();

                if (! $next || ! $next->isSameDay($today)) {
                    return;
                }

                try {
                    $transactionService->store([
                        'wallet_id'    => $rule->wallet_id,
                        'category_id'  => $rule->category_id,
                        'label'        => $rule->label,
                        'amount'       => $rule->amount,
                        'type'         => $rule->type->value,
                        'date'         => $today->toDateString(),
                        'is_recurring' => true,
                        'recurring_rule_id' => $rule->id,
                        'status'       => 'cleared',
                    ], $rule->user_id);

                    $rule->update(['last_generated_at' => $today]);
                } catch (\Throwable $e) {
                    Log::error("RecurringTransactionJob: failed for rule {$rule->id}", [
                        'error' => $e->getMessage(),
                    ]);
                }
            });
    }
}
