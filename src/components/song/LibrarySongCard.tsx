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
      className="cursor-pointer transition-all hover:border-gray-500 hover:bg-gray-800/50"
      onClick={onClick}
    >
      {/* Header with icon */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center">
          <Music className="h-5 w-5 text-primary-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-200 truncate">{song.name}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(song.created_at).toLocaleDateString()}
            </span>
            <span className={cn(
              'px-1.5 py-0.5 rounded text-[10px] uppercase',
              song.status === 'saved' && 'bg-green-500/20 text-green-400',
              song.status === 'completed' && 'bg-blue-500/20 text-blue-400',
              song.status === 'draft' && 'bg-gray-500/20 text-gray-400',
              song.status === 'iterating' && 'bg-yellow-500/20 text-yellow-400'
            )}>
              {song.status}
            </span>
          </div>
        </div>
      </div>

      {/* Style preview */}
      {song.style_description && (
        <div className="mb-3">
          <p className="text-sm text-gray-400 line-clamp-2">{song.style_description}</p>
        </div>
      )}

      {/* Lyrics preview */}
      {song.lyrics && (
        <div className="flex items-start gap-2 pt-2 border-t border-gray-700/50">
          <FileText className="h-3 w-3 text-gray-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-600 line-clamp-2">{song.lyrics}</p>
        </div>
      )}
    </Card>
  )
}
