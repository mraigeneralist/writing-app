import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { AuthShell } from './AuthShell'
import { Button } from '@/components/Button'
import { TextField } from '@/components/TextField'

export default function SignIn() {
  const { session, signIn } = useAuth()
  const location = useLocation() as { state?: { from?: { pathname: string } } }
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (session) {
    return <Navigate to={location.state?.from?.pathname ?? '/ideas'} replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your notebook.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <TextField
          id="email"
          label="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          id="password"
          label="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-meta text-focus-warn">{error}</p>}
        <Button type="submit" disabled={busy}>
          {busy ? 'signing in…' : 'sign in'}
        </Button>
      </form>
      <p className="mt-6 text-meta text-text-2">
        No account?{' '}
        <Link to="/signup" className="text-accent">
          create one
        </Link>
      </p>
    </AuthShell>
  )
}
