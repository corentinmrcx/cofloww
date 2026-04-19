import { useEffect } from 'react'
import { Outlet } from 'react-router'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { usePreferencesStore } from '../../stores/preferencesStore'
import { useLangStore } from '../../stores/langStore'

/** Sync des préférences backend → stores locaux à chaque chargement du user */
const PreferencesSync = () => {
  const { user } = useAuth()
  const { setPreferences } = usePreferencesStore()
  const { setLang }        = useLangStore()

  useEffect(() => {
    if (!user) return
    setPreferences({
      currency:   user.currency   ?? 'EUR',
      dateFormat: user.settings?.date_format ?? 'DD/MM/YYYY',
      timezone:   user.timezone   ?? 'Europe/Paris',
    })
    if (user.settings?.language) {
      setLang(user.settings.language as 'fr' | 'en')
    }
  // setPreferences and setLang are stable Zustand setters, user.id tracks the actual user change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, setPreferences, setLang])

  return null
}

const AppLayout = () => {
  return (
    <div className="flex h-screen bg-background">
      <PreferencesSync />
      <Sidebar />

      <div className="flex flex-col flex-1 md:ml-64 min-w-0">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  )
}

export { AppLayout }
