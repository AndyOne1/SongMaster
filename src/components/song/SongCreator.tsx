import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Agent, Artist, DetailedEvaluation } from '../../types'
import { IterationContext } from '../../types/song'
import { AgentSelectionPanel } from './AgentSelectionPanel'
import { InputHistory } from './InputHistory'
import { AgentCard } from './AgentCard'
import { OrchestratorCard } from './OrchestratorCard'
import { SongDetailModal } from './SongDetailModal'
import { SongDescriptionInputs } from './SongDescriptionInputs'
import { SaveWarningDialog } from './SaveWarningDialog'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { supabase } from '../../services/supabase/client'
import { useToast } from '../ui/Toast'
import { Play, Users } from 'lucide-react'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface SongResult {
  name: string
  style: string
  lyrics: string
}

// Support both legacy (4 scores) and new detailed (6 scores) evaluation formats
interface Evaluation {
  suno_compliance?: DetailedEvaluation['suno_compliance']
  matched_request?: string | { alignment: string; explanation: string }
  scores?: DetailedEvaluation['scores']
  strengths?: DetailedEvaluation['strengths']
  weaknesses?: DetailedEvaluation['weaknesses']
  analysis?: DetailedEvaluation['analysis']
  recommendations?: string | DetailedEvaluation['recommendations']
  predicted_suno_result?: DetailedEvaluation['predicted_suno_result']
  commercial_potential?: DetailedEvaluation['commercial_potential']
}

