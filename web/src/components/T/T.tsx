import { useMemo } from 'react'
import { useLangStore } from '../../stores/langStore'
import type { Lang, TranslationDict } from '../../types'

const allTrad = import.meta.glob<TranslationDict>('/src/**/trad.json', { eager: true })

const getDict = (moduleUrl: string): TranslationDict | null => {
  try {
    const pathname = new URL(moduleUrl).pathname
    const dir = pathname.substring(0, pathname.lastIndexOf('/'))
    return allTrad[`${dir}/trad.json`] ?? null
  } catch {
    return null
  }
}

export const useT = (moduleUrl: string) => {
  const lang = useLangStore(s => s.lang) as Lang
  const dict = useMemo(() => getDict(moduleUrl), [moduleUrl])
  return useMemo(
    () => (key: string): string => dict?.[lang]?.[key] ?? key,
    [dict, lang],
  )
}

type TProps = {
  url: string
  children: string
}

const T = ({ url, children }: TProps) => {
  const t = useT(url)
  return <>{t(children)}</>
}

export { T }
