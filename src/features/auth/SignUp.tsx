import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { AuthShell } from './AuthShell'
import { Button } from '@/components/Button'
import { TextField } from '@/components/TextField'

export default function SignUp() {
  const { session, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  if (session) return <Navigate to="/ideas" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const { needsConfirm } = await signUp(email, password)
      if (needsConfirm) setDone(true)
      // If confirmation is off, the auth listener signs the user in and the
      // <Navigate> above takes over.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign up.')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <AuthShell title="Check your email" subtitle="One more step.">
        <p className="text-ui text-text-2">
          We sent a confirmation link to <strong>{email}</strong>. Click it, then{' '}
          <Link to="/signin" className="text-accent">
            sign in
          </Link>
          .
        </p>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Create your notebook" subtitle="It takes a moment.">
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
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-meta text-focus-warn">{error}</p>}
        <Button type="submit" disabled={busy}>
          {busy ? 'creating…' : 'create account'}
        </Button>
      </form>
      <p className="mt-6 text-meta text-text-2">
        Already have one?{' '}
        <Link to="/signin" className="text-accent">
          sign in
        </Link>
      </p>
    </AuthShell>
  )
}
