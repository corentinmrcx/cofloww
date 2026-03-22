import { useEffect, useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '../../../../lib/utils'
import { useT } from '../../../../components/T'
import { useTags } from '../../hooks/useTags'
import { useCreateTag } from '../../hooks/useCreateTag'

const TAG_COLORS = [
  '#F97316', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
  '#22C55E', '#14B8A6', '#64748B', '#F59E0B', '#06B6D4',
]

const getRandomColor = () => TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]

interface TagInputProps {
  value: string[]
  onChange: (ids: string[]) => void
}

const TagInput = ({ value, onChange }: TagInputProps) => {
  const t = useT(import.meta.url)
  const { data: tags = [] } = useTags()
  const { mutate: createTag, isPending: isCreating } = useCreateTag()

  const [inputValue, setInputValue] = useState('')
  const [open, setOpen] = useState(false)

  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setInputValue('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedTags = tags.filter(tag => value.includes(tag.id))

  const suggestions = tags.filter(
    tag =>
      !value.includes(tag.id) &&
      (inputValue === '' || tag.name.toLowerCase().includes(inputValue.toLowerCase())),
  )

  const exactMatch = tags.some(tag => tag.name.toLowerCase() === inputValue.toLowerCase())

  const showDropdown = open && (suggestions.length > 0 || (inputValue.trim() !== '' && !exactMatch))

  const removeTag = (id: string) => {
    onChange(value.filter(v => v !== id))
  }

  const addTag = (id: string) => {
    onChange([...value, id])
    setInputValue('')
    setOpen(false)
    inputRef.current?.focus()
  }

  const handleCreate = () => {
    createTag(
      { name: inputValue.trim(), color: getRandomColor() },
      {
        onSuccess: created => {
          onChange([...value, created.id])
          setInputValue('')
          setOpen(false)
          inputRef.current?.focus()
        },
      },
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1].id)
    }
    if (e.key === 'Escape') {
      setOpen(false)
      setInputValue('')
    }
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      if (suggestions.length > 0 && inputValue !== '') {
        addTag(suggestions[0].id)
      } else if (!exactMatch) {
        handleCreate()
      }
    }
  }

  return (
    <div ref={ref} className="relative">
      <div
        className={cn(
          'flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 cursor-text',
          'focus-within:ring-1 focus-within:ring-ring',
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {selectedTags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: tag.color ?? '#64748B' }}
          >
            {tag.name}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                removeTag(tag.id)
              }}
              className="hover:opacity-70 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? t('placeholder') : ''}
          className="min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {showDropdown && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-48 rounded-md border border-border bg-popover shadow-md">
          <div className="max-h-48 overflow-y-auto py-1">
            {suggestions.map(tag => (
              <button
                key={tag.id}
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => addTag(tag.id)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: tag.color ?? '#64748B' }}
                />
                {tag.name}
              </button>
            ))}

            {inputValue.trim() && !exactMatch && (
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={handleCreate}
                disabled={isCreating}
                className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-sm text-primary hover:bg-accent disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {t('create_label')} &quot;{inputValue}&quot;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TagInput
