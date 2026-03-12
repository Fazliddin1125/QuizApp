import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AppHeaderProps {
  right?: ReactNode
}

export function AppHeader({ right }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-slate-900">QuizApp</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {right ?? (
            <>
              <Link to="/" className="hidden text-slate-700 hover:text-slate-900 sm:inline-block">
                Asosiy
              </Link>
              <Button
                size="sm"
                className="rounded-lg bg-blue-600 px-4 hover:bg-blue-700"
                asChild
              >
                <Link to="/admin/login">O‘qituvchi kirishi</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

