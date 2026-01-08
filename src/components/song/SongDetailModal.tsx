import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Save, Check } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Evaluation {
  analysis: string
  scores: {
    music_style: number
    lyrics: number
    originality: number
    cohesion: number
  }
  recommendations?: string
}

interface SongDetailModalProps {
  isOpen: boolean
  onClose: () => void
  agentName: string
  songName: string
  style: string
  lyrics: string
  evaluation?: Evaluation
  onSave: () => void
  onOverride: () => void
  isWinner: boolean
  isOverride?: boolean
}

export function SongDetailModal({
  isOpen,
  onClose,
  agentName,
  songName,
  style,
  lyrics,
  evaluation,
  onSave,
  onOverride,
  isWinner,
  isOverride
}: SongDetailModalProps) {
  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={songName} className="max-w-2xl">
      {/* Header Info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <span>by {agentName}</span>
          {isWinner && !isOverride && (
            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
              Orchestrator Pick
            </span>
          )}
          {isOverride && (
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
              User Override
            </span>
          )}
        </div>
        <p className="text-gray-300">{style}</p>
      </div>

      {/* Evaluation */}
      {evaluation && (
        <Card className="mb-4 p-3 bg-gray-900/50">
          <h4 className="font-medium text-gray-200 mb-2">Orchestrator Evaluation</h4>
          <p className="text-sm text-gray-400 mb-3">{evaluation.analysis}</p>

          {/* Scores */}
          <div className="grid grid-cols-4 gap-2 text-center mb-3">
            {[
              { label: 'Music', value: evaluation.scores.music_style },
              { label: 'Lyrics', value: evaluation.scores.lyrics },
              { label: 'Originality', value: evaluation.scores.originality },
              { label: 'Cohesion', value: evaluation.scores.cohesion },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className={cn(
                  'text-lg font-bold',
                  value >= 8 ? 'text-green-400' : value >= 5 ? 'text-yellow-400' : 'text-red-400'
                )}>
                  {value}
                </div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>

          {evaluation.recommendations && (
            <div className="text-sm text-gray-400 border-t border-gray-700 pt-2">
              <strong className="text-gray-300">Recommendations:</strong>
              <p>{evaluation.recommendations}</p>
            </div>
          )}
        </Card>
      )}

      {/* Lyrics */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-200 mb-2">Lyrics</h4>
        <div className="bg-gray-900/50 p-4 rounded-lg text-gray-300 whitespace-pre-wrap font-mono text-sm max-h-60 overflow-y-auto">
          {lyrics}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Close
        </Button>
        {!isWinner && !isOverride && (
          <Button onClick={onOverride} className="flex-1">
            <Check className="mr-2 h-4 w-4" />
            Pick This Song
          </Button>
        )}
        <Button onClick={onSave} className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          Save to Library
        </Button>
      </div>
    </Modal>
  )
}
