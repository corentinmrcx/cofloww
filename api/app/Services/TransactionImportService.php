<?php

namespace App\Services;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class TransactionImportService
{
    public function __construct(private TransactionService $transactionService) {}

    /**
     * Parse le CSV et retourne un aperçu : colonnes détectées + 5 premières lignes.
     */
    public function preview(UploadedFile $file): array
    {
        $rows = $this->parseCsv($file);

        if (empty($rows)) {
            return ['columns' => [], 'rows' => [], 'total_rows' => 0];
        }

        return [
            'columns'    => array_keys($rows[0]),
            'rows'       => array_slice($rows, 0, 5),
            'total_rows' => count($rows),
        ];
    }

    /**
     * Importe les transactions depuis le CSV en appliquant le mapping fourni.
     */
    public function import(UploadedFile $file, array $mapping, string $walletId, int $userId, string $defaultType = 'expense', string $dateFormat = 'Y-m-d'): array
    {
        $rows = $this->parseCsv($file);

        $imported      = 0;
        $skipped       = 0;
        $errors        = [];
        $affectedWallets = collect([$walletId]);

        DB::transaction(function () use ($rows, $mapping, $walletId, $userId, $defaultType, $dateFormat, &$imported, &$skipped, &$errors, &$affectedWallets) {
            foreach ($rows as $index => $row) {
                try {
                    $data = $this->mapRow($row, $mapping, $walletId, $userId, $defaultType, $dateFormat);

                    // Détection des doublons : date + label + montant (absolu) + wallet
                    $exists = DB::table('transactions')
                        ->whereNull('deleted_at')
                        ->where('user_id', $userId)
                        ->where('wallet_id', $walletId)
                        ->where('date', $data['date'])
                        ->where('label', $data['label'])
                        ->where(DB::raw('ABS(amount)'), abs($data['amount']))
                        ->exists();

                    if ($exists) {
                        $skipped++;
                        continue;
                    }

                    Transaction::create($data);
                    $imported++;
                } catch (\Throwable $e) {
                    $errors[] = [
                        'row'     => $index + 2, // +2 : header=1, index 0-based
                        'message' => $e->getMessage(),
                    ];
                }
            }
        });

        // Recalcul du cache après insertion en masse
        $this->transactionService->recalculateCache($walletId);

        return [
            'imported' => $imported,
            'skipped'  => $skipped,
            'errors'   => $errors,
        ];
    }

    // ——————————————————————————————————————————
    // Private
    // ——————————————————————————————————————————

    private function parseCsv(UploadedFile $file): array
    {
        $path     = $file->getRealPath();
        $content  = file_get_contents($path);

        // Supprime le BOM UTF-8 si présent
        $content  = ltrim($content, "\xEF\xBB\xBF");

        $delimiter = $this->detectDelimiter($content);
        $lines     = array_filter(explode("\n", str_replace("\r\n", "\n", $content)));
        $lines     = array_values($lines);

        if (empty($lines)) {
            return [];
        }

        $headers = str_getcsv(array_shift($lines), $delimiter);
        $headers = array_map('trim', $headers);

        $rows = [];
        foreach ($lines as $line) {
            if (trim($line) === '') {
                continue;
            }
            $values = str_getcsv($line, $delimiter);
            if (count($values) === count($headers)) {
                $rows[] = array_combine($headers, array_map('trim', $values));
            }
        }

        return $rows;
    }

    private function detectDelimiter(string $content): string
    {
        $firstLine = strtok($content, "\n");
        $counts    = [
            ';' => substr_count($firstLine, ';'),
            ',' => substr_count($firstLine, ','),
            "\t" => substr_count($firstLine, "\t"),
        ];
        arsort($counts);

        return (string) array_key_first($counts);
    }

    private function mapRow(array $row, array $mapping, string $walletId, int $userId, string $defaultType, string $dateFormat): array
    {
        $rawDate   = $row[$mapping['date']]   ?? throw new \RuntimeException("Colonne date introuvable : \"{$mapping['date']}\"");
        $rawAmount = $row[$mapping['amount']] ?? throw new \RuntimeException("Colonne montant introuvable : \"{$mapping['amount']}\"");
        $label     = $row[$mapping['label']]  ?? throw new \RuntimeException("Colonne libellé introuvable : \"{$mapping['label']}\"");
        $rawType   = isset($mapping['type']) ? ($row[$mapping['type']] ?? $defaultType) : $defaultType;
        $notes     = isset($mapping['notes']) ? ($row[$mapping['notes']] ?? null) : null;

        // Parse date
        try {
            $date = Carbon::createFromFormat($dateFormat, trim($rawDate))->format('Y-m-d');
        } catch (\Throwable) {
            $date = Carbon::parse(trim($rawDate))->format('Y-m-d');
        }

        // Normalise le montant : supprime espaces, symboles monétaires, gère virgule/point
        $clean  = preg_replace('/[^0-9,.\-]/', '', trim($rawAmount));
        // Si format "1.234,56" (séparateur milliers=point, décimal=virgule) → swap
        if (preg_match('/\d+\.\d{3},\d{2}$/', $clean)) {
            $clean = str_replace(['.', ','], ['', '.'], $clean);
        } else {
            $clean = str_replace(',', '.', $clean);
        }
        $amountCents = (int) round(abs((float) $clean) * 100);

        if ($amountCents === 0) {
            throw new \RuntimeException("Montant invalide : \"{$rawAmount}\"");
        }

        // Normalise le type
        $type = $this->normalizeType(trim($rawType), $defaultType);

        $signedAmount = match ($type) {
            TransactionType::Income   =>  $amountCents,
            TransactionType::Expense  => -$amountCents,
            TransactionType::Transfer => -$amountCents,
        };

        return [
            'user_id'   => $userId,
            'wallet_id' => $walletId,
            'label'     => trim($label),
            'notes'     => $notes ? trim($notes) : null,
            'amount'    => $signedAmount,
            'type'      => $type->value,
            'date'      => $date,
            'status'    => TransactionStatus::Cleared->value,
        ];
    }

    private function normalizeType(string $raw, string $default): TransactionType
    {
        $map = [
            'income'   => TransactionType::Income,
            'expense'  => TransactionType::Expense,
            'transfer' => TransactionType::Transfer,
            'revenu'   => TransactionType::Income,
            'dépense'  => TransactionType::Expense,
            'virement' => TransactionType::Transfer,
            'crédit'   => TransactionType::Income,
            'debit'    => TransactionType::Expense,
            'débit'    => TransactionType::Expense,
        ];

        return $map[mb_strtolower($raw)] ?? TransactionType::from($default);
    }
}
