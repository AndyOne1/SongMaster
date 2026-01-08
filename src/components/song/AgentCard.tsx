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
        'cursor-pointer p-5 transition-all duration-300',
        isWinner && 'border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-transparent',
        isOverride && 'border-blue-500/50 bg-blue-500/5',
        hasError && 'border-red-500/30 bg-red-500/5',
        !isWinner && !isOverride && !hasError && isDone && 'border-white/10',
        isGenerating && 'border-amber-500/20'
      )}
      onClick={onClick}
    >
      {/* Header - Agent Name */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold',
          isWinner
            ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30'
            : 'bg-gradient-to-br from-luxury-700 to-luxury-800 text-ivory-300'
        )}>
          {agentName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-display font-medium text-ivory-100">{agentName}</span>
          {isWinner && (
            <div className="flex items-center gap-1 text-amber-400 text-xs mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Winner
            </div>
          )}
        </div>
        {isOverride && (
          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg font-medium border border-blue-500/20">
            Selected
          </span>
        )}
      </div>

      {/* Song Info - only when done/winner/override */}
      {isDone || isWinner || isOverride ? (
        <>
          <div className="mb-4">
            <h4 className="font-display text-lg font-medium text-ivory-100 mb-2">{songName}</h4>
            {stylePreview && (
              <p className="text-sm text-champagne-500 line-clamp-2 leading-relaxed">{stylePreview}</p>
            )}
          </div>

          {/* Score Table */}
          {scores && (
            <div className="bg-luxury-900/60 rounded-xl p-3 border border-white/5">
              <div className="grid grid-cols-4 gap-2 text-center mb-2">
                {scoreLabels.map((label) => (
                  <span key={label} className="text-[10px] uppercase tracking-wider text-champagne-500 font-medium">
                    {label}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {Object.entries(scores).map(([key, value]) => (
                  <div key={key} className="flex flex-col items-center">
                    <span
                      className={cn(
                        'font-display text-lg font-semibold',
                        value >= 8 ? 'text-emerald-400' :
                        value >= 6 ? 'text-amber-400' :
                        value >= 4 ? 'text-orange-400' : 'text-red-400'
                      )}
                    >
                      {value}
                    </span>
                    {/* Score bar */}
                    <div className="w-full h-1 bg-luxury-800 rounded-full mt-1 overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          value >= 8 ? 'bg-emerald-500' :
                          value >= 6 ? 'bg-amber-500' :
                          value >= 4 ? 'bg-orange-500' : 'bg-red-500'
                        )}
                        style={{ width: `${(value / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : isGenerating ? (
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-2 text-champagne-500">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm">Generating...</span>
          </div>
        </div>
      ) : hasError ? (
        <div className="py-6 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 mb-2">
            <span className="text-red-400 text-sm">!</span>
          </div>
          <p className="text-red-400 text-sm">Generation failed</p>
        </div>
      ) : (
        <div className="py-6 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-luxury-800 border border-white/5 mb-2">
            <div className="h-2 w-2 rounded-full bg-champagne-500 animate-pulse-soft" />
          </div>
          <p className="text-champagne-500 text-sm">Waiting...</p>
        </div>
      )}
    </Card>
  )
}
