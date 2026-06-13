import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-input px-4 min-h-[44px] ' +
  'text-ui transition active:scale-[0.98] disabled:opacity-50 ' +
  'disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-bg',
  secondary: 'border border-border bg-transparent text-text hover:bg-surface-2',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: Props) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  )
}
