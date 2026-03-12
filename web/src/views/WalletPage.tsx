import { useState } from 'react'
import { WalletList } from '../features/wallet/components/WalletList'
import { WalletAddModal } from '../features/wallet/components/WalletAddModal'
import { useWallets } from '../features/wallet/hooks/useWallets'

const WalletPage = () => {
  const { data: wallets = [], isPending } = useWallets()
  const [showAdd, setShowAdd] = useState(false)

  if (isPending) {
    return <div className="text-sm text-muted-foreground">Chargement…</div>
  }

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      <WalletList wallets={wallets} onAddClick={() => setShowAdd(true)} />
      {showAdd && <WalletAddModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}

export default WalletPage
