import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useT } from '../../../../components/T'
import { Button } from '../../../../components/Button'
import { MoneyInput } from '../../../../components/Input'
import { useWallets } from '../../../wallet/hooks/useWallets'
import { useCreateGoal } from '../../hooks/useCreateGoal'
import { useUpdateGoal } from '../../hooks/useUpdateGoal'
import { walletLabel } from '../../../../lib/format'
import type { Goal } from '../../types/goal.types'
import trad from './trad.json'

const schema = z.object({
  name:           z.string().min(1),
  wallet_id:      z.string().uuid(),
  start_date:     z.string().min(1),
  end_date:       z.string().nullable().optional(),
  total_target:   z.number().int().min(1).nullable().optional(),
  monthly_target: z.number().int().min(1).nullable().optional(),
}).superRefine((data, ctx) => {
  if (!data.total_target && !data.monthly_target) {
    ctx.addIssue({ code: 'custom', path: ['total_target'], message: 'required' })
  }
})

type FormValues = z.infer<typeof schema>

const INPUT_CLASS =
  'h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

interface GoalModalProps {
  goal?: Goal
  onClose: () => void
}

const GoalModal = ({ goal, onClose }: GoalModalProps) => {
  const t = useT(trad)
  const isEdit = goal !== undefined
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const { data: wallets = [] } = useWallets()
  const { mutate: create, isPending: isCreating } = useCreateGoal()
  const { mutate: update, isPending: isUpdating } = useUpdateGoal(goal?.id ?? '')
  const isPending = isCreating || isUpdating

  const today = new Date().toISOString().split('T')[0]

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: isEdit ? {
      name:           goal.name,
      wallet_id:      goal.wallet.id,
      start_date:     goal.start_date,
      end_date:       goal.end_date ?? '',
      total_target:   goal.total_target ?? undefined,
      monthly_target: goal.monthly_target ?? undefined,
    } : {
      start_date: today,
      end_date:   '',
    },
  })

  const totalTarget   = watch('total_target')
  const monthlyTarget = watch('monthly_target')

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      color:          null,
      end_date:       data.end_date || null,
      total_target:   data.total_target   ?? null,
      monthly_target: data.monthly_target ?? null,
    }
    if (isEdit) {
      update(payload, { onSuccess: onClose })
    } else {
      create(payload, { onSuccess: onClose })
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-modal-title"
        className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg p-6 m-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="goal-modal-title" className="text-base font-semibold">
            {t(isEdit ? 'title_edit' : 'title_add')}
          </h2>
          <button
            ref={closeRef}
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

          {/* Nom */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="goal-name" className="text-sm font-medium">{t('name')}</label>
            <input
              id="goal-name"
              {...register('name')}
              placeholder={t('name_placeholder')}
              className={INPUT_CLASS}
              autoFocus={!isEdit}
            />
            {errors.name && <p className="text-xs text-destructive">{t('name_required')}</p>}
          </div>

          {/* Wallet cible */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="goal-wallet" className="text-sm font-medium">{t('wallet')}</label>
            <select id="goal-wallet" {...register('wallet_id')} className={INPUT_CLASS}>
              <option value="">{t('wallet_placeholder')}</option>
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{walletLabel(w)}</option>
              ))}
            </select>
            {errors.wallet_id && <p className="text-xs text-destructive">{t('wallet_required')}</p>}
          </div>

          {/* Dates */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label htmlFor="goal-start" className="text-sm font-medium">{t('start_date')}</label>
              <input id="goal-start" type="date" {...register('start_date')} className={INPUT_CLASS} />
              {errors.start_date && <p className="text-xs text-destructive">{t('date_required')}</p>}
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label htmlFor="goal-end" className="text-sm font-medium">{t('end_date')}</label>
              <input id="goal-end" type="date" {...register('end_date')} className={INPUT_CLASS} />
              <p className="text-xs text-muted-foreground">{t('end_date_hint')}</p>
            </div>
          </div>

          {/* Objectifs de montant */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-medium">{t('monthly_target')}</label>
              <MoneyInput
                value={monthlyTarget ?? 0}
                onChange={v => setValue('monthly_target', v > 0 ? v : null)}
              />
              <p className="text-xs text-muted-foreground">{t('monthly_target_hint')}</p>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-medium">{t('total_target')}</label>
              <MoneyInput
                value={totalTarget ?? 0}
                onChange={v => setValue('total_target', v > 0 ? v : null)}
              />
              <p className="text-xs text-muted-foreground">{t('total_target_hint')}</p>
            </div>
          </div>
          {errors.total_target && !totalTarget && !monthlyTarget && (
            <p className="text-xs text-destructive -mt-2">{t('target_required')}</p>
          )}

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

export { GoalModal }
