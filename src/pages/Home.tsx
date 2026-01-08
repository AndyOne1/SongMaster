import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import {
  Sparkles,
  Mic2,
  Library,
  ChevronRight,
  Music2,
  Zap
} from 'lucide-react'

export function Home() {
  return (
    <div className="mx-auto max-w-5xl">
      {/* Hero Section */}
      <div className="mb-12 text-center animate-fade-in-up">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-sm text-amber-400 border border-amber-500/20">
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered Creative Studio</span>
        </div>
        <h1 className="font-display text-5xl font-semibold text-ivory-100 mb-4 tracking-tight text-balance">
          Create Music with
          <span className="block mt-2 text-gradient-amber">Intelligent Agents</span>
        </h1>
        <p className="text-lg text-champagne-500 max-w-2xl mx-auto">
          Transform your ideas into complete songs with our multi-agent AI system.
          Lyrics, style, and artistry—orchestrated together.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12 stagger-children">
        {/* Create Song Card */}
        <Link to="/songs/new" className="group">
          <Card className="h-full p-6 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
                <Music2 className="h-7 w-7 text-white" />
              </div>
              <h2 className="font-display text-xl font-semibold text-ivory-100 mb-2">
                Create New Song
              </h2>
              <p className="text-champagne-500 text-sm mb-4">
                Generate song specifications with multiple AI agents collaborating in parallel
              </p>
              <Button variant="gold" className="w-full group-hover:shadow-amber-500/25">
                <Zap className="mr-2 h-4 w-4" />
                Start Creating
              </Button>
            </div>
          </Card>
        </Link>

        {/* Manage Artists Card */}
        <Link to="/artists" className="group">
          <Card className="h-full p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300">
                <Mic2 className="h-7 w-7 text-white" />
              </div>
              <h2 className="font-display text-xl font-semibold text-ivory-100 mb-2">
                Manage Artists
              </h2>
              <p className="text-champagne-500 text-sm mb-4">
                Create and manage artist profiles with unique style descriptions
              </p>
              <Button variant="secondary" className="w-full">
                View Artists
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </Card>
        </Link>

        {/* Library Card */}
        <Link to="/library" className="group">
          <Card className="h-full p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-champagne-500 to-amber-600 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
                <Library className="h-7 w-7 text-white" />
              </div>
              <h2 className="font-display text-xl font-semibold text-ivory-100 mb-2">
                Your Library
              </h2>
              <p className="text-champagne-500 text-sm mb-4">
                Browse and manage your saved songs and creative projects
              </p>
              <Button variant="secondary" className="w-full">
                Open Library
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Songs */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold text-ivory-100">
            Recent Creations
          </h2>
          <Link to="/library" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
            View all
          </Link>
        </div>

        <Card className="p-12 text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/3 via-transparent to-violet-500/3" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-luxury-800 border border-white/10">
              <Music2 className="h-8 w-8 text-champagne-500" />
            </div>
            <h3 className="font-display text-lg font-medium text-ivory-100 mb-2">
              No songs yet
            </h3>
            <p className="text-champagne-500 text-sm">
              Create your first song to start building your collection
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
