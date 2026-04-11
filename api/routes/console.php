<?php

use App\Jobs\RecurringTransactionJob;
use App\Services\SnapshotService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(RecurringTransactionJob::class)->dailyAt('00:05');

// Snapshot mensuel : le 1er du mois à 01h00, calcule et persiste le mois précédent
Schedule::call(fn () => app(SnapshotService::class)->computeAndPersistPreviousMonth())
    ->monthlyOn(1, '01:00')
    ->name('monthly-snapshot')
    ->withoutOverlapping();
