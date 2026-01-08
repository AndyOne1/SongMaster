import { cn } from '../../lib/utils'
import { Card } from '../ui/Card'
import { Music, Calendar, FileText } from 'lucide-react'
import type { Song } from '../../types'

interface LibrarySongCardProps {
  song: Song
  onClick: () => void
}

export function LibrarySongCard({ song, onClick }: LibrarySongCardProps) {
  return (
    <Card
      className="cursor-pointer p-5 group hover:border-amber-500/30"
      onClick={onClick}
    >
      {/* Header with icon */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-violet-500/20 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform duration-300">
          <Music className="h-6 w-6 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-medium text-ivory-100 truncate">{song.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-xs text-champagne-500">
              <Calendar className="h-3 w-3" />
              {new Date(song.created_at).toLocaleDateString()}
            </span>
            <span className={cn(
              'px-2 py-0.5 rounded text-[10px] uppercase font-medium tracking-wider',
              song.status === 'saved' && 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
              song.status === 'completed' && 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
              song.status === 'draft' && 'bg-champagne-500/10 text-champagne-500 border border-champagne-500/20',
              song.status === 'iterating' && 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            )}>
              {song.status}
            </span>
          </div>
        </div>
      </div>

      {/* Style preview */}
      {song.style_description && (
        <div className="mb-4">
          <p className="text-sm text-ivory-300 line-clamp-2 leading-relaxed">{song.style_description}</p>
        </div>
      )}

      {/* Lyrics preview */}
      {song.lyrics && (
        <div className="flex items-start gap-2 pt-3 border-t border-white/5">
          <FileText className="h-4 w-4 text-champagne-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-champagne-500 line-clamp-2 leading-relaxed">{song.lyrics}</p>
        </div>
      )}
    </Card>
  )
}
