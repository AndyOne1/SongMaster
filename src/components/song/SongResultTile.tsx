import { useState } from 'react'
import { Card } from '../ui/Card'
import { cn } from '../../lib/utils'
import { Trophy, ChevronDown, ChevronUp, Check } from 'lucide-react'

interface SongResultTileProps {
  agentName: string
  songName: string
  lyrics: string
  styleDescription: string
  status: 'waiting' | 'generating' | 'evaluated'
  isWinner: boolean
  onSelect: () => void
}

export function SongResultTile({
  agentName,
  songName,
  lyrics,
  styleDescription,
  status,
  isWinner,
  onSelect,
}: SongResultTileProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all',
        isWinner && 'border-green-500 bg-green-500/5',
        onSelect && 'hover:border-gray-600'
      )}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold',
            isWinner ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'
          )}>
            {status === 'generating' ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
            ) : (
              agentName.charAt(0)
            )}
          </div>
          <div>
            <span className="font-medium text-gray-200">{songName}</span>
            <p className="text-xs text-gray-500">{agentName}</p>
          </div>
        </div>
        {isWinner && (
          <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
            <Trophy className="h-3 w-3" />
            Winner
          </span>
        )}
      </div>

      {/* Style Description */}
      <div className="px-4 pb-2">
        <p className="text-sm text-gray-400 line-clamp-2">{styleDescription}</p>
      </div>

      {/* Expandable Lyrics */}
      {expanded && (
        <div className="px-4 pb-4">
          <div className="rounded-lg bg-gray-900/50 p-3 text-sm text-gray-300 whitespace-pre-wrap max-h-60 overflow-auto">
            {lyrics}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-700 px-4 py-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setExpanded(!expanded)
          }}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" /> Hide lyrics
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" /> Show lyrics
            </>
          )}
        </button>
        {isWinner && (
          <span className="flex items-center gap-1 text-xs text-green-400">
            <Check className="h-3 w-3" /> Selected
          </span>
        )}
      </div>
    </Card>
  )
}
