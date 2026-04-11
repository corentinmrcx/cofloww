import type { Wallet } from '../../wallet/types/wallet.types'

export interface ComputeInvestmentParams {
  wallet_id: string
  seuil: number
  pas_arrondi: number
  month?: number
  year?: number
}

export interface ComputeAllocation {
  wallet: Wallet
  amount: number
}

export interface ComputeInvestmentResult {
  depenses: number
  seuil: number
  investable: number
  allocations: ComputeAllocation[]
  total_alloue: number
  reste: number
  source_wallet: Wallet
  target_month: string
}
