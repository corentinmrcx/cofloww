import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Plus, BarChart2 } from 'lucide-react'
import { useDashboard } from '../features/dashboard/hooks/useDashboard'
import { MonthSummaryWidget }       from '../features/dashboard/components/MonthSummaryWidget'
import { WalletsWidget }            from '../features/dashboard/components/WalletsWidget'
import { BudgetsWidget }            from '../features/dashboard/components/BudgetsWidget'
import { InvestWidget }             from '../features/dashboard/components/InvestWidget'
import { RecentTransactionsWidget } from '../features/dashboard/components/RecentTransactionsWidget'
import { MiniBarChart }             from '../features/dashboard/components/MiniBarChart'
import { TransactionModal }         from '../features/transactions/components/TransactionModal'
import { useT } from '../components/T'
import { Skeleton } from '../components/ui/skeleton'
import { cn } from '../lib/utils'

const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <Skeleton className={cn('rounded-xl', className)} />
)

// Wrapper qui rend toute la card cliquable.
// Si le clic vient d'un élément interactif (a, button, input…) → on laisse faire.
// Sinon → navigation vers `to`.
const CardLink = ({ to, children, className = '' }: { to: string; children: React.ReactNode; className?: string }) => {
  const navigate = useNavigate()
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.closest('a, button, input, select, textarea, [role="button"]')) return
    navigate(to)
  }
  return (
    <div
      className={cn('cursor-pointer rounded-xl hover:shadow-md transition-shadow', className)}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}

const DashboardPage = () => {
  const { data, isLoading } = useDashboard()
  const [showModal, setShowModal] = useState(false)
  const t = useT(import.meta.url)

  return (
    <>
      {/* Layout bento : 1 col mobile → 3 cols desktop */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* CTA — toujours pleine largeur */}
        <div className="lg:col-span-3">
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm"
          >
            <Plus size={18} strokeWidth={2.5} />
            {t('dashboard_new_tx')}
          </button>
        </div>

        {isLoading || !data ? (
          <>
            <SkeletonCard className="h-40 lg:col-span-2" />
            <SkeletonCard className="h-40" />
            <SkeletonCard className="h-52" />
            <SkeletonCard className="h-52 lg:col-span-2" />
            <SkeletonCard className="h-44" />
            <SkeletonCard className="h-44 lg:col-span-2" />
          </>
        ) : (
          <>
            {/* Ligne 1 : Résumé du mois (large) + Investissements (étroit) */}
            <CardLink to="/transactions" className="lg:col-span-2">
              <MonthSummaryWidget current={data.current_month} prev={data.prev_month} />
            </CardLink>
            <CardLink to="/investments" className="lg:col-span-1">
              <InvestWidget data={data.investable} />
            </CardLink>

            {/* Ligne 2 : Comptes (étroit) + Budgets (large) */}
            <CardLink to="/wallets" className="lg:col-span-1">
              <WalletsWidget wallets={data.wallets} />
            </CardLink>
            <CardLink to="/budget" className="lg:col-span-2">
              <BudgetsWidget budgets={data.top_budgets} />
            </CardLink>

            {/* Ligne 3 : Derniers mouvements (large) + Tendance (étroit) */}
            <CardLink to="/transactions" className="lg:col-span-2">
              <RecentTransactionsWidget transactions={data.recent_transactions} />
            </CardLink>
            <CardLink to="/stats" className="lg:col-span-1">
              <MiniBarChart data={data.monthly_trend} />
            </CardLink>

            {/* Teaser stats */}
            <div className="lg:col-span-3">
              <Link
                to="/stats"
                className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BarChart2 size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{t('dashboard_stats_title')}</p>
                  <p className="text-xs text-muted-foreground">{t('dashboard_stats_desc')}</p>
                </div>
                <span className="text-sm text-primary font-medium shrink-0">
                  {t('dashboard_stats_cta')}
                </span>
              </Link>
            </div>
          </>
        )}
      </div>

      {showModal && <TransactionModal onClose={() => setShowModal(false)} />}
    </>
  )
}

export { DashboardPage }
