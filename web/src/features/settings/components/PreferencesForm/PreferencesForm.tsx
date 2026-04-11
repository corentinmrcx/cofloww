import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../../auth/hooks/useAuth'
import { useUpdatePreferences } from '../../hooks/useSettings'
import { useTheme } from '../../../../hooks/useTheme'
import { useLangStore } from '../../../../stores/langStore'

const SELECT = 'h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
const BTN    = 'h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50'

interface FormValues {
  language:    string
  date_format: string
  theme:       string
  currency:    string
  timezone:    string
}

const PreferencesForm = () => {
  const { user }    = useAuth()
  const { setTheme } = useTheme()
  const { setLang }  = useLangStore()
  const { mutate, isPending, isSuccess } = useUpdatePreferences()

  const form = useForm<FormValues>({
    defaultValues: {
      language:    user?.settings?.language    ?? 'fr',
      date_format: user?.settings?.date_format ?? 'DD/MM/YYYY',
      theme:       user?.settings?.theme       ?? 'system',
      currency:    user?.currency              ?? 'EUR',
      timezone:    user?.timezone              ?? 'Europe/Paris',
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        language:    user.settings?.language    ?? 'fr',
        date_format: user.settings?.date_format ?? 'DD/MM/YYYY',
        theme:       user.settings?.theme       ?? 'system',
        currency:    user.currency              ?? 'EUR',
        timezone:    user.timezone              ?? 'Europe/Paris',
      })
    }
  }, [user?.id])

  const onSubmit = (data: FormValues) => {
    mutate(data, {
      onSuccess: () => {
        setLang(data.language as 'fr' | 'en')
        if (data.theme !== 'system') setTheme(data.theme as 'light' | 'dark')
      },
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Langue</label>
          <select {...form.register('language')} className={SELECT}>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Format de date</label>
          <select {...form.register('date_format')} className={SELECT}>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Thème</label>
          <select {...form.register('theme')} className={SELECT}>
            <option value="system">Système</option>
            <option value="light">Clair</option>
            <option value="dark">Sombre</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Devise</label>
          <select {...form.register('currency')} className={SELECT}>
            <option value="EUR">EUR — €</option>
            <option value="USD">USD — $</option>
            <option value="GBP">GBP — £</option>
            <option value="CHF">CHF — Fr</option>
            <option value="CAD">CAD — CA$</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Fuseau horaire</label>
          <select {...form.register('timezone')} className={SELECT}>
            <option value="Europe/Paris">Europe/Paris</option>
            <option value="Europe/London">Europe/London</option>
            <option value="America/New_York">America/New_York</option>
            <option value="America/Los_Angeles">America/Los_Angeles</option>
            <option value="Asia/Tokyo">Asia/Tokyo</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={isPending} className={BTN}>
          {isPending ? 'Enregistrement…' : 'Enregistrer les préférences'}
        </button>
        {isSuccess && <p className="text-xs text-emerald-600 dark:text-emerald-400">Sauvegardé ✓</p>}
      </div>
    </form>
  )
}

export { PreferencesForm }
