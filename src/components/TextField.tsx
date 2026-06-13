import { forwardRef, type InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const TextField = forwardRef<HTMLInputElement, Props>(
  function TextField({ label, className = '', id, ...props }, ref) {
    const input = (
      <input
        ref={ref}
        id={id}
        className={
          'w-full rounded-input border border-border bg-surface px-3 min-h-[44px] ' +
          'text-ui text-text placeholder:text-text-3 ' +
          'focus-visible:ring-2 focus-visible:ring-accent/40 ' +
          className
        }
        {...props}
      />
    )
    if (!label) return input
    return (
      <label htmlFor={id} className="block">
        <span className="mb-2 block text-meta text-text-2">{label}</span>
        {input}
      </label>
    )
  },
)
