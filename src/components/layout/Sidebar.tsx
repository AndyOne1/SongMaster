import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Home, Music, Library, Settings, PlusCircle } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/songs/new', icon: PlusCircle, label: 'New Song' },
  { to: '/artists', icon: Music, label: 'Artists' },
  { to: '/library', icon: Library, label: 'Library' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-gray-800 bg-gray-900/50 p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">SongMaster</h1>
        <p className="text-sm text-gray-500">AI Song Creator</p>
      </div>
      <nav className="space-y-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
