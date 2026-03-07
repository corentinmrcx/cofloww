import { useLangStore } from '../../stores/langStore'
import { Button } from '../Button'
import type { Lang } from '../../types'

const langs: { value: Lang; label: string }[] = [
  { value: 'fr', label: 'FR' },
  { value: 'en', label: 'EN' },
]

const LangSelector = () => {
  const { lang, setLang } = useLangStore()

  return (
    <div className="flex items-center gap-1">
      {langs.map(({ value, label }) => (
        <Button
          key={value}
          variant={lang === value ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setLang(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}

export { LangSelector }
