import { useState } from 'react'
import { Search, Bell, User, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'

export function Header() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchFocused, setSearchFocused] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="relative z-10 flex h-16 items-center justify-between border-b border-white/5 bg-luxury-950/60 backdrop-blur-xl px-6">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className={cn(
          'relative flex items-center flex-1 transition-all duration-300',
          searchFocused ? 'w-full' : 'w-full'
        )}>
          <Search
            className={cn(
              'absolute left-4 h-4 w-4 transition-colors duration-300',
              searchFocused ? 'text-amber-400' : 'text-ivory-500'
            )}
          />
          <input
            type="text"
            placeholder="Search songs, artists, projects..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={cn(
              'h-10 w-full rounded-xl bg-luxury-850/60 pl-12 pr-4 text-sm text-ivory-100',
              'placeholder:text-ivory-500/50',
              'border transition-all duration-300 focus:outline-none',
              searchFocused
                ? 'border-amber-500/30 bg-luxury-850/80 shadow-glow-amber'
                : 'border-white/5 hover:border-white/10'
            )}
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ivory-400 transition-all duration-300 hover:bg-luxury-800/50 hover:text-ivory-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-white/5" />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 rounded-xl p-1.5 pr-3 transition-all duration-300 hover:bg-luxury-800/50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-violet-500/20 border border-white/10">
              <User className="h-4 w-4 text-ivory-300" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-ivory-200 leading-none">
                {user?.email?.split('@')[0] || 'Guest'}
              </p>
              <p className="text-xs text-champagne-500 leading-none mt-0.5">
                {user ? 'Free Plan' : 'Sign in to save'}
              </p>
            </div>
            <ChevronDown className={cn(
              'h-4 w-4 text-ivory-500 transition-transform duration-300',
              showUserMenu && 'rotate-180'
            )} />
          </button>

          {/* Dropdown menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-luxury-850 border border-white/10 shadow-xl overflow-hidden animate-fade-in">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm text-ivory-300 hover:bg-luxury-800/50 hover:text-ivory-100 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm text-ivory-300 hover:bg-luxury-800/50 hover:text-ivory-100 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Sign In
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
