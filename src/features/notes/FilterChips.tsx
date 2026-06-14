import { dotStyle } from '@/lib/category-colors'
import type { Category } from '@/lib/types'

export interface FilterOption {
  id: string | null // null = "all"
  label: string
  color?: string
  count: number
}

interface Props {
  options: FilterOption[]
  selected: string | null
  onSelect: (id: string | null) => void
}

export function FilterChips({ options, selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt.id === selected
        return (
          <button
            key={opt.id ?? 'all'}
            onClick={() => onSelect(opt.id)}
            className={
              'inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-meta transition ' +
              (active
                ? 'border-transparent bg-text text-bg'
                : 'border-border text-text-2 hover:bg-surface-2')
            }
          >
            {opt.color && (
              <span
                style={dotStyle(opt.color)}
                className="h-2.5 w-2.5 rounded-pill"
              />
            )}
            {opt.label}
            <span className={active ? 'text-bg/70' : 'text-text-3'}>
              · {opt.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function buildFilterOptions(
  categories: Category[],
  counts: Map<string | null, number>,
  total: number,
): FilterOption[] {
  return [
    { id: null, label: 'all', count: total },
    ...categories.map((c) => ({
      id: c.id,
      label: c.name,
      color: c.color,
      count: counts.get(c.id) ?? 0,
    })),
  ]
}
