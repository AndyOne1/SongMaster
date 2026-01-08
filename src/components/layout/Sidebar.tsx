import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import {
  Home,
  Music2,
  Library,
  Settings,
  Sparkles,
  Mic2
} from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Studio' },
  { to: '/songs/new', icon: Sparkles, label: 'Create' },
  { to: '/artists', icon: Mic2, label: 'Artists' },
  { to: '/library', icon: Library, label: 'Library' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  return (
    <aside className="relative flex h-full w-72 flex-col border-r border-white/5 bg-luxury-950/80 backdrop-blur-xl">
      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/3 via-transparent to-violet-500/3 pointer-events-none" />

      {/* Logo section */}
      <div className="relative z-10 flex items-center gap-3 p-6 pb-8">
        <div className="relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/20">
            <Music2 className="h-6 w-6 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-luxury-800 border border-white/10">
            <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse-soft" />
          </div>
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold text-ivory-100 tracking-tight">
            SongMaster
          </h1>
          <p className="text-xs text-champagne-500 tracking-wide">AI Creative Studio</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 space-y-1 px-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300',
                'hover-lift',
                isActive
                  ? 'bg-gradient-to-r from-amber-500/10 to-transparent text-amber-400 border border-amber-500/10'
                  : 'text-ivory-400 hover:text-ivory-100 hover:bg-luxury-800/50'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    'h-5 w-5 transition-all duration-300',
                    isActive
                      ? 'text-amber-400'
                      : 'text-ivory-500 group-hover:text-ivory-300'
                  )}
                />
                <span>{label}</span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section - User/Pro */}
      <div className="relative z-10 border-t border-white/5 p-4">
        <div className="rounded-xl bg-gradient-to-br from-luxury-800/80 to-luxury-900/80 border border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-amber-500/20 border border-white/10">
              <Sparkles className="h-5 w-5 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ivory-200">Pro Features</p>
              <p className="text-xs text-champagne-500 truncate">Unlock unlimited creativity</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
