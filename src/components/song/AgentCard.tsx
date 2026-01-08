import { cn } from '../../lib/utils'
import { Card } from '../ui/Card'

interface AgentCardProps {
  agentName: string
  status: 'waiting' | 'generating' | 'done' | 'error' | 'winner' | 'override'
  songName?: string
  stylePreview?: string
  scores?: {
    music_style: number
    lyrics: number
    originality: number
    cohesion: number
  }
  onClick: () => void
}

const scoreLabels = ['Music', 'Lyrics', 'Originality', 'Cohesion']

export function AgentCard({
  agentName,
  status,
  songName,
  stylePreview,
  scores,
  onClick
}: AgentCardProps) {
  const isGenerating = status === 'generating'
  const isDone = status === 'done'
  const isWinner = status === 'winner'
  const isOverride = status === 'override'
  const hasError = status === 'error'

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all',
        isWinner && 'border-2 border-yellow-500 bg-yellow-500/5 animate-pulse',
        isOverride && 'border-2 border-blue-500 bg-blue-500/5',
        hasError && 'border-red-500',
        !isWinner && !isOverride && !hasError && isDone && 'border-green-500/30'
      )}
      onClick={onClick}
    >
      {/* Header - Agent Name */}
      <div className="flex items-center gap-2 mb-2">
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
          isWinner ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'
        )}>
          {agentName.charAt(0)}
        </div>
        <span className="font-medium text-gray-200">{agentName}</span>
        {isOverride && (
          <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
            Override
          </span>
        )}
      </div>

      {/* Song Info - only when done/winner/override */}
      {isDone || isWinner || isOverride ? (
        <>
          <div className="mb-2">
            <h4 className="font-medium text-gray-200">{songName}</h4>
            {stylePreview && (
              <p className="text-xs text-gray-400 line-clamp-1">{stylePreview}</p>
            )}
          </div>

          {/* Score Table */}
          {scores && (
            <div className="bg-gray-900/50 rounded p-2 text-xs">
              <div className="grid grid-cols-4 gap-1 text-center mb-1">
                {scoreLabels.map((label) => (
                  <span key={label} className="text-gray-500 text-[10px] uppercase">
                    {label.substring(0, 3)}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-1 text-center">
                <span className="text-gray-200">{scores.music_style}</span>
                <span className="text-gray-200">{scores.lyrics}</span>
                <span className="text-gray-200">{scores.originality}</span>
                <span className="text-gray-200">{scores.cohesion}</span>
              </div>
            </div>
          )}
        </>
      ) : isGenerating ? (
        <div className="flex items-center justify-center py-4 text-gray-500">
          <div className="h-2 w-2 rounded-full bg-gray-600 animate-pulse mr-2" />
          <span className="text-sm">Generating...</span>
        </div>
      ) : hasError ? (
        <div className="py-4 text-red-400 text-sm text-center">
          Generation failed
        </div>
      ) : (
        <div className="py-4 text-gray-500 text-sm text-center">
          Waiting...
        </div>
      )}
    </Card>
  )
}
