import { useNavigate } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { useT } from '../../../../components/T'
import { useFormatters } from '../../../../lib/format'
import type { InvestableSummary } from '../../types/dashboard.types'

interface InvestWidgetProps {
  data: InvestableSummary
}

const InvestWidget = ({ data }: InvestWidgetProps) => {
  const navigate = useNavigate()
  const t = useT(import.meta.url)
  const { formatAmountShort: fmt } = useFormatters()

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <p className="text-sm font-semibold">{t('title')}</p>
        <button
          onClick={() => navigate('/investments')}
          aria-label={t('configure_label')}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
        >
          {t('configure')} <ChevronRight size={13} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">{t('to_invest')}</p>
          <p className="text-2xl font-bold tabular-nums text-income">
            {fmt(data.amount)}
          </p>
          {data.source_wallet && (
            <p className="text-sm text-muted-foreground mt-1.5">
              {t('from')}{data.source_wallet.name}
            </p>
          )}
        </div>
      </div>

    </div>
  )
}

export { InvestWidget }
