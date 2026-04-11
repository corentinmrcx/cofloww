import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useDashboard } from '../features/dashboard/hooks/useDashboard'
import { MonthSummaryWidget }       from '../features/dashboard/components/MonthSummaryWidget'
import { WalletsWidget }            from '../features/dashboard/components/WalletsWidget'
import { BudgetsWidget }            from '../features/dashboard/components/BudgetsWidget'
import { InvestWidget }             from '../features/dashboard/components/InvestWidget'
import { RecentTransactionsWidget } from '../features/dashboard/components/RecentTransactionsWidget'
import { MiniBarChart }             from '../features/dashboard/components/MiniBarChart'
import { TransactionModal }         from '../features/transactions/components/TransactionModal'
import { useT } from '../components/T'

const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <div className={`bg-card border border-border rounded-xl animate-pulse ${className}`} />
)

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
            {/* Ligne 1 : Résumé du mois (large) + Mini barchart (étroit) */}
            <div className="lg:col-span-2">
              <MonthSummaryWidget current={data.current_month} prev={data.prev_month} />
            </div>
            <div className="lg:col-span-1">
              <InvestWidget data={data.investable} />
            </div>

            {/* Ligne 2 : Comptes (étroit) + Budgets (large) */}
            <div className="lg:col-span-1">
              <WalletsWidget wallets={data.wallets} />
            </div>
            <div className="lg:col-span-2">
              <BudgetsWidget budgets={data.top_budgets} />
            </div>

            {/* Ligne 3 : Derniers mouvements (large) + Tendance (étroit) */}
            <div className="lg:col-span-2">
              <RecentTransactionsWidget transactions={data.recent_transactions} />
            </div>
            <div className="lg:col-span-1">
              <MiniBarChart data={data.monthly_trend} />
            </div>
          </>
        )}
      </div>

      {showModal && <TransactionModal onClose={() => setShowModal(false)} />}
    </>
  )
}

export default DashboardPage
