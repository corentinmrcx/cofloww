import { useState } from 'react'
import { Plus } from 'lucide-react'
import { WalletList } from '../features/wallet/components/WalletList'
import { WalletModal } from '../features/wallet/components/WalletModal'
import { useWallets } from '../features/wallet/hooks/useWallets'
import { useDeleteWallet } from '../features/wallet/hooks/useDeleteWallet'
import { useT } from '../components/T'
import { Skeleton } from '../components/ui/skeleton'
import type { Wallet } from '../features/wallet/types/wallet.types'
import trad from './trad.json'

const WalletPage = () => {
  const { data: wallets = [], isPending } = useWallets()
  const { mutate: deleteWallet } = useDeleteWallet()
  const [modalWallet, setModalWallet] = useState<Wallet | 'new' | null>(null)
  const t = useT(trad)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('wallet_title')}</h1>
        <button
          onClick={() => setModalWallet('new')}
          className="flex items-center justify-center size-9 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
          aria-label={t('wallet_new')}
        >
          <Plus size={18} />
        </button>
      </div>

      {isPending ? (
        <div className="rounded-xl border border-border overflow-hidden">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
              <Skeleton className="size-4 shrink-0" />
              <Skeleton className="size-9 rounded-lg shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-2.5 w-16" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <WalletList
          wallets={wallets}
          onEditClick={setModalWallet}
          onDeleteClick={wallet => deleteWallet(wallet.id)}
        />
      )}

      {modalWallet !== null && (
        <WalletModal
          wallet={modalWallet === 'new' ? undefined : modalWallet}
          onClose={() => setModalWallet(null)}
        />
      )}
    </div>
  )
}

export { WalletPage }
