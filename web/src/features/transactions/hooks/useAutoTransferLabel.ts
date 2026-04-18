import { useEffect, useRef } from 'react'
import type { Wallet } from '../../wallet/types/wallet.types'

interface UseAutoTransferLabelParams {
  type: string
  walletId: string | undefined
  toWalletId: string | null | undefined
  currentLabel: string | undefined
  wallets: Wallet[]
  isEdit: boolean
  setValue: (field: 'label', value: string) => void
  transferPrefix: string
  transferJoiner: string
}

const useAutoTransferLabel = ({
  type,
  walletId,
  toWalletId,
  currentLabel,
  wallets,
  isEdit,
  setValue,
  transferPrefix,
  transferJoiner,
}: UseAutoTransferLabelParams) => {
  const lastAutoLabel = useRef<string>('')

  useEffect(() => {
    if (type !== 'transfer' || isEdit) return
    const from = wallets.find(w => w.id === walletId)?.name
    const to   = wallets.find(w => w.id === toWalletId)?.name
    if (!from || !to) return
    const autoLabel = `${transferPrefix}${from}${transferJoiner}${to}`
    if (!currentLabel || currentLabel === lastAutoLabel.current) {
      setValue('label', autoLabel)
      lastAutoLabel.current = autoLabel
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, walletId, toWalletId, wallets, transferPrefix, transferJoiner])
}

export { useAutoTransferLabel }
