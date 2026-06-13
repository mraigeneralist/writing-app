import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { ProtectedRoute } from './ProtectedRoute'
import SignIn from '@/features/auth/SignIn'
import SignUp from '@/features/auth/SignUp'
import IdeasStream from '@/features/ideas/IdeasStream'
import NotesBoard from '@/features/notes/NotesBoard'
import Library from '@/features/write/Library'
import Editor from '@/features/write/Editor'

export const router = createBrowserRouter([
  { path: '/signin', element: <SignIn /> },
  { path: '/signup', element: <SignUp /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/ideas" replace /> },
          { path: 'ideas', element: <IdeasStream /> },
          { path: 'notes', element: <NotesBoard /> },
          { path: 'write', element: <Library /> },
          { path: 'write/:id', element: <Editor /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/ideas" replace /> },
])
