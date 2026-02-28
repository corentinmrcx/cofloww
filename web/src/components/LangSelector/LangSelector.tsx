import { useLangStore } from '../../stores/langStore'
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
        <button
          key={value}
          onClick={() => setLang(value)}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            lang === value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export { LangSelector }
