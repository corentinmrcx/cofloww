import { useState } from 'react'
import { WalletList } from '../features/wallet/components/WalletList'
import { WalletModal } from '../features/wallet/components/WalletModal'
import { useWallets } from '../features/wallet/hooks/useWallets'
import { useDeleteWallet } from '../features/wallet/hooks/useDeleteWallet'
import type { Wallet } from '../features/wallet/types/wallet.types'

const WalletPage = () => {
  const { data: wallets = [], isPending } = useWallets()
  const { mutate: deleteWallet } = useDeleteWallet()
  const [modalWallet, setModalWallet] = useState<Wallet | 'new' | null>(null)

  if (isPending) {
    return <div className="text-sm text-muted-foreground">Chargement…</div>
  }

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      <WalletList
        wallets={wallets}
        onAddClick={() => setModalWallet('new')}
        onEditClick={setModalWallet}
        onDeleteClick={wallet => deleteWallet(wallet.id)}
      />

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
