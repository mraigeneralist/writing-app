import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Plus, X } from 'lucide-react'
import {
  useCategories,
  useCreateCategory,
} from '@/lib/queries/categories'
import { DEFAULT_SWATCH, dotStyle } from '@/lib/category-colors'
import { CategoryPill } from './CategoryPill'
import { ColorPicker } from './ColorPicker'

interface Props {
  value: string | null
  onChange: (categoryId: string | null) => void
  placeholder?: string
}

// A combobox, never a fixed dropdown: typing filters existing categories; if
// nothing matches, the last row is "create '<typed>'" which opens the swatch
// picker. The selected category shows as a colored pill inside the field.
export function CategoryCombobox({
  value,
  onChange,
  placeholder = 'choose a category',
}: Props) {
  const { data: categories = [] } = useCategories()
  const createCategory = useCreateCategory()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [newColor, setNewColor] = useState(DEFAULT_SWATCH.hex)
  const rootRef = useRef<HTMLDivElement>(null)

  const selected = categories.find((c) => c.id === value) ?? null

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((c) => c.name.toLowerCase().includes(q))
  }, [categories, query])

  const exactMatch = categories.some(
    (c) => c.name.toLowerCase() === query.trim().toLowerCase(),
  )
  const canCreate = query.trim().length > 0 && !exactMatch

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  function close() {
    setOpen(false)
    setQuery('')
    setCreating(false)
    setNewColor(DEFAULT_SWATCH.hex)
  }

  function select(id: string) {
    onChange(id)
    close()
  }

  async function create() {
    const name = query.trim()
    if (!name) return
    const row = await createCategory.mutateAsync({ name, color: newColor })
    onChange(row.id)
    close()
  }

  return (
    <div ref={rootRef} className="relative">
      {/* Field */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-input border border-border bg-surface px-3 min-h-[44px] text-ui text-text focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        {selected ? (
          <CategoryPill category={selected} />
        ) : (
          <span className="text-text-3">{placeholder}</span>
        )}
        <span className="flex items-center gap-1">
          {selected && (
            <X
              size={16}
              className="text-text-3 hover:text-text"
              onClick={(e) => {
                e.stopPropagation()
                onChange(null)
              }}
            />
          )}
          <ChevronDown size={16} className="text-text-3" />
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-input border border-border bg-surface shadow-sm">
          {!creating && (
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="type to filter…"
              className="w-full border-b border-border bg-surface px-3 py-2 text-ui text-text placeholder:text-text-3 focus-visible:ring-0"
            />
          )}

          {creating ? (
            <div className="p-3">
              <p className="mb-2 text-meta text-text-2">
                pick a color for “{query.trim()}”
              </p>
              <ColorPicker value={newColor} onChange={setNewColor} />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="rounded-input px-3 py-1.5 text-meta text-text-2 hover:bg-surface-2"
                >
                  back
                </button>
                <button
                  type="button"
                  onClick={() => void create()}
                  disabled={createCategory.isPending}
                  className="rounded-input bg-accent px-3 py-1.5 text-meta text-bg disabled:opacity-50"
                >
                  create
                </button>
              </div>
            </div>
          ) : (
            <ul className="max-h-56 overflow-auto py-1">
              {filtered.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => select(c.id)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-ui hover:bg-surface-2"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        style={dotStyle(c.color)}
                        className="h-3 w-3 shrink-0 rounded-pill"
                      />
                      {c.name}
                    </span>
                    {c.id === value && (
                      <Check size={16} className="text-accent" />
                    )}
                  </button>
                </li>
              ))}

              {canCreate && (
                <li>
                  <button
                    type="button"
                    onClick={() => setCreating(true)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-ui text-accent hover:bg-surface-2"
                  >
                    <Plus size={16} />
                    create “{query.trim()}”
                  </button>
                </li>
              )}

              {filtered.length === 0 && !canCreate && (
                <li className="px-3 py-2 text-meta text-text-3">
                  no categories yet
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
