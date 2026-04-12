import { useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useT } from '../../../../components/T/T'
import { Button } from '../../../../components/Button/Button'
import { MoneyInput } from '../../../../components/Input'
import { CategorySelector } from '../../../category/components/CategorySelector'
import { TagInput } from '../../../tag/components/TagInput'
import { useWallets } from '../../../wallet/hooks/useWallets'
import { useCreateTransaction } from '../../hooks/useCreateTransaction'
import { useUpdateTransaction } from '../../hooks/useUpdateTransaction'
import type { Transaction } from '../../types/transaction.types'
import type { Wallet } from '../../../wallet/types/wallet.types'

const schema = z.object({
  type:         z.enum(['income', 'expense', 'transfer']),
  label:        z.string().min(1),
  amount:       z.number().int().min(1),
  date:         z.string().min(1),
  wallet_id:    z.string().uuid(),
  to_wallet_id: z.string().uuid().nullable().optional(),
  category_id:  z.string().uuid().nullable().optional(),
  tag_ids:      z.array(z.string().uuid()).optional(),
  notes:        z.string().nullable().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'transfer' && !data.to_wallet_id) {
    ctx.addIssue({ code: 'custom', path: ['to_wallet_id'], message: 'required' })
  }
})

type FormValues = z.infer<typeof schema>

const INPUT_CLASS =
  'h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

interface TransactionModalProps {
  transaction?: Transaction
  onClose: () => void
}

const TransactionModal = ({ transaction, onClose }: TransactionModalProps) => {
  const t = useT(import.meta.url)
  const isEdit = transaction !== undefined
  const { data: wallets } = useWallets()
  const walletList: Wallet[] = wallets ?? []

  const { mutate: create, isPending: isCreating } = useCreateTransaction()
  const { mutate: update, isPending: isUpdating } = useUpdateTransaction(transaction?.id ?? '')
  const isPending = isCreating || isUpdating

  const today = new Date().toISOString().split('T')[0]

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: isEdit
      ? {
          type:         transaction.type,
          label:        transaction.label,
          amount:       Math.abs(transaction.amount),
          date:         transaction.date,
          wallet_id:    transaction.wallet_id,
          to_wallet_id: transaction.to_wallet_id ?? null,
          category_id:  transaction.category_id ?? null,
          tag_ids:      transaction.tags.map(t => t.id),
          notes:        transaction.notes ?? '',
        }
      : {
          type:      'expense',
          amount:    0,
          date:      today,
          tag_ids:   [],
        },
  })

  const selectedType     = watch('type')
  const selectedWalletId = watch('wallet_id')
  const selectedToWallet = watch('to_wallet_id')
  const currentLabel     = watch('label')
  const lastAutoLabel    = useRef<string>('')

  useEffect(() => {
    if (selectedType !== 'transfer' || isEdit) return
    const from = walletList.find(w => w.id === selectedWalletId)?.name
    const to   = walletList.find(w => w.id === selectedToWallet)?.name
    if (!from || !to) return
    const autoLabel = `Transfert de ${from} vers ${to}`
    if (!currentLabel || currentLabel === lastAutoLabel.current) {
      setValue('label', autoLabel)
      lastAutoLabel.current = autoLabel
    }
  }, [selectedType, selectedWalletId, selectedToWallet])

  const onSubmit = (data: FormValues) => {
    if (isEdit) {
      update(data, { onSuccess: onClose })
    } else {
      create(data, { onSuccess: onClose })
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg p-6 m-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold">
            {t(isEdit ? 'title_edit' : 'title_add')}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

          {/* Type */}
          <div className="flex gap-2">
            {(['expense', 'income', 'transfer'] as const).map(type => (
              <label key={type} className="flex-1">
                <input type="radio" {...register('type')} value={type} className="sr-only" />
                <div className={`h-9 flex items-center justify-center rounded-md border text-sm cursor-pointer transition-colors ${
                  selectedType === type
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-input hover:bg-accent'
                }`}>
                  {t(`type_${type}`)}
                </div>
              </label>
            ))}
          </div>

          {/* Label */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{t('label')}</label>
            <input
              {...register('label')}
              placeholder={t('label_placeholder')}
              className={INPUT_CLASS}
              autoFocus={!isEdit}
            />
            {errors.label && <p className="text-xs text-destructive">{t('label_required')}</p>}
          </div>

          {/* Montant + Date */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-medium">{t('amount')}</label>
              <Controller
                name="amount"
                control={control}
                render={({ field }: { field: { value: number; onChange: (v: number) => void } }) => (
                  <MoneyInput value={field.value} onChange={field.onChange} />
                )}
              />
              {errors.amount && <p className="text-xs text-destructive">{t('amount_required')}</p>}
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-medium">{t('date')}</label>
              <input type="date" {...register('date')} className={INPUT_CLASS} />
              {errors.date && <p className="text-xs text-destructive">{t('date_required')}</p>}
            </div>
          </div>

          {/* Wallet */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{t('wallet')}</label>
            <select {...register('wallet_id')} className={INPUT_CLASS}>
              <option value="">{t('wallet_placeholder')}</option>
              {walletList.map((w: Wallet) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            {errors.wallet_id && <p className="text-xs text-destructive">{t('wallet_required')}</p>}
          </div>

          {/* To wallet (transfer only) */}
          {selectedType === 'transfer' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t('to_wallet')}</label>
              <select {...register('to_wallet_id')} className={INPUT_CLASS}>
                <option value="">{t('wallet_placeholder')}</option>
                {walletList.filter((w: Wallet) => w.id !== selectedWalletId).map((w: Wallet) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
              {errors.to_wallet_id && <p className="text-xs text-destructive">{t('to_wallet_required')}</p>}
            </div>
          )}

          {/* Catégorie */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{t('category')}</label>
            <Controller
              name="category_id"
              control={control}
              render={({ field }: { field: { value: string | null | undefined; onChange: (v: string | null) => void } }) => (
                <CategorySelector
                  value={field.value ?? null}
                  onChange={field.onChange}
                  type={selectedType === 'transfer' ? undefined : selectedType}
                  clearable
                />
              )}
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{t('tags')}</label>
            <Controller
              name="tag_ids"
              control={control}
              render={({ field }: { field: { value: string[] | undefined; onChange: (v: string[]) => void } }) => (
                <TagInput value={field.value ?? []} onChange={field.onChange} />
              )}
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{t('notes')}</label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder={t('notes_placeholder')}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? t('saving') : t(isEdit ? 'save_edit' : 'save_add')}
            </Button>
          </div>

        </form>
      </div>
    </div>
  )
}

export { TransactionModal }
