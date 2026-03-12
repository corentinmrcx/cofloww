import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useT } from '../../../../components/T'
import { Button } from '../../../../components/Button'
import { MoneyInput } from '../../../../components/Input'
import { IconPicker } from '../../../../components/IconPicker'
import { useCreateWallet } from '../../hooks/useCreateWallet'
import { useUpdateWallet } from '../../hooks/useUpdateWallet'
import type { Wallet } from '../../types/wallet.types'

const schema = z.object({
  name:            z.string().min(1),
  type:            z.enum(['checking', 'savings', 'cash', 'investment', 'crypto']),
  color:           z.string(),
  icon:            z.string().optional(),
  institution:     z.string().optional(),
  initial_balance: z.number().int(),
})

type FormValues = z.infer<typeof schema>

const INPUT_CLASS = 'h-9 w-full rounded-md border border-input bg-background text-foreground px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

interface WalletModalProps {
  wallet?: Wallet
  onClose: () => void
}

const WalletModal = ({ wallet, onClose }: WalletModalProps) => {
  const t = useT(import.meta.url)
  const isEdit = wallet !== undefined

  const { mutate: createWallet, isPending: isCreating } = useCreateWallet()
  const { mutate: updateWallet, isPending: isUpdating } = useUpdateWallet(wallet?.id ?? '')
  const isPending = isCreating || isUpdating

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: isEdit
      ? {
          name:            wallet.name,
          type:            wallet.type,
          color:           wallet.color ?? '#6366f1',
          icon:            wallet.icon || undefined,
          institution:     wallet.institution ?? undefined,
          initial_balance: wallet.initial_balance,
        }
      : { type: 'checking', color: '#6366f1', initial_balance: 0 },
  })

  const onSubmit = (data: FormValues) => {
    if (isEdit) {
      updateWallet(data, { onSuccess: onClose })
    } else {
      createWallet(data, { onSuccess: onClose })
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6 m-4"
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
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{t('name')}</label>
            <input
              {...register('name')}
              placeholder={t('name_placeholder')}
              className={INPUT_CLASS}
            />
            {errors.name && <p className="text-xs text-destructive">{t('name_required')}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{t('type')}</label>
            <select {...register('type')} className={INPUT_CLASS}>
              <option value="checking">{t('type_checking')}</option>
              <option value="savings">{t('type_savings')}</option>
              <option value="cash">{t('type_cash')}</option>
              <option value="investment">{t('type_investment')}</option>
              <option value="crypto">{t('type_crypto')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{t('icon')}</label>
            <Controller
              name="icon"
              control={control}
              render={({ field }: { field: { value: string | undefined; onChange: (v: string | undefined) => void } }) => (
                <IconPicker value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{t('institution')}</label>
            <input
              {...register('institution')}
              placeholder={t('institution_placeholder')}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-medium">{t('initial_balance')}</label>
              <Controller
                name="initial_balance"
                control={control}
                render={({ field }: { field: { value: number; onChange: (v: number) => void } }) => (
                  <MoneyInput value={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t('color')}</label>
              <input
                type="color"
                {...register('color')}
                className="h-9 w-16 rounded-md border border-input cursor-pointer bg-transparent px-1 py-1"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending
                ? t(isEdit ? 'saving_edit' : 'saving_add')
                : t(isEdit ? 'save_edit'   : 'save_add')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export { WalletModal }
