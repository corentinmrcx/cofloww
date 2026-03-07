<?php

namespace App\Enums;

enum WalletType: string
{
    case Checking   = 'checking';
    case Savings    = 'savings';
    case Cash       = 'cash';
    case Investment = 'investment';
    case Crypto     = 'crypto';
}
