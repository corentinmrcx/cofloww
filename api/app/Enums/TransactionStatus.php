<?php

namespace App\Enums;

enum TransactionStatus: string
{
    case Pending    = 'pending';
    case Cleared    = 'cleared';
    case Reconciled = 'reconciled';
}
