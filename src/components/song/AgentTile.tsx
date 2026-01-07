import { Agent } from '../../types'
import { Card } from '../ui/Card'
import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

interface AgentTileProps {
  agent: Agent
  status: 'waiting' | 'generating' | 'evaluated' | 'winner' | 'overridden'
  scores?: {
    music_style: number
    lyrics: number
    originality: number
    cohesion: number
    total: number
  }
  onClick?: () => void
}

const scoreColors = {
  good: 'bg-green-500/20 text-green-400 border-green-500/30',
  ok: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  bad: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const getScoreClass = (score: number) => {
  if (score >= 8) return scoreColors.good
  if (score >= 5) return scoreColors.ok
  return scoreColors.bad
}

export function AgentTile({ agent, status, scores, onClick }: AgentTileProps) {
  return (
    <Card
      className={cn(
        'relative cursor-pointer transition-all',
        status === 'winner' && 'border-2 border-green-500 bg-green-500/5',
        status === 'overridden' && 'border-2 border-blue-500 bg-blue-500/5',
        status === 'generating' && 'animate-pulse',
        onClick && 'hover:border-gray-600'
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold',
            status === 'winner' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'
          )}>
            {status === 'generating' ? <Loader2 className="h-4 w-4 animate-spin" /> : agent.name.charAt(0)}
          </div>
          <span className="font-medium text-gray-200">{agent.name}</span>
        </div>
        {status === 'winner' && (
          <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
            Winner
          </span>
        )}
        {status === 'overridden' && (
          <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-400">
            Selected
          </span>
        )}
      </div>

      {/* Scores (when evaluated) */}
      {status === 'evaluated' && scores && (
        <div className="space-y-2">
          {[
            { label: 'Music Style', value: scores.music_style },
            { label: 'Lyrics', value: scores.lyrics },
            { label: 'Originality', value: scores.originality },
            { label: 'Cohesion', value: scores.cohesion },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-gray-400">{label}</span>
              <span className={cn('rounded px-2 py-0.5 text-xs font-medium border', getScoreClass(value))}>
                {value}/10
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-gray-700 pt-2 text-sm">
            <span className="font-medium text-gray-300">Total Score</span>
            <span className={cn('rounded px-2 py-0.5 text-sm font-bold border', getScoreClass(scores.total))}>
              {scores.total.toFixed(1)}/10
            </span>
          </div>
        </div>
      )}

      {/* Generating state */}
      {status === 'generating' && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-400">Generating...</span>
        </div>
      )}

      {/* Waiting state */}
      {status === 'waiting' && (
        <div className="flex items-center justify-center py-4">
          <div className="h-2 w-2 rounded-full bg-gray-600" />
          <span className="ml-2 text-sm text-gray-500">Waiting...</span>
        </div>
      )}
    </Card>
  )
}
