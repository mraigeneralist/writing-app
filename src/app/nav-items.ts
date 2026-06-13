import { MessagesSquare, LayoutGrid, PenLine, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

// The three primary surfaces: capture -> organize -> create.
export const NAV_ITEMS: NavItem[] = [
  { to: '/ideas', label: 'ideas', icon: MessagesSquare },
  { to: '/notes', label: 'notes', icon: LayoutGrid },
  { to: '/write', label: 'write', icon: PenLine },
]
