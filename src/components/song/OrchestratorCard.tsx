import { useState } from 'react'
import { cn } from '../../lib/utils'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Trophy, RefreshCw, Plus, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

interface WinnerScores {
  music_style: number
  lyrics: number
  originality: number
  cohesion: number
  request_alignment?: number
  suno_execution_prediction?: number
}

interface WinnerAnalysis {
  reason: string
  key_differentiators?: string[]
  best_for?: string
}

interface OrchestratorCardProps {
  orchestratorName: string
  status: 'waiting' | 'fetching' | 'analyzing' | 'scoring' | 'evaluating' | 'complete'
  winnerName?: string
  winnerReason?: string
  winnerAgentId?: string
  winnerScores?: WinnerScores
  onSave: () => void
  onIterate: (customInstruction?: string) => void
  onNewSong: () => void
  winnerAnalysis?: WinnerAnalysis | null
  iterationCount?: number
}

const statusMessages: Record<string, string> = {
  waiting: 'Waiting for agents to finish...',
  fetching: 'Fetching songs from agents...',
  analyzing: 'Analyzing songs...',
  scoring: 'Scoring songs...',
  evaluating: 'Evaluating recommendations...',
  complete: 'Evaluation complete'
}

function ScoreDisplay({ scores }: { scores: WinnerScores | undefined }) {
  if (!scores) return null

  const scoreItems: { key: keyof WinnerScores; label: string }[] = [
    { key: 'music_style', label: 'Music' },
    { key: 'lyrics', label: 'Lyrics' },
    { key: 'originality', label: 'Original' },
    { key: 'cohesion', label: 'Cohesion' },
  ]

  // Add 5th score if present (request_alignment)
  if (scores.request_alignment) {
    scoreItems.push({ key: 'request_alignment', label: 'Align' })
  }

  return (
    <div className="bg-luxury-900/60 rounded-xl p-4 border border-amber-500/20">
      <div className={`grid gap-2 text-center mb-3 ${scoreItems.length > 4 ? 'grid-cols-5' : 'grid-cols-4'}`}>
        {scoreItems.map(({ label }) => (
          <span key={label} className="text-[10px] uppercase tracking-wider text-champagne-500 font-medium">
            {label}
          </span>
        ))}
      </div>
      <div className={`grid gap-2 text-center ${scoreItems.length > 4 ? 'grid-cols-5' : 'grid-cols-4'}`}>
        {scoreItems.map(({ key }) => (
          <div key={key} className="flex flex-col items-center">
            <span
              className={cn(
                'font-display text-2xl font-bold',
                (scores[key] ?? 0) >= 8 ? 'text-emerald-400' :
                (scores[key] ?? 0) >= 6 ? 'text-amber-400' :
                (scores[key] ?? 0) >= 4 ? 'text-orange-400' : 'text-red-400'
              )}
            >
              {scores[key]}
            </span>
            {/* Score bar */}
            <div className="w-full h-1.5 bg-luxury-800 rounded-full mt-2 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700',
                  (scores[key] ?? 0) >= 8 ? 'bg-emerald-500' :
                  (scores[key] ?? 0) >= 6 ? 'bg-amber-500' :
                  (scores[key] ?? 0) >= 4 ? 'bg-orange-500' : 'bg-red-500'
                )}
                style={{ width: `${((scores[key] ?? 0) / 10) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function OrchestratorCard({
  orchestratorName,
  status,
  winnerName,
  winnerReason,
  winnerScores,
  onSave,
  onIterate,
  onNewSong,
  winnerAnalysis,
  iterationCount
}: OrchestratorCardProps) {
  const [showCustomInstruction, setShowCustomInstruction] = useState(false)
  const [customInstruction, setCustomInstruction] = useState('')

  const isComplete = status === 'complete'
  const isProcessing = !isComplete && status !== 'waiting'

  return (
    <Card className={cn(
      'p-5 sticky top-6',
      isComplete && 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent'
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl',
          isComplete
            ? 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30'
            : 'bg-luxury-800 border border-white/10'
        )}>
          <Trophy className={cn(
            'h-5 w-5',
            isComplete ? 'text-white' : 'text-champagne-500'
          )} />
        </div>
        <div className="flex-1">
          <span className="font-display font-medium text-ivory-100">{orchestratorName}</span>
          <p className="text-xs text-champagne-500">Orchestrator</p>
        </div>
        <span className={cn(
          'text-xs px-2.5 py-1 rounded-lg font-medium',
          isComplete
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'bg-luxury-800 text-champagne-500 border border-white/10'
        )}>
          {isComplete ? 'Complete' : status}
        </span>
      </div>

      {/* Status / Winner */}
      {isProcessing ? (
        <div className="flex items-center gap-3 text-sm text-champagne-500 py-8">
          <RefreshCw className="h-5 w-5 animate-spin text-amber-400" />
          <span>{statusMessages[status]}</span>
        </div>
      ) : isComplete && winnerName ? (
        <div className="mb-5">
          {/* Winner Badge */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-lg shadow-amber-500/30">
              <Trophy className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs text-amber-400 uppercase tracking-wider font-semibold">Winning Song</span>
          </div>

          <h3 className="font-display text-xl font-semibold text-ivory-100 mb-2">{winnerName}</h3>
          {winnerReason && (
            <p className="text-sm text-champagne-500 mb-4 leading-relaxed">{winnerReason}</p>
          )}

          {/* Winner Scores */}
          {winnerScores && (
            <ScoreDisplay scores={winnerScores} />
          )}

          {/* Winner Analysis */}
          {winnerAnalysis && (
            <div className="mt-4 p-4 bg-gradient-to-br from-violet-500/10 to-amber-500/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span className="text-xs text-violet-400 uppercase tracking-wider font-medium">Analysis</span>
              </div>
              <p className="text-sm text-ivory-300 leading-relaxed">{winnerAnalysis.reason}</p>
              {winnerAnalysis.best_for && (
                <p className="text-xs text-champagne-500 mt-2">
                  <span className="text-violet-400">Best for:</span> {winnerAnalysis.best_for}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 text-center">
          <div className="flex items-center justify-center gap-2 text-champagne-500">
            <div className="h-2 w-2 rounded-full bg-champagne-500 animate-pulse-soft" />
            <span className="text-sm">{statusMessages[status]}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      {isComplete && (
        <div className="space-y-3 mt-5 pt-5 border-t border-white/5">
          {/* Iterate with Custom Instruction */}
          <div>
            <Button
              variant="secondary"
              onClick={() => onIterate(customInstruction || undefined)}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {(iterationCount ?? 0) > 0 ? `Iterate Again (#${iterationCount})` : 'Iterate on Song'}
            </Button>
            <button
              onClick={() => setShowCustomInstruction(!showCustomInstruction)}
              className="flex items-center gap-1 text-xs text-champagne-500 mt-2 hover:text-ivory-300 transition-colors mx-auto"
            >
              Add custom instruction
              {showCustomInstruction ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
            {showCustomInstruction && (
              <textarea
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="Describe how you'd like to improve the song..."
                className="w-full mt-2 p-3 text-sm bg-luxury-900/60 border border-white/10 rounded-xl text-ivory-100 placeholder:text-champagne-500/50 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20 transition-all resize-none"
                rows={3}
              />
            )}
          </div>

          <Button onClick={onSave} variant="gold" className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            Save to Library
          </Button>

          <Button
            variant="ghost"
            onClick={onNewSong}
            className="w-full text-champagne-500 hover:text-ivory-100 hover:bg-luxury-800/50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Song
          </Button>
        </div>
      )}
    </Card>
  )
}
