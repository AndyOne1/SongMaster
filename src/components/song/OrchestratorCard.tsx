import { useState } from 'react'
import { cn } from '../../lib/utils'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Trophy, RefreshCw, Plus, ChevronDown, ChevronUp } from 'lucide-react'

interface OrchestratorCardProps {
  orchestratorName: string
  status: 'waiting' | 'fetching' | 'analyzing' | 'scoring' | 'evaluating' | 'complete'
  winnerName?: string
  winnerReason?: string
  winnerAgentId?: string
  winnerScores?: {
    music_style: number
    lyrics: number
    originality: number
    cohesion: number
  }
  onSave: () => void
  onIterate: (customInstruction?: string) => void
  onNewSong: () => void
}

const statusMessages: Record<string, string> = {
  waiting: 'Waiting for agents to finish...',
  fetching: 'Fetching songs from agents...',
  analyzing: 'Analyzing songs...',
  scoring: 'Scoring songs...',
  evaluating: 'Evaluating recommendations...',
  complete: 'Evaluation complete'
}

export function OrchestratorCard({
  orchestratorName,
  status,
  winnerName,
  winnerReason,
  winnerScores,
  onSave,
  onIterate,
  onNewSong
}: OrchestratorCardProps) {
  const [showCustomInstruction, setShowCustomInstruction] = useState(false)
  const [customInstruction, setCustomInstruction] = useState('')

  const isComplete = status === 'complete'
  const isProcessing = !isComplete && status !== 'waiting'

  return (
    <Card className={cn(
      'p-4',
      isComplete && 'border-yellow-500/30 bg-yellow-500/5'
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Trophy className={cn(
          'h-5 w-5',
          isComplete ? 'text-yellow-400' : 'text-gray-500'
        )} />
        <span className="font-medium text-gray-200">{orchestratorName}</span>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded ml-auto',
          isComplete ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-400'
        )}>
          {isComplete ? 'Complete' : status}
        </span>
      </div>

      {/* Status / Winner */}
      {isProcessing ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
          <RefreshCw className="h-4 w-4 animate-spin" />
          {statusMessages[status]}
        </div>
      ) : isComplete && winnerName ? (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <span className="text-xs text-yellow-400 uppercase tracking-wide">Winner</span>
          </div>
          <h3 className="font-medium text-gray-200 mb-1">{winnerName}</h3>
          {winnerReason && (
            <p className="text-sm text-gray-400 mb-3">{winnerReason}</p>
          )}
          {/* Winner Scores */}
          {winnerScores && (
            <div className="bg-gray-900/50 rounded p-2 text-xs mt-3">
              <div className="grid grid-cols-4 gap-1 text-center mb-1">
                <span className="text-gray-500 text-[10px] uppercase">Mus</span>
                <span className="text-gray-500 text-[10px] uppercase">Lyr</span>
                <span className="text-gray-500 text-[10px] uppercase">Org</span>
                <span className="text-gray-500 text-[10px] uppercase">Coh</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center">
                <span className="text-gray-200">{winnerScores.music_style}</span>
                <span className="text-gray-200">{winnerScores.lyrics}</span>
                <span className="text-gray-200">{winnerScores.originality}</span>
                <span className="text-gray-200">{winnerScores.cohesion}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-4 text-sm text-gray-500">
          {statusMessages[status]}
        </div>
      )}

      {/* Actions */}
      {isComplete && (
        <div className="space-y-3">
          {/* Iterate with Custom Instruction */}
          <div>
            <Button
              variant="outline"
              onClick={() => onIterate(customInstruction || undefined)}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Iterate on Song
            </Button>
            <button
              onClick={() => setShowCustomInstruction(!showCustomInstruction)}
              className="flex items-center gap-1 text-xs text-gray-500 mt-2 hover:text-gray-400"
            >
              Custom Instruction
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
                placeholder="Add instructions for the iteration..."
                className="w-full mt-2 p-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder:text-gray-500"
                rows={2}
              />
            )}
          </div>

          <Button onClick={onSave} className="w-full">
            Save to Library
          </Button>

          <Button
            variant="ghost"
            onClick={onNewSong}
            className="w-full text-gray-400 hover:text-gray-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Song
          </Button>
        </div>
      )}
    </Card>
  )
}
