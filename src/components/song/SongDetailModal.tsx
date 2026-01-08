import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Save, Check, AlertTriangle, TrendingUp } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { DetailedEvaluation } from '../../types'

interface SongDetailModalProps {
  isOpen: boolean
  onClose: () => void
  agentName: string
  songName: string
  style: string
  lyrics: string
  evaluation?: DetailedEvaluation | Record<string, unknown>
  onSave: () => void
  onOverride: () => void
  isWinner: boolean
  isOverride?: boolean
  winnerAnalysis?: {
    reason: string
    key_differentiators?: string[]
    best_for?: string
  } | undefined
}

function ScoreBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className={cn(
        'text-2xl font-bold',
        value >= 8 ? 'text-green-400' : value >= 6 ? 'text-yellow-400' : value >= 4 ? 'text-orange-400' : 'text-red-400'
      )}>
        {value}
      </div>
      <div className="text-xs text-gray-500 text-center leading-tight">{label}</div>
    </div>
  )
}

function ScoreGrid({ scores }: { scores: DetailedEvaluation['scores'] | undefined }) {
  if (!scores) return null

  const scoreItems: { key: keyof NonNullable<DetailedEvaluation['scores']>; label: string }[] = [
    { key: 'music_style', label: 'Music' },
    { key: 'lyrics', label: 'Lyrics' },
    { key: 'originality', label: 'Originality' },
    { key: 'cohesion', label: 'Cohesion' },
  ]

  // Add 5th score if present
  if (scores.request_alignment) {
    scoreItems.push({ key: 'request_alignment', label: 'Alignment' })
  }

  return (
    <div className="grid grid-cols-6 gap-2 text-center mb-4">
      {scoreItems.map(({ key, label }) => (
        <div key={key}>
          <ScoreBadge label={label} value={scores[key] ?? 0} />
        </div>
      ))}
    </div>
  )
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
  isOverride,
  winnerAnalysis
}: SongDetailModalProps) {
  if (!isOpen) return null

  // Cast to DetailedEvaluation for type-safe access
  const evalData = evaluation as DetailedEvaluation | undefined

  // Helper to get matched request explanation
  const getMatchedRequestText = (): string | null => {
    if (!evalData?.matched_request) return null
    const mr = evalData.matched_request
    if (typeof mr === 'string') return mr
    return mr.explanation || null
  }

  // Helper to get recommendations
  const getRecommendations = (): string | DetailedEvaluation['recommendations'] | null => {
    if (!evalData?.recommendations) return null
    return evalData.recommendations
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={songName} className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
      {evalData && (
        <div className="space-y-4 mb-4">
          {/* Suno Compliance */}
          {evalData.suno_compliance && (
            <Card className="p-3 bg-gray-900/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-200">Suno v5 Compliance</h4>
                <span className={cn(
                  'text-sm font-bold',
                  evalData.suno_compliance.score >= 8 ? 'text-green-400' :
                  evalData.suno_compliance.score >= 6 ? 'text-yellow-400' : 'text-red-400'
                )}>
                  {evalData.suno_compliance.score}/10
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded',
                  evalData.suno_compliance.will_it_work === 'Yes' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                )}>
                  {evalData.suno_compliance.will_it_work === 'Yes' ? 'Will Work in Suno' : 'May Have Issues'}
                </span>
              </div>
              {evalData.suno_compliance.issues && evalData.suno_compliance.issues.length > 0 && (
                <div className="text-sm text-gray-400">
                  <strong className="text-gray-300">Issues:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {evalData.suno_compliance.issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}

          {/* Matched Request */}
          {getMatchedRequestText() && (
            <Card className="p-3 bg-gray-900/50">
              <h4 className="font-medium text-gray-200 mb-2">Request Match</h4>
              {typeof evalData.matched_request !== 'string' && evalData.matched_request?.alignment && (
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded mb-2 inline-block',
                  evalData.matched_request.alignment === 'Excellent' ? 'bg-green-500/20 text-green-400' :
                  evalData.matched_request.alignment === 'Good' ? 'bg-blue-500/20 text-blue-400' :
                  evalData.matched_request.alignment === 'Partial' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                )}>
                  {evalData.matched_request.alignment}
                </span>
              )}
              <p className="text-sm text-gray-400">{getMatchedRequestText()}</p>
            </Card>
          )}

          {/* Scores - Show 6 scores for new format, 4 for legacy */}
          {evalData.scores && (
            <Card className="p-3 bg-gray-900/50">
              <h4 className="font-medium text-gray-200 mb-3">Scores</h4>
              <ScoreGrid scores={evalData.scores} />
            </Card>
          )}

          {/* Analysis */}
          {evalData.analysis && (
            <Card className="p-3 bg-gray-900/50">
              <h4 className="font-medium text-gray-200 mb-2">Analysis</h4>
              <p className="text-sm text-gray-400">{evalData.analysis}</p>
            </Card>
          )}

          {/* Strengths & Weaknesses */}
          {(evalData.strengths?.length || evalData.weaknesses?.length) && (
            <Card className="p-3 bg-gray-900/50">
              <div className="grid grid-cols-2 gap-4">
                {evalData.strengths?.length && (
                  <div>
                    <h4 className="font-medium text-green-400 mb-2 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" /> Strengths
                    </h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      {evalData.strengths.map((s, i) => (
                        <li key={i} className="list-disc list-inside">{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {evalData.weaknesses?.length && (
                  <div>
                    <h4 className="font-medium text-orange-400 mb-2 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" /> Weaknesses
                    </h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      {evalData.weaknesses.map((w, i) => (
                        <li key={i} className="list-disc list-inside">{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Recommendations */}
          {getRecommendations() && (
            <Card className="p-3 bg-gray-900/50">
              <h4 className="font-medium text-gray-200 mb-3">Recommendations</h4>

              {typeof evalData.recommendations !== 'string' && evalData.recommendations && (
                <div className="space-y-3">
                  {evalData.recommendations.critical_fixes?.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-red-400 mb-1">Critical Fixes</h5>
                      <ul className="text-sm text-gray-400 list-disc list-inside">
                        {evalData.recommendations.critical_fixes.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {evalData.recommendations.quick_wins?.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-yellow-400 mb-1">Quick Wins</h5>
                      <ul className="text-sm text-gray-400 list-disc list-inside">
                        {evalData.recommendations.quick_wins.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {evalData.recommendations.suno_optimization?.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-blue-400 mb-1">Suno Optimization</h5>
                      <ul className="text-sm text-gray-400 list-disc list-inside">
                        {evalData.recommendations.suno_optimization.map((o, i) => (
                          <li key={i}>{o}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {evalData.recommendations.depth_enhancements?.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-green-400 mb-1">Depth Enhancements</h5>
                      <ul className="text-sm text-gray-400 list-disc list-inside">
                        {evalData.recommendations.depth_enhancements.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {typeof evalData.recommendations === 'string' && (
                <p className="text-sm text-gray-400">{evalData.recommendations}</p>
              )}
            </Card>
          )}

          {/* Predicted Suno Result */}
          {evalData.predicted_suno_result && (
            <Card className="p-3 bg-gray-900/50">
              <h4 className="font-medium text-gray-200 mb-2">Predicted Suno Result</h4>
              <p className="text-sm text-gray-400">{evalData.predicted_suno_result}</p>
            </Card>
          )}

          {/* Commercial Potential */}
          {evalData.commercial_potential && (
            <Card className="p-3 bg-gray-900/50">
              <h4 className="font-medium text-gray-200 mb-2">Commercial Potential</h4>
              <p className="text-sm text-gray-400">{evalData.commercial_potential}</p>
            </Card>
          )}

          {/* Winner Analysis (if this is the winner) */}
          {isWinner && winnerAnalysis && (
            <Card className="p-3 bg-yellow-500/10 border border-yellow-500/30">
              <h4 className="font-medium text-yellow-400 mb-2">Why This Song Won</h4>
              <p className="text-sm text-gray-300 mb-3">{winnerAnalysis.reason}</p>
              {winnerAnalysis.key_differentiators && winnerAnalysis.key_differentiators.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-yellow-400 uppercase">Key Differentiators:</span>
                  <ul className="text-sm text-gray-400 list-disc list-inside">
                    {winnerAnalysis.key_differentiators.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
              {winnerAnalysis.best_for && (
                <div className="text-sm text-gray-400">
                  <span className="text-xs text-yellow-400 uppercase">Best For:</span> {winnerAnalysis.best_for}
                </div>
              )}
            </Card>
          )}
        </div>
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
