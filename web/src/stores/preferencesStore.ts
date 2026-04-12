import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type PreferencesStore = {
  currency:   string
  dateFormat: string
  timezone:   string
  setPreferences: (prefs: Partial<{ currency: string; dateFormat: string; timezone: string }>) => void
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      currency:       'EUR',
      dateFormat:     'DD/MM/YYYY',
      timezone:       'Europe/Paris',
      setPreferences: (prefs) => set(prefs),
    }),
    { name: 'cofloww-preferences' },
  ),
)
