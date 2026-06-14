import { Check } from 'lucide-react'
import { CATEGORY_SWATCHES, dotStyle } from '@/lib/category-colors'

interface Props {
  value: string
  onChange: (hex: string) => void
}

// The 8 fixed swatches. Used when creating a category in the combobox.
export function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_SWATCHES.map((swatch) => {
        const selected = swatch.hex === value
        return (
          <button
            key={swatch.hex}
            type="button"
            onClick={() => onChange(swatch.hex)}
            aria-label={swatch.name}
            aria-pressed={selected}
            title={swatch.name}
            style={dotStyle(swatch.hex)}
            className={
              'grid h-7 w-7 place-items-center rounded-pill transition ' +
              (selected ? 'ring-2 ring-offset-2 ring-offset-surface' : '')
            }
          >
            {selected && <Check size={14} className="text-white" />}
          </button>
        )
      })}
    </div>
  )
}
