import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang } from '../types'

type LangStore = {
  lang: Lang
  setLang: (lang: Lang) => void
}

export const useLangStore = create<LangStore>()(
  persist(
    (set) => ({
      lang: 'fr',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'cofloww-lang' },
  ),
)
