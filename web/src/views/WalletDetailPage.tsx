import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { ChevronLeft, Pencil, Archive } from 'lucide-react'
import { useWallet } from '../features/wallet/hooks/useWallet'
import { useDeleteWallet } from '../features/wallet/hooks/useDeleteWallet'
import { useTransactions } from '../features/transactions/hooks/useTransactions'
import { WalletModal } from '../features/wallet/components/WalletModal'
import { TransactionTable } from '../features/transactions/components/TransactionTable'
import { ActionMenu } from '../components/ActionMenu'
import { ICONS } from '../components/IconPicker'
import { TYPE_DEFAULT_ICONS } from '../features/wallet/lib/wallet-icons'

const formatBalance = (cents: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100)

const WalletDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: wallet, isPending: walletPending } = useWallet(id ?? '')
  const { mutate: deleteWallet } = useDeleteWallet()
  const [showEdit, setShowEdit] = useState(false)
  const [page, setPage] = useState(1)

  const { data: txResult, isPending: txPending } = useTransactions({
    wallet_id: id,
    page,
    per_page: 10,
  })

  if (walletPending) {
    return <div className="text-sm text-muted-foreground p-6">Chargement…</div>
  }

  if (!wallet) {
    return <div className="text-sm text-muted-foreground p-6">Portefeuille introuvable.</div>
  }

  const Icon = (wallet.icon && ICONS[wallet.icon]) || TYPE_DEFAULT_ICONS[wallet.type]

  const handleArchive = () => {
    deleteWallet(wallet.id, { onSuccess: () => navigate('/wallets') })
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 flex flex-col gap-6">

      {/* Topbar */}
      <div className="flex items-center justify-between">
        <Link
          to="/wallets"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={16} />
          Portefeuilles
        </Link>

        <ActionMenu
          items={[
            { label: 'Modifier',  icon: Pencil,  onClick: () => setShowEdit(true) },
            { label: 'Archiver',  icon: Archive, onClick: handleArchive, destructive: true },
          ]}
        />
      </div>

      {/* Hero — solde */}
      <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: wallet.color + '28' }}
        >
          <Icon size={22} style={{ color: wallet.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground truncate">
            {wallet.institution ?? wallet.type}
          </p>
          <p className="text-lg font-semibold truncate">{wallet.name}</p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-xs text-muted-foreground mb-0.5">Solde</p>
          <p className="text-2xl font-bold tabular-nums">{formatBalance(wallet.balance)}</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <p className="text-sm font-semibold">Transactions</p>
        </div>
        <div className="px-2">
          <TransactionTable
            result={txResult}
            isPending={txPending}
            page={page}
            onPageChange={setPage}
          />
        </div>
      </div>

      {showEdit && (
        <WalletModal wallet={wallet} onClose={() => setShowEdit(false)} />
      )}
    </div>
  )
}

export default WalletDetailPage
