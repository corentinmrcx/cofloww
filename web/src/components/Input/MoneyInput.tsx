import { useState } from 'react'
import { cn } from '../../lib/utils'
import { usePreferencesStore } from '../../stores/preferencesStore'

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CHF: 'Fr',
  CAD: 'CA$',
}

const INPUT_CLASS =
  'h-9 w-full rounded-md border border-input bg-transparent pl-3 pr-10 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

const centsToDisplay = (cents: number): string =>
  cents === 0 ? '' : (cents / 100).toFixed(2).replace('.', ',')

const displayToCents = (raw: string): number => {
  const parsed = parseFloat(raw.replace(',', '.').replace(/[^0-9.]/g, ''))
  return isNaN(parsed) ? 0 : Math.round(parsed * 100)
}

interface MoneyInputProps {
  value: number
  onChange: (cents: number) => void
  id?: string
  placeholder?: string
  className?: string
}

const MoneyInput = ({ value, onChange, id, placeholder = '0,00', className }: MoneyInputProps) => {
  const [localDisplay, setLocalDisplay] = useState('')
  const [focused, setFocused] = useState(false)
  const { currency } = usePreferencesStore()
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency

  const handleFocus = () => {
    setLocalDisplay(centsToDisplay(value))
    setFocused(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setLocalDisplay(raw)
    onChange(displayToCents(raw))
  }

  const handleBlur = () => {
    setFocused(false)
    onChange(displayToCents(localDisplay))
  }

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={focused ? localDisplay : centsToDisplay(value)}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(INPUT_CLASS, className)}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
        {symbol}
      </span>
    </div>
  )
}

export { MoneyInput }
