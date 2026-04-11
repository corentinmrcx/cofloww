import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useT } from '../../../../components/T'
import { Button } from '../../../../components/Button'
import { MoneyInput } from '../../../../components/Input'
import { CategoryMultiSelector } from '../../../category/components/CategoryMultiSelector'
import { useCreateBudget } from '../../hooks/useCreateBudget'
import { useUpdateBudget } from '../../hooks/useUpdateBudget'
import type { Budget } from '../../types/budget.types'

const schema = z.object({
  category_ids:        z.array(z.string().min(1)).min(1),
  amount:              z.number().int().min(1),
  alert_threshold_pct: z.number().int().min(0).max(100),
  apply_all_months:    z.boolean(),
})

type FormValues = z.infer<typeof schema>

const INPUT_CLASS = 'h-9 w-full rounded-md border border-input bg-background text-foreground px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

interface BudgetModalProps {
  budget?: Budget
  month: number
  year: number
  onClose: () => void
}

const BudgetModal = ({ budget, month, year, onClose }: BudgetModalProps) => {
  const t = useT(import.meta.url)
  const isEdit = budget !== undefined

  const { mutate: create, isPending: isCreating } = useCreateBudget()
  const { mutate: update, isPending: isUpdating } = useUpdateBudget(budget?.id ?? '')
  const isPending = isCreating || isUpdating

  const { handleSubmit, control, register, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: isEdit
      ? {
          category_ids:        budget.categories.map(c => c.id),
          amount:              budget.amount,
          alert_threshold_pct: budget.alert_threshold_pct,
          apply_all_months:    budget.period === 'yearly',
        }
      : {
          category_ids:        [],
          amount:              0,
          alert_threshold_pct: 80,
          apply_all_months:    false,
        },
  })

  const onSubmit = (data: FormValues) => {
    const payload = {
      category_ids:        data.category_ids,
      amount:              data.amount,
      alert_threshold_pct: data.alert_threshold_pct,
      period:              data.apply_all_months ? ('yearly' as const) : ('monthly' as const),
      month:               data.apply_all_months ? null : month,
      year,
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
            <label className="text-sm font-medium">{t('categories')}</label>
            <Controller
              name="category_ids"
              control={control}
              render={({ field }: { field: { value: string[]; onChange: (v: string[]) => void } }) => (
                <CategoryMultiSelector value={field.value} onChange={field.onChange} />
              )}
            />
            {errors.category_ids && (
              <p className="text-xs text-destructive">{t('categories_required')}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
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

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{t('alert_threshold')}</label>
            <input
              type="number"
              min={0}
              max={100}
              {...register('alert_threshold_pct', { valueAsNumber: true })}
              className={INPUT_CLASS}
            />
          </div>

          {!isEdit && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('apply_all_months')} className="rounded" />
              <span className="text-sm">{t('apply_all_months')}</span>
            </label>
          )}

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

export { BudgetModal }
