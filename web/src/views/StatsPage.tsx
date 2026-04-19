import { useT } from '../components/T'
import { KpiCards }              from '../features/stats/components/KpiCards'
import { IncomeExpensesChart }   from '../features/stats/components/IncomeExpensesChart'
import { CategoryDonut }         from '../features/stats/components/CategoryDonut'
import { BalanceEvolutionChart } from '../features/stats/components/BalanceEvolutionChart'
import trad from './trad.json'

const StatsPage = () => {
  const t = useT(trad)
  return (
  <div className="flex flex-col gap-4">
    <h1 className="text-xl font-semibold">{t('stats_title')}</h1>

    <KpiCards />

    <IncomeExpensesChart />

    <BalanceEvolutionChart />

    <CategoryDonut />
  </div>
  )
}

export { StatsPage }
