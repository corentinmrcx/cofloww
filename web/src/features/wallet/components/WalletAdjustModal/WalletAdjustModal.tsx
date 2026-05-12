import { useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useT } from '../../../../components/T'
import { Button } from '../../../../components/Button'
import { MoneyInput } from '../../../../components/Input'
import { useAdjustWallet } from '../../hooks/useAdjustWallet'
import { useFormatters } from '../../../../lib/format'
import { cn } from '../../../../lib/utils'
import type { Wallet } from '../../types/wallet.types'
import trad from './trad.json'

const schema = z.object({
  target_balance: z.number().int(),
})

type FormValues = z.infer<typeof schema>

interface WalletAdjustModalProps {
  wallet: Wallet
  onClose: () => void
}

const WalletAdjustModal = ({ wallet, onClose }: WalletAdjustModalProps) => {
  const t = useT(trad)
  const closeRef = useRef<HTMLButtonElement>(null)
  const { formatAmount } = useFormatters()
  const { mutate: adjust, isPending } = useAdjustWallet(wallet.id)

  useEffect(() => {
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  const { handleSubmit, control, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { target_balance: wallet.balance },
  })

  const targetBalance = watch('target_balance')
  const diff = targetBalance - wallet.balance

  const onSubmit = (data: FormValues) => {
    adjust(data, { onSuccess: onClose })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="adjust-modal-title"
        className="bg-card border border-border rounded-xl shadow-lg w-full max-w-sm p-6 m-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="adjust-modal-title" className="text-base font-semibold">
            {t('title')}
          </h2>
          <button
            ref={closeRef}
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-muted/40">
            <span className="text-muted-foreground">{t('current_balance')}</span>
            <span className="font-semibold tabular-nums">{formatAmount(wallet.balance)}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="target-balance" className="text-sm font-medium">{t('new_balance')}</label>
            <Controller
              name="target_balance"
              control={control}
              render={({ field }) => (
                <MoneyInput id="target-balance" value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          {diff !== 0 && (
            <p className={cn('text-xs px-1', diff > 0 ? 'text-income' : 'text-expense')}>
              {diff > 0 ? t('will_add') : t('will_deduct')} {formatAmount(Math.abs(diff))}
            </p>
          )}

          <div className="flex gap-3 mt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={isPending || diff === 0}
              onClick={handleSubmit(onSubmit)}
            >
              {isPending ? t('saving') : t('save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { WalletAdjustModal }
