import { useMemo } from 'react'
import { useLangStore } from '../../stores/langStore'
import type { Lang, TranslationDict } from '../../types'

export const useT = (dict: TranslationDict | null) => {
  const lang = useLangStore(s => s.lang) as Lang
  return useMemo(
    () => (key: string): string => dict?.[lang]?.[key] ?? key,
    [dict, lang],
  )
}

type TProps = {
  dict: TranslationDict
  children: string
}

const T = ({ dict, children }: TProps) => {
  const t = useT(dict)
  return <>{t(children)}</>
}

export { T }
