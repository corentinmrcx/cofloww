import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useDebounce } from '../../../../hooks/useDebounce'
import { useT } from '../../../../components/T'
import trad from './trad.json'

interface TransactionSearchProps {
  value: string
  onChange: (value: string | undefined) => void
}

const TransactionSearch = ({ value, onChange }: TransactionSearchProps) => {
  const t                 = useT(trad)
  const [input, setInput] = useState(value)
  const debounced         = useDebounce(input, 300)

  // Pousse la recherche débouncée dans l'URL
  useEffect(() => {
    onChange(debounced.trim() || undefined)
  }, [debounced]) // onChange stable (setSearchParams)

  // Resync si effacement externe (ex: reset des filtres)
  useEffect(() => {
    if (value === '') setInput('')
  }, [value])

  return (
    <div className="relative flex-1 md:flex-none">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <input
        type="search"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={t('search_placeholder')}
        aria-label={t('search_placeholder')}
        className="h-9 w-full md:w-64 rounded-md border border-input bg-background pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring [&::-webkit-search-cancel-button]:appearance-none"
      />
      {input && (
        <button
          type="button"
          onClick={() => setInput('')}
          aria-label={t('search_clear')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export { TransactionSearch }
