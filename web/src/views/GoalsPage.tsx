import { useState } from 'react'
import { Plus, Target } from 'lucide-react'
import { useGoals } from '../features/goal/hooks/useGoals'
import { useDeleteGoal } from '../features/goal/hooks/useDeleteGoal'
import { GoalCard } from '../features/goal/components/GoalCard'
import { GoalModal } from '../features/goal/components/GoalModal'
import { useT } from '../components/T'
import { Skeleton } from '../components/ui/skeleton'
import type { Goal } from '../features/goal/types/goal.types'
import trad from './trad.json'

const GoalsPage = () => {
  const { data: goals = [], isPending } = useGoals()
  const { mutate: deleteGoal } = useDeleteGoal()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState<Goal | undefined>()
  const t = useT(trad)

  const handleEdit  = (goal: Goal) => { setEditing(goal); setShowModal(true) }
  const handleClose = () => { setEditing(undefined); setShowModal(false) }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('goals_title')}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center size-9 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
          aria-label={t('goals_new')}
        >
          <Plus size={18} />
        </button>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border py-16 text-muted-foreground">
          <Target size={28} className="opacity-30" />
          <p className="text-sm">{t('goals_empty')}</p>
          <p className="text-xs opacity-60">{t('goals_create_first')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={() => handleEdit(goal)}
              onDelete={() => deleteGoal(goal.id)}
            />
          ))}
        </div>
      )}

      {showModal && <GoalModal goal={editing} onClose={handleClose} />}
    </div>
  )
}

export { GoalsPage }
