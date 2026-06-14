import { derivePill } from '@/lib/category-colors'
import { useTheme } from '@/lib/theme'
import type { Category } from '@/lib/types'

interface Props {
  category: Pick<Category, 'name' | 'color'>
  className?: string
}

// The colored category pill. Renders the same color everywhere (board, filter,
// picker) by deriving from the stored base hex.
export function CategoryPill({ category, className = '' }: Props) {
  const { theme } = useTheme()
  return (
    <span
      style={derivePill(category.color, theme === 'dark')}
      className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-meta ${className}`}
    >
      {category.name}
    </span>
  )
}
