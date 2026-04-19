import { useState } from 'react'
import { ProfileForm }     from '../features/settings/components/ProfileForm'
import { PreferencesForm } from '../features/settings/components/PreferencesForm'
import { DataPanel }       from '../features/settings/components/DataPanel'
import { useT } from '../components/T'
import { cn } from '../lib/utils'
import trad from './trad.json'

type Tab = 'profil' | 'preferences' | 'donnees'

const SettingsPage = () => {
  const [tab, setTab] = useState<Tab>('profil')
  const t = useT(trad)

  const TABS: { id: Tab; label: string }[] = [
    { id: 'profil',       label: t('settings_tab_profile') },
    { id: 'preferences',  label: t('settings_tab_prefs') },
    { id: 'donnees',      label: t('settings_tab_data') },
  ]

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold">{t('settings_title')}</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 h-8 rounded-md text-sm font-medium transition-colors',
              tab === t.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="bg-card border border-border rounded-xl p-6">
        {tab === 'profil'      && <ProfileForm />}
        {tab === 'preferences' && <PreferencesForm />}
        {tab === 'donnees'     && <DataPanel />}
      </div>
    </div>
  )
}

export { SettingsPage }
