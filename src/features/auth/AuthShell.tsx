import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthShell({ title, subtitle, children }: Props) {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-4 text-text">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-sans text-screen font-medium">Loom</span>
          <h1 className="mt-6 font-sans text-section font-medium">{title}</h1>
          <p className="mt-1 text-ui text-text-2">{subtitle}</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
