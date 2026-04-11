import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useT } from '../../../../components/T'
import { Button } from '../../../../components/Button'
import { MoneyInput } from '../../../../components/Input'
import { useCreateRecurringRule } from '../../hooks/useCreateRecurringRule'
import { useUpdateRecurringRule } from '../../hooks/useUpdateRecurringRule'
import { useWallets } from '../../../wallet/hooks/useWallets'
import { useCategories } from '../../../category/hooks/useCategories'
import type { RecurringRule } from '../../types/recurring.types'

const schema = z.object({
  label:        z.string().min(1),
  type:         z.enum(['income', 'expense']),
  amount:       z.number().int().min(1),
  frequency:    z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  day_of_week:  z.number().int().min(0).max(6).nullable().optional(),
  day_of_month: z.number().int().min(1).max(31).nullable().optional(),
  wallet_id:    z.string().min(1),
  category_id:  z.string().min(1).nullable().optional(),
  starts_at:    z.string().min(1),
  ends_at:      z.string().nullable().optional(),
  is_active:    z.boolean(),
})

type FormValues = z.infer<typeof schema>

const INPUT_CLASS = 'h-9 w-full rounded-md border border-input bg-background text-foreground px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

interface RecurringRuleModalProps {
  rule?: RecurringRule
  onClose: () => void
}

const RecurringRuleModal = ({ rule, onClose }: RecurringRuleModalProps) => {
  const t = useT(import.meta.url)
  const isEdit = rule !== undefined

  const { data: wallets = [] } = useWallets()
  const { data: categories = [] } = useCategories()

  const { mutate: create, isPending: isCreating } = useCreateRecurringRule()
  const { mutate: update, isPending: isUpdating } = useUpdateRecurringRule(rule?.id ?? '')
  const isPending = isCreating || isUpdating

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: isEdit
      ? {
          label:        rule.label,
          type:         rule.type === 'transfer' ? 'expense' : rule.type,
          amount:       rule.amount,
          frequency:    rule.frequency,
          day_of_week:  rule.day_of_week,
          day_of_month: rule.day_of_month,
          wallet_id:    rule.wallet_id,
          category_id:  rule.category_id,
          starts_at:    rule.starts_at,
          ends_at:      rule.ends_at ?? null,
          is_active:    rule.is_active,
        }
      : {
          type:      'expense',
          frequency: 'monthly',
          amount:    0,
          is_active: true,
          starts_at: new Date().toISOString().split('T')[0],
        },
  })

  const frequency = watch('frequency')

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      category_id:  data.category_id  || null,
      ends_at:      data.ends_at      || null,
      day_of_week:  data.frequency === 'weekly'  ? data.day_of_week  ?? null : null,
      day_of_month: data.frequency === 'monthly' ? data.day_of_month ?? null : null,
    }
    if (isEdit) {
      update(payload, { onSuccess: onClose })
    } else {
      create(payload, { onSuccess: onClose })
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6 m-4 max-h-[90vh] overflow-y-auto"
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
            <label className="text-sm font-medium">{t('label')}</label>
            <input
              {...register('label')}
              placeholder={t('label_placeholder')}
              className={INPUT_CLASS}
            />
            {errors.label && <p className="text-xs text-destructive">{t('label_required')}</p>}
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-medium">{t('type')}</label>
              <select {...register('type')} className={INPUT_CLASS}>
                <option value="expense">{t('type_expense')}</option>
                <option value="income">{t('type_income')}</option>
              </select>
            </div>

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
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-medium">{t('frequency')}</label>
              <select {...register('frequency')} className={INPUT_CLASS}>
                <option value="daily">{t('frequency_daily')}</option>
                <option value="weekly">{t('frequency_weekly')}</option>
                <option value="monthly">{t('frequency_monthly')}</option>
                <option value="yearly">{t('frequency_yearly')}</option>
              </select>
            </div>

            {frequency === 'weekly' && (
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm font-medium">{t('day_of_week')}</label>
                <select {...register('day_of_week', { valueAsNumber: true })} className={INPUT_CLASS}>
                  {[0, 1, 2, 3, 4, 5, 6].map(d => (
                    <option key={d} value={d}>{t(`day_of_week_${d}`)}</option>
                  ))}
                </select>
              </div>
            )}

            {frequency === 'monthly' && (
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm font-medium">{t('day_of_month')}</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  {...register('day_of_month', { valueAsNumber: true })}
                  className={INPUT_CLASS}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{t('wallet')}</label>
            <select {...register('wallet_id')} className={INPUT_CLASS}>
              <option value="">{t('wallet_placeholder')}</option>
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            {errors.wallet_id && <p className="text-xs text-destructive">{t('wallet_required')}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{t('category')}</label>
            <select {...register('category_id')} className={INPUT_CLASS}>
              <option value="">{t('category_none')}</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-medium">{t('starts_at')}</label>
              <input
                type="date"
                {...register('starts_at')}
                className={INPUT_CLASS}
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-medium">{t('ends_at')}</label>
              <input
                type="date"
                {...register('ends_at')}
                placeholder={t('ends_at_placeholder')}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('is_active')} className="rounded" />
            <span className="text-sm font-medium">{t('is_active')}</span>
          </label>

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

export { RecurringRuleModal }
