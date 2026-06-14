import type { CSSProperties } from 'react'

// The fixed category palette from DESIGN.md. Users pick from these only, which
// keeps the board harmonious. The base hex is stored on the category.
export interface Swatch {
  name: string
  hex: string
}

export const CATEGORY_SWATCHES: Swatch[] = [
  { name: 'slate', hex: '#64748B' },
  { name: 'indigo', hex: '#6366F1' },
  { name: 'teal', hex: '#14B8A6' },
  { name: 'green', hex: '#22A06B' },
  { name: 'amber', hex: '#D9920B' },
  { name: 'terracotta', hex: '#C2603B' },
  { name: 'rose', hex: '#D6537E' },
  { name: 'plum', hex: '#8B5CF6' },
]

export const DEFAULT_SWATCH = CATEGORY_SWATCHES[1] // indigo

interface Rgb {
  r: number
  g: number
  b: number
}

function hexToRgb(hex: string): Rgb {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function rgba({ r, g, b }: Rgb, a: number): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

// Mix toward black for readable text on a light tinted pill.
function darken({ r, g, b }: Rgb, amount: number): string {
  const f = 1 - amount
  return `rgb(${Math.round(r * f)}, ${Math.round(g * f)}, ${Math.round(b * f)})`
}

// Pill background = base at ~14% (light) / ~22% (dark) opacity; text = base
// shifted darker (light) or the base itself (dark). Always same-hue text on the
// colored fill — never plain black/gray.
export function derivePill(baseHex: string, isDark: boolean): CSSProperties {
  const rgb = hexToRgb(baseHex)
  return isDark
    ? { backgroundColor: rgba(rgb, 0.22), color: baseHex }
    : { backgroundColor: rgba(rgb, 0.14), color: darken(rgb, 0.35) }
}

// Solid swatch (e.g. the color dot in the combobox / picker).
export function dotStyle(baseHex: string): CSSProperties {
  return { backgroundColor: baseHex }
}