export function SongCreator() {
  const [searchParams] = useSearchParams()
  const artistId = searchParams.get('artist_id')
  const { showToast } = useToast()

  // UI State
  const [step, setStep] = useState<'selection' | 'input' | 'generating' | 'results'>('selection')

  // Data
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([])
  const [selectedOrchestratorId, setSelectedOrchestratorId] = useState<string | null>(null)
  const [artist, setArtist] = useState<Artist | null>(null)
  const [songDescription, setSongDescription] = useState('')
  const [styleDescription, setStyleDescription] = useState('')

  // Results
  const [agentResults, setAgentResults] = useState<Record<string, SongResult>>({})
  const [agentStatuses, setAgentStatuses] = useState<Record<string, 'waiting' | 'generating' | 'done' | 'error'>>({})
  const [orchestratorStatus, setOrchestratorStatus] = useState<'waiting' | 'fetching' | 'analyzing' | 'scoring' | 'evaluating' | 'complete'>('waiting')
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({})
  const [winnerAgentId, setWinnerAgentId] = useState<string | null>(null)
  const [winnerReason, setWinnerReason] = useState('')
  const [winnerAnalysis, setWinnerAnalysis] = useState<{
    reason: string
    key_differentiators?: string[]
    best_for?: string
  } | null>(null)
  const [overrideAgentId, setOverrideAgentId] = useState<string | null>(null)
  const [generationProgress, setGenerationProgress] = useState<{
    phase: 'sending' | 'generating' | 'collecting' | 'evaluating' | 'complete'
    message: string
    completedCount?: number
    totalCount?: number
  }>({ phase: 'sending', message: 'Sending request...' })

  // Iteration
  const [iterationContext, setIterationContext] = useState<IterationContext | null>(null)
  const [iterationCount, setIterationCount] = useState(0)
  const [showSaveWarning, setShowSaveWarning] = useState(false)
  const [songSaved, setSongSaved] = useState(false)

  // Detail Modal
  const [detailModal, setDetailModal] = useState<{
    open: boolean
    agentId: string
  } | null>(null)

  useEffect(() => {
    loadAgents()
    if (artistId) loadArtist(artistId)
  }, [artistId])

  const loadAgents = async () => {
    const { data } = await supabase.from('agents').select('*').eq('is_active', true).order('name')
    if (data) {
      setAgents(data as Agent[])
    }
  }

  const loadArtist = async (id: string) => {
    const { data } = await supabase.from('artists').select('*').eq('id', id).single()
    if (data) {
      const artistData = data as Artist
      setArtist(artistData)
      setStyleDescription(artistData.style_description)

      // Pre-fill defaults from suno_guidelines if available
      if (artistData.suno_guidelines) {
        // Guidelines available for agent reference during generation
        // Can be parsed to extract style hints if needed
      }
    }
  }

  const handleAgentsSelected = (agentIds: string[], orchestratorId: string) => {
    setSelectedAgentIds(agentIds)
    setSelectedOrchestratorId(orchestratorId)
    setStep('input')
  }

  const handleSelectFromHistory = (songDesc: string, styleDesc: string) => {
    setSongDescription(songDesc)
    setStyleDescription(styleDesc)
  }

  const handleGenerate = async () => {
    if (selectedAgentIds.length === 0 || !selectedOrchestratorId) return

    // Save inputs to history
    if (songDescription.trim() || styleDescription.trim()) {
      import('./InputHistory').then(({ saveInputToHistory }) => {
        saveInputToHistory(songDescription, styleDescription, artist?.name)
      })
    }

    setStep('generating')
    setAgentResults({})
    setAgentStatuses(Object.fromEntries(selectedAgentIds.map(id => [id, 'waiting'])))
    setOrchestratorStatus('waiting')
    setEvaluations({})
    setWinnerAgentId(null)
    setWinnerReason('')
    setWinnerAnalysis(null)
    setOverrideAgentId(null)
    setGenerationProgress({ phase: 'sending', message: 'Sending requests to AI agents...' })

    try {
      // Generate song_id for tracking
      const newSongId = crypto.randomUUID()

      // Get selected agents
      const selectedAgents = agents.filter(a => selectedAgentIds.includes(a.id))
      const orchestrator = agents.find(a => a.id === selectedOrchestratorId)
      const totalAgents = selectedAgents.length

      // Build artist context
      const artistContext = artist
        ? `Artist: ${artist.name}
${artist.short_style_summary ? `Summary: ${artist.short_style_summary}` : ''}
${artist.agent_brief ? `Agent Brief: ${artist.agent_brief}` : ''}
Style: ${artist.style_description}
${artist.special_characteristics ? `Characteristics: ${artist.special_characteristics}` : ''}`
        : ''

      // Call all agents in parallel
      let completedCount = 0
      const generatePromises = selectedAgents.map(async (agent) => {
        setAgentStatuses(prev => ({ ...prev, [agent.id]: 'generating' }))

        try {
          const response = await fetch(`${BACKEND_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              song_id: newSongId,
              agents: [{ id: agent.id, model_name: agent.model_name }],
              user_request: songDescription,
              user_style: styleDescription,
              artist_context: artistContext
            })
          })

          if (!response.ok) throw new Error('Generation failed')

          const data = await response.json()
          completedCount++
          setGenerationProgress({
            phase: 'collecting',
            message: `Collecting agent outputs...`,
            completedCount,
            totalCount: totalAgents
          })
          setAgentStatuses(prev => ({ ...prev, [agent.id]: 'done' }))

          // Track failed agents from response
          if (data.failed_agents && data.failed_agents.length > 0) {
            console.log('Failed agents:', data.failed_agents)
          }

          if (data.results && data.results[agent.id]) {
            return { agentId: agent.id, result: data.results[agent.id] }
          }
        } catch (error) {
          console.error(`Generation failed for ${agent.id}:`, error)
          completedCount++
          setAgentStatuses(prev => ({ ...prev, [agent.id]: 'error' }))
        }
        return null
      })

      const results = await Promise.all(generatePromises)

      // Collect results
      const validResults: Record<string, SongResult> = {}
      for (const result of results) {
        if (result && result.agentId && result.result) {
          validResults[result.agentId] = result.result
        }
      }
      setAgentResults(validResults)

      // Call orchestrator if we have results
      if (Object.keys(validResults).length > 0 && orchestrator) {
        setOrchestratorStatus('fetching')
        setGenerationProgress({
          phase: 'evaluating',
          message: `Evaluating and scoring ${Object.keys(validResults).length} songs...`
        })

        const orchResponse = await fetch(`${BACKEND_URL}/api/orchestrate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            song_id: newSongId,
            user_request: songDescription,
            user_style: styleDescription,
            songs: validResults,
            orchestrator_model_name: orchestrator.model_name
          })
        })

        if (orchResponse.ok) {
          const data = await orchResponse.json()
          setEvaluations(data.evaluations || {})
          setWinnerAgentId(data.winner_agent_id)
          setWinnerReason(data.winner_reason || '')
          setWinnerAnalysis(data.winner_analysis || null)
        }

        setOrchestratorStatus('complete')
        setGenerationProgress({ phase: 'complete', message: 'Complete!' })
      } else {
        setGenerationProgress({ phase: 'complete', message: 'Complete!' })
      }

      setStep('results')
    } catch (error) {
      console.error('Generation failed:', error)
      showToast('Failed to generate songs. Please try again.', 'error')
      setStep('input')
    }
  }

  const handleSaveSong = async () => {
    // Save song to library
    const winnerId = overrideAgentId || winnerAgentId
    const winnerResult = winnerId ? agentResults[winnerId] : null
    const winnerEvaluation = winnerId ? evaluations[winnerId] : undefined

    if (!winnerResult) return

    const { error } = await supabase.from('songs').insert({
      name: winnerResult.name,
      lyrics: winnerResult.lyrics,
      style_description: winnerResult.style,
      status: 'saved',
      user_id: (await supabase.auth.getUser()).data.user?.id,
      artist_id: artistId,
      evaluation_data: winnerEvaluation || null,
      winner_agent_id: winnerId,
      winner_reason: winnerReason || null,
      winner_analysis: winnerAnalysis || null,
      iteration_count: iterationCount
    })

    if (!error) {
      setSongSaved(true)
      showToast(`"${winnerResult.name}" saved to library!`)
    } else {
      showToast('Failed to save song: ' + error.message, 'error')
    }
  }

  const handleIterate = (customInstruction?: string) => {
    const effectiveWinnerId = overrideAgentId || winnerAgentId
    const winnerEvaluation = effectiveWinnerId ? evaluations[effectiveWinnerId] : undefined

    if (!winnerEvaluation) {
      showToast('No evaluation data available for iteration', 'error')
      return
    }

    // Store the iteration context
    const recs = winnerEvaluation.recommendations as any
    setIterationContext({
      evaluation: {
        strengths: winnerEvaluation.strengths || [],
        weaknesses: winnerEvaluation.weaknesses || [],
        recommendations: {
          critical_fixes: recs?.critical_fixes || [],
          quick_wins: recs?.quick_wins || [],
          depth_enhancements: recs?.depth_enhancements || [],
          suno_optimization: recs?.suno_optimization || [],
        },
        scores: winnerEvaluation.scores,
      },
      original_request: songDescription,
      original_style: styleDescription,
      custom_instructions: customInstruction,
      iteration_number: iterationCount + 1,
    })

    // If song is already saved, proceed directly without warning
    if (songSaved) {
      executeIteration()
    } else {
      setShowSaveWarning(true)
    }
  }

  const handleSaveAndIterate = async () => {
    setShowSaveWarning(false)
    await handleSaveSong()
    await executeIteration()
  }

  const handleProceedWithoutSaving = () => {
    setShowSaveWarning(false)
    executeIteration()
  }

  const executeIteration = async () => {
    if (!iterationContext) return

    // New iteration result is not yet saved
    setSongSaved(false)
    setOrchestratorStatus('waiting')
    setEvaluations({})
    setWinnerAgentId(null)
    setWinnerReason('')
    setWinnerAnalysis(null)
    setOverrideAgentId(null)
    setGenerationProgress({ phase: 'sending', message: 'Sending requests to AI agents...' })

    try {
      const newSongId = crypto.randomUUID()
      const orchestrator = agents.find(a => a.id === selectedOrchestratorId)

      // Call all agents in parallel with iteration context
      let completedCount = 0
      const totalAgents = selectedAgentIds.length

      // Get the winning song content to iterate on
      const effectiveWinnerId = overrideAgentId || winnerAgentId
      const winnerSong = effectiveWinnerId ? agentResults[effectiveWinnerId] : null

      const generatePromises = selectedAgentIds.map(async (agentId) => {
        const agent = agents.find(a => a.id === agentId)
        setAgentStatuses(prev => ({ ...prev, [agentId]: 'generating' }))

        try {
          const response = await fetch(`${BACKEND_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              song_id: newSongId,
              agents: [{ id: agentId, model_name: agent?.model_name }],
              user_request: iterationContext.original_request,
              user_style: iterationContext.original_style,
              custom_instructions: iterationContext.custom_instructions,
              iteration_context: iterationContext,
              original_title: winnerSong?.name,
              iteration_number: iterationContext.iteration_number,
              // Pass the actual winning song content to iterate on
              base_song: winnerSong ? {
                lyrics: winnerSong.lyrics,
                style: winnerSong.style
              } : undefined
            })
          })

          if (!response.ok) throw new Error('Generation failed')

          const data = await response.json()
          completedCount++
          setGenerationProgress({
            phase: 'collecting',
            message: `Collecting agent outputs...`,
            completedCount,
            totalCount: totalAgents
          })
          setAgentStatuses(prev => ({ ...prev, [agentId]: 'done' }))

          if (data.results && data.results[agentId]) {
            return { agentId, result: data.results[agentId] }
          }
        } catch (error) {
          console.error(`Iteration failed for ${agentId}:`, error)
          setAgentStatuses(prev => ({ ...prev, [agentId]: 'error' }))
        }
        return null
      })

      const results = await Promise.all(generatePromises)

      // Collect results
      const validResults: Record<string, SongResult> = {}
      for (const result of results) {
        if (result && result.agentId && result.result) {
          validResults[result.agentId] = result.result
        }
      }
      setAgentResults(validResults)

      // Call orchestrator
      if (Object.keys(validResults).length > 0 && orchestrator) {
        setOrchestratorStatus('fetching')
        setGenerationProgress({
          phase: 'evaluating',
          message: `Evaluating and scoring ${Object.keys(validResults).length} songs...`
        })

        const orchResponse = await fetch(`${BACKEND_URL}/api/orchestrate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            song_id: newSongId,
            user_request: iterationContext.original_request,
            user_style: iterationContext.original_style,
            songs: validResults,
            orchestrator_model_name: orchestrator.model_name
          })
        })

        if (orchResponse.ok) {
          const data = await orchResponse.json()
          setEvaluations(data.evaluations || {})
          setWinnerAgentId(data.winner_agent_id)
          setWinnerReason(data.winner_reason || '')
          setWinnerAnalysis(data.winner_analysis || null)
        }

        setOrchestratorStatus('complete')
        setGenerationProgress({ phase: 'complete', message: 'Iteration complete!' })
      }

      setIterationCount(prev => prev + 1)
    } catch (error) {
      console.error('Iteration failed:', error)
      showToast('Iteration failed. Please try again.', 'error')
    }
  }

  const handleNewSong = () => {
    setStep('selection')
    setSongDescription('')
    setAgentResults({})
    setEvaluations({})
    setWinnerAgentId(null)
    setWinnerReason('')
    setWinnerAnalysis(null)
    setOverrideAgentId(null)
    setIterationCount(0)
    setSongSaved(false)
  }

  const handleOverride = (agentId: string) => {
    setOverrideAgentId(agentId)
    setDetailModal(null)
  }

  const orchestrator = agents.find(a => a.id === selectedOrchestratorId)
  const winnerId = overrideAgentId || winnerAgentId

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Create New Song</h1>
        {artist && (
          <div className="flex items-center gap-2">
            <p className="text-champagne-500">for</p>
            <span className="text-amber-400 font-medium">{artist.name}</span>
            {artist.artist_type && (
              <span className="text-xs px-2 py-0.5 rounded bg-violet-500/10 text-violet-400">
                {artist.artist_type}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Agent Selection Panel */}
      {step === 'selection' && (
        <AgentSelectionPanel
          onConfirm={handleAgentsSelected}
          agents={agents.filter(a => a.id.startsWith('gen-'))}
          orchestrators={agents.filter(a => a.id.startsWith('orch-'))}
        />
      )}

      {/* Loading Screen */}
      {step === 'generating' && (
        <Card className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-200 mb-2">
            {generationProgress.message}
          </h2>

          {/* Progress bar for collecting */}
          {generationProgress.phase === 'collecting' && generationProgress.totalCount && (
            <div className="max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{generationProgress.completedCount}/{generationProgress.totalCount} agents</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all duration-500"
                  style={{
                    width: `${((generationProgress.completedCount || 0) / generationProgress.totalCount) * 100}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Spinner dots animation */}
          <div className="flex justify-center gap-1 mt-4">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </Card>
      )}

      {/* Input Phase */}
      {step === 'input' && (
        <div className="flex gap-6">
          <div className="flex-1">
            <Card className="mb-6">
              <SongDescriptionInputs
                artist={artist}
                songDescription={songDescription}
                styleDescription={styleDescription}
                onSongDescriptionChange={setSongDescription}
                onStyleDescriptionChange={setStyleDescription}
              />
            </Card>

            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={!songDescription.trim() || !styleDescription.trim()}
                className="px-8"
              >
                <Play className="mr-2 h-5 w-5" />
                Generate Song
              </Button>
            </div>
          </div>

          {/* Input History */}
          <InputHistory
            songDescription={songDescription}
            styleDescription={styleDescription}
            onSelect={handleSelectFromHistory}
          />
        </div>
      )}

      {/* Results Phase */}
      {step === 'results' && (
        <div className="flex gap-6">
          {/* Orchestrator Card - Fixed on right */}
          <div className="w-80 flex-shrink-0">
            {orchestrator && (
              <div className="sticky top-6">
                <OrchestratorCard
                  orchestratorName={orchestrator.name}
                  status={orchestratorStatus}
                  winnerName={winnerId ? agentResults[winnerId]?.name : undefined}
                  winnerReason={winnerReason}
                  winnerScores={winnerId ? evaluations[winnerId]?.scores : undefined}
                  onSave={handleSaveSong}
                  onIterate={handleIterate}
                  onNewSong={handleNewSong}
                  winnerAnalysis={winnerAnalysis}
                  iterationCount={iterationCount}
                />
              </div>
            )}
          </div>

          {/* Agent Cards Grid */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-gray-400" />
              <span className="text-gray-400">
                {Object.keys(agentResults).length} song(s) generated
              </span>
              {selectedAgentIds.length > Object.keys(agentResults).length && (
                <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                  {selectedAgentIds.length - Object.keys(agentResults).length} failed
                </span>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {selectedAgentIds.map((agentId) => {
                const agent = agents.find(a => a.id === agentId)
                const status = agentStatuses[agentId] || 'waiting'
                const result = agentResults[agentId]
                const evaluation = evaluations[agentId]

                return (
                  <AgentCard
                    key={agentId}
                    agentName={agent?.name || 'Unknown'}
                    status={
                      overrideAgentId === agentId ? 'override' :
                      winnerId === agentId ? 'winner' :
                      status === 'error' ? 'error' :
                      status
                    }
                    songName={result?.name}
                    stylePreview={result?.style}
                    scores={evaluation?.scores}
                    onClick={() => setDetailModal({ open: true, agentId })}
                  />
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Song Detail Modal */}
      {detailModal && detailModal.open && (
        <SongDetailModal
          isOpen={true}
          onClose={() => setDetailModal(null)}
          agentName={agents.find(a => a.id === detailModal.agentId)?.name || ''}
          songName={agentResults[detailModal.agentId]?.name || ''}
          style={agentResults[detailModal.agentId]?.style || ''}
          lyrics={agentResults[detailModal.agentId]?.lyrics || ''}
          evaluation={evaluations[detailModal.agentId] as DetailedEvaluation | undefined}
          onSave={handleSaveSong}
          onOverride={() => handleOverride(detailModal.agentId)}
          isWinner={winnerId === detailModal.agentId}
          isOverride={overrideAgentId === detailModal.agentId}
          winnerAnalysis={winnerId === detailModal.agentId ? (winnerAnalysis || undefined) : undefined}
        />
      )}

      {/* Save Warning Dialog */}
      <SaveWarningDialog
        isOpen={showSaveWarning}
        onSaveAndContinue={handleSaveAndIterate}
        onProceedWithoutSaving={handleProceedWithoutSaving}
        onCancel={() => setShowSaveWarning(false)}
      />
    </div>
  )
}
