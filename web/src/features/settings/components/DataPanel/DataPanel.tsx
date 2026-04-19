import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Download, Trash2, AlertTriangle } from 'lucide-react'
import { useExportData, useDeleteAccount } from '../../hooks/useSettings'
import { useT } from '../../../../components/T'
import trad from './trad.json'

const DataPanel = () => {
  const { mutate: exportData,    isPending: exporting } = useExportData()
  const { mutate: deleteAccount, isPending: deleting }  = useDeleteAccount()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const t = useT(trad)

  const [confirmStep, setConfirmStep] = useState<0 | 1 | 2>(0)
  const [password, setPassword]       = useState('')
  const [deleteError, setDeleteError] = useState('')

  const handleDeleteConfirm = () => {
    setDeleteError('')
    deleteAccount(password, {
      onSuccess: () => {
        queryClient.clear()
        navigate('/login')
      },
      onError: () => setDeleteError(t('pwd_error')),
    })
  }

  return (
    <div className="flex flex-col gap-2">

      <div className="divide-y divide-border">
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-muted-foreground">
              <Download size={16} />
            </div>
            <div>
              <p className="text-sm font-medium">{t('export_title')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t('export_desc')}</p>
            </div>
          </div>
          <button
            onClick={() => exportData()}
            disabled={exporting}
            className="shrink-0 h-8 px-3 rounded-md text-xs font-medium transition-colors disabled:opacity-50 border border-border hover:bg-muted"
          >
            {exporting ? t('loading') : t('export_btn')}
          </button>
        </div>
      </div>

      {/* Suppression compte — 3 étapes */}
      <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle size={15} />
          <p className="text-sm font-semibold">{t('danger_title')}</p>
        </div>

        {confirmStep === 0 && (
          <>
            <p className="text-xs text-muted-foreground">
              {t('delete_warning')}
            </p>
            <button
              onClick={() => setConfirmStep(1)}
              className="self-start h-8 px-3 rounded-md text-xs font-medium border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <Trash2 size={12} className="inline mr-1.5" />
              {t('delete_btn')}
            </button>
          </>
        )}

        {confirmStep === 1 && (
          <>
            <p className="text-xs text-muted-foreground">
              {t('delete_confirm')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmStep(2)}
                className="h-8 px-3 rounded-md text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                {t('delete_yes')}
              </button>
              <button
                onClick={() => setConfirmStep(0)}
                className="h-8 px-3 rounded-md text-xs font-medium border border-border hover:bg-muted transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </>
        )}

        {confirmStep === 2 && (
          <>
            <p className="text-xs text-muted-foreground">
              {t('delete_pwd_hint')}
            </p>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t('pwd_placeholder')}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleDeleteConfirm}
                disabled={!password || deleting}
                className="h-8 px-3 rounded-md text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 transition-colors"
              >
                {deleting ? t('deleting') : t('delete_final')}
              </button>
              <button
                onClick={() => { setConfirmStep(0); setPassword(''); setDeleteError('') }}
                className="h-8 px-3 rounded-md text-xs font-medium border border-border hover:bg-muted transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export { DataPanel }
