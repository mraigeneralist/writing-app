import { LogOut } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { NAV_ITEMS } from './nav-items'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuth } from '@/features/auth/AuthContext'

export function AppLayout() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-dvh bg-bg text-text">
      {/* Desktop: left rail */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-56 flex-col border-r border-border bg-surface px-4 py-6 md:flex">
        <span className="px-2 font-sans text-screen font-medium">Loom</span>

        <nav className="mt-8 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                'flex items-center gap-3 rounded-input px-3 py-2 text-ui transition ' +
                (isActive
                  ? 'bg-accent-soft text-accent'
                  : 'text-text-2 hover:bg-surface-2')
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex items-center justify-between">
          <button
            onClick={() => void signOut()}
            className="flex items-center gap-2 rounded-input px-3 py-2 text-ui text-text-2 transition hover:bg-surface-2"
          >
            <LogOut size={18} />
            sign out
          </button>
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile: top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-bg/90 px-4 py-3 backdrop-blur md:hidden">
        <span className="font-sans text-section font-medium">Loom</span>
        <div className="flex items-center">
          <ThemeToggle />
          <button
            onClick={() => void signOut()}
            aria-label="Sign out"
            className="inline-flex h-11 w-11 items-center justify-center rounded-input text-text-2 transition hover:bg-surface-2"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-4 md:ml-56 md:max-w-none md:px-8 md:pb-8">
        <div className="mx-auto w-full max-w-3xl">
          <Outlet />
        </div>
      </main>

      {/* Mobile: bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-border bg-surface md:hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              'flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 transition ' +
              (isActive ? 'text-accent' : 'text-text-2')
            }
          >
            <Icon size={22} />
            <span className="text-[11px]">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
