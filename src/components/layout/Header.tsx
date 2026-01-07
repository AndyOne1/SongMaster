import { User } from 'lucide-react'
import { Button } from '../ui/Button'

export function Header() {
  return (
    <header className="border-b border-gray-800 bg-gray-900/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Sign in to save your songs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <User className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        </div>
      </div>
    </header>
  )
}
