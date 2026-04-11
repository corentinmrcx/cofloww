import { useState } from 'react'
import { Download, Trash2, AlertTriangle } from 'lucide-react'
import { useExportData, useDeleteAccount } from '../../hooks/useSettings'
import { useLogout } from '../../../auth/hooks/useLogout'

const DangerRow = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  variant = 'default',
  onClick,
  loading,
}: {
  icon: React.ElementType
  title: string
  description: string
  actionLabel: string
  variant?: 'default' | 'danger'
  onClick: () => void
  loading?: boolean
}) => (
  <div className="flex items-center justify-between gap-4 py-4">
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 ${variant === 'danger' ? 'text-destructive' : 'text-muted-foreground'}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
    <button
      onClick={onClick}
      disabled={loading}
      className={`shrink-0 h-8 px-3 rounded-md text-xs font-medium transition-colors disabled:opacity-50 ${
        variant === 'danger'
          ? 'border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground'
          : 'border border-border hover:bg-muted'
      }`}
    >
      {loading ? 'En cours…' : actionLabel}
    </button>
  </div>
)

const DataPanel = () => {
  const { mutate: exportData,    isPending: exporting } = useExportData()
  const { mutate: deleteAccount, isPending: deleting }  = useDeleteAccount()
  const { mutate: logout }                              = useLogout()

  // Confirmation suppression compte
  const [confirmStep, setConfirmStep] = useState<0 | 1 | 2>(0)
  const [password, setPassword]       = useState('')
  const [deleteError, setDeleteError] = useState('')

  const handleDeleteConfirm = () => {
    setDeleteError('')
    deleteAccount(password, {
      onSuccess: () => { logout() },
      onError:   () => setDeleteError('Mot de passe incorrect'),
    })
  }

  return (
    <div className="flex flex-col gap-2">

      <div className="divide-y divide-border">
        <DangerRow
          icon={Download}
          title="Exporter mes données"
          description="Télécharger toutes vos données en JSON (wallets, transactions, budgets…)"
          actionLabel="Exporter"
          onClick={() => exportData()}
          loading={exporting}
        />
      </div>

      {/* Suppression compte — 3 étapes */}
      <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle size={15} />
          <p className="text-sm font-semibold">Zone de danger</p>
        </div>

        {confirmStep === 0 && (
          <>
            <p className="text-xs text-muted-foreground">
              La suppression de votre compte est <strong>irréversible</strong>. Toutes vos données seront effacées définitivement.
            </p>
            <button
              onClick={() => setConfirmStep(1)}
              className="self-start h-8 px-3 rounded-md text-xs font-medium border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <Trash2 size={12} className="inline mr-1.5" />
              Supprimer mon compte
            </button>
          </>
        )}

        {confirmStep === 1 && (
          <>
            <p className="text-xs text-muted-foreground">
              Êtes-vous sûr ? Cette action est définitive et ne peut pas être annulée.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmStep(2)}
                className="h-8 px-3 rounded-md text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                Oui, supprimer
              </button>
              <button
                onClick={() => setConfirmStep(0)}
                className="h-8 px-3 rounded-md text-xs font-medium border border-border hover:bg-muted transition-colors"
              >
                Annuler
              </button>
            </div>
          </>
        )}

        {confirmStep === 2 && (
          <>
            <p className="text-xs text-muted-foreground">
              Saisissez votre mot de passe pour confirmer la suppression définitive.
            </p>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleDeleteConfirm}
                disabled={!password || deleting}
                className="h-8 px-3 rounded-md text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Suppression…' : 'Confirmer la suppression'}
              </button>
              <button
                onClick={() => { setConfirmStep(0); setPassword(''); setDeleteError('') }}
                className="h-8 px-3 rounded-md text-xs font-medium border border-border hover:bg-muted transition-colors"
              >
                Annuler
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export { DataPanel }
