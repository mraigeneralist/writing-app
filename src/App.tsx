import { useEffect, useState } from 'react'

// Phase 0 placeholder. Replaced by the router + providers in Phase 1.
export default function App() {
  const [dark, setDark] = useState(
    () =>
      document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <div className="min-h-dvh bg-bg text-text">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-sans text-screen font-medium">Loom</h1>
        <p className="mt-3 font-serif text-prose text-text-2">
          Capture ideas, organize notes, and write. The scaffold is in place —
          features land in the phases that follow.
        </p>

        <div className="mt-8 rounded-card border border-border bg-surface p-6">
          <p className="text-ui text-text-2">
            Surface card on a hairline border. Accent:{' '}
            <span className="text-accent">a single confident action color</span>.
          </p>
          <button
            onClick={() => setDark((d) => !d)}
            className="mt-4 rounded-input bg-accent px-4 py-2 text-ui text-bg transition active:scale-[0.98]"
          >
            Toggle {dark ? 'light' : 'dark'} mode
          </button>
        </div>
      </div>
    </div>
  )
}
