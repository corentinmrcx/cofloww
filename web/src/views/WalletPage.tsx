import { useState } from 'react'
import { Plus } from 'lucide-react'
import { WalletList } from '../features/wallet/components/WalletList'
import { WalletModal } from '../features/wallet/components/WalletModal'
import { useWallets } from '../features/wallet/hooks/useWallets'
import { useDeleteWallet } from '../features/wallet/hooks/useDeleteWallet'
import type { Wallet } from '../features/wallet/types/wallet.types'

const WalletPage = () => {
  const { data: wallets = [], isPending } = useWallets()
  const { mutate: deleteWallet } = useDeleteWallet()
  const [modalWallet, setModalWallet] = useState<Wallet | 'new' | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Portefeuilles</h1>
        <button
          onClick={() => setModalWallet('new')}
          className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
          aria-label="Nouveau portefeuille"
        >
          <Plus size={18} />
        </button>
      </div>

      {isPending ? (
        <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
          Chargement…
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

export default WalletPage
