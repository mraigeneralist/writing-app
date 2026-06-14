import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { ProtectedRoute } from './ProtectedRoute'

// Code-split each screen so the initial bundle stays small; the TipTap editor in
// particular only loads when you open a document.
const SignIn = lazy(() => import('@/features/auth/SignIn'))
const SignUp = lazy(() => import('@/features/auth/SignUp'))
const IdeasStream = lazy(() => import('@/features/ideas/IdeasStream'))
const NotesBoard = lazy(() => import('@/features/notes/NotesBoard'))
const Library = lazy(() => import('@/features/write/Library'))
const Editor = lazy(() => import('@/features/write/Editor'))

// eslint-disable-next-line react-refresh/only-export-components
function Lazy({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center text-ui text-text-3">
          loading…
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

export const router = createBrowserRouter([
  { path: '/signin', element: <Lazy><SignIn /></Lazy> },
  { path: '/signup', element: <Lazy><SignUp /></Lazy> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/ideas" replace /> },
          { path: 'ideas', element: <Lazy><IdeasStream /></Lazy> },
          { path: 'notes', element: <Lazy><NotesBoard /></Lazy> },
          { path: 'write', element: <Lazy><Library /></Lazy> },
          { path: 'write/:id', element: <Lazy><Editor /></Lazy> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/ideas" replace /> },
])
