import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Agent, Artist } from '../../types'
import { AgentSelectionModal } from './AgentSelectionModal'
import { AgentCard } from './AgentCard'
import { OrchestratorCard } from './OrchestratorCard'
import { SongDetailModal } from './SongDetailModal'
import { SongDescriptionInputs } from './SongDescriptionInputs'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { supabase } from '../../services/supabase/client'
import { Play, Users } from 'lucide-react'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface SongResult {
  name: string
  style: string
  lyrics: string
}

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

export function SongCreator() {
  const [searchParams] = useSearchParams()
  const artistId = searchParams.get('artist_id')

  // UI State
  const [step, setStep] = useState<'selection' | 'input' | 'generating' | 'results'>('selection')
  const [showAgentModal, setShowAgentModal] = useState(true)

  // Data
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([])
  const [selectedOrchestratorId, setSelectedOrchestratorId] = useState<string | null>(null)
  const [artist, setArtist] = useState<Artist | null>(null)
  const [songDescription, setSongDescription] = useState('')
  const [styleDescription, setStyleDescription] = useState('')

  // Results
  const [songId, setSongId] = useState<string | null>(null)
  const [agentResults, setAgentResults] = useState<Record<string, SongResult>>({})
  const [agentStatuses, setAgentStatuses] = useState<Record<string, 'waiting' | 'generating' | 'done' | 'error'>>({})
  const [orchestratorStatus, setOrchestratorStatus] = useState<'waiting' | 'fetching' | 'analyzing' | 'scoring' | 'evaluating' | 'complete'>('waiting')
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({})
  const [winnerAgentId, setWinnerAgentId] = useState<string | null>(null)
  const [winnerReason, setWinnerReason] = useState('')
  const [overrideAgentId, setOverrideAgentId] = useState<string | null>(null)

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
      setArtist(data as Artist)
      setStyleDescription(data.style_description)
    }
  }

  const handleAgentsSelected = (agentIds: string[], orchestratorId: string) => {
    setSelectedAgentIds(agentIds)
    setSelectedOrchestratorId(orchestratorId)
    setShowAgentModal(false)
    setStep('input')
  }

  const handleGenerate = async () => {
    if (!songId || selectedAgentIds.length === 0 || !selectedOrchestratorId) return

    setStep('generating')
    setAgentResults({})
    setAgentStatuses(Object.fromEntries(selectedAgentIds.map(id => [id, 'waiting'])))
    setOrchestratorStatus('waiting')
    setEvaluations({})
    setWinnerAgentId(null)
    setWinnerReason('')
    setOverrideAgentId(null)

    try {
      // Generate song_id for tracking
      const newSongId = crypto.randomUUID()
      setSongId(newSongId)

      // Get selected agents
      const selectedAgents = agents.filter(a => selectedAgentIds.includes(a.id))
      const orchestrator = agents.find(a => a.id === selectedOrchestratorId)

      // Build prompt
      const artistContext = artist
        ? `Artist: ${artist.name}\nStyle: ${artist.style_description}\nCharacteristics: ${artist.special_characteristics}`
        : 'Create an original artist style'

      const prompt = `You are a professional songwriter.

Artist Context:
${artistContext}

Song Description: ${songDescription}
Desired Style: ${styleDescription}

Create an original song specification. Return JSON with:
- name: Song title (max 50 chars)
- style: Detailed music style description
- lyrics: Complete song lyrics with verse/chorus structure

Return valid JSON only.`

      // Call all agents in parallel
      const generatePromises = selectedAgents.map(async (agent) => {
        setAgentStatuses(prev => ({ ...prev, [agent.id]: 'generating' }))

        try {
          const response = await fetch(`${BACKEND_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              song_id: newSongId,
              agents: [{ id: agent.id, model_name: agent.model_name }],
              prompt,
              user_request: songDescription,
              user_style: styleDescription
            })
          })

          if (!response.ok) throw new Error('Generation failed')

          const data = await response.json()
          setAgentStatuses(prev => ({ ...prev, [agent.id]: 'done' }))

          if (data.results && data.results[agent.id]) {
            return { agentId: agent.id, result: data.results[agent.id] }
          }
        } catch (error) {
          console.error(`Generation failed for ${agent.id}:`, error)
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

        const orchResponse = await fetch(`${BACKEND_URL}/api/orchestrate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            song_id: newSongId,
            user_request: songDescription,
            user_style: styleDescription,
            songs: validResults
          })
        })

        if (orchResponse.ok) {
          const data = await orchResponse.json()
          setEvaluations(data.evaluations || {})
          setWinnerAgentId(data.winner_agent_id)
          setWinnerReason(data.winner_reason || '')
        }

        setOrchestratorStatus('complete')
      }

      setStep('results')
    } catch (error) {
      console.error('Generation failed:', error)
      alert('Failed to generate songs. Please try again.')
      setStep('input')
    }
  }

  const handleSaveSong = async () => {
    // Save song to library
    const winnerId = overrideAgentId || winnerAgentId
    const winnerResult = winnerId ? agentResults[winnerId] : null

    if (!winnerResult) return

    const { error } = await supabase.from('songs').insert({
      name: winnerResult.name,
      lyrics: winnerResult.lyrics,
      style_description: winnerResult.style,
      status: 'saved',
      user_id: (await supabase.auth.getUser()).data.user?.id,
      artist_id: artistId
    })

    if (!error) {
      alert(`"${winnerResult.name}" saved to library!`)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleIterate = (_customInstruction?: string) => {
    // TODO: Implement iteration
    alert('Iteration feature coming soon!')
  }

  const handleNewSong = () => {
    setStep('selection')
    setShowAgentModal(true)
    setSongDescription('')
    setAgentResults({})
    setEvaluations({})
    setWinnerAgentId(null)
    setWinnerReason('')
    setOverrideAgentId(null)
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
        {artist && <p className="text-gray-500">for {artist.name}</p>}
      </div>

      {/* Agent Selection Modal */}
      <AgentSelectionModal
        isOpen={showAgentModal && step === 'selection'}
        onClose={() => {}}
        onConfirm={handleAgentsSelected}
        agents={agents.filter(a => a.id.startsWith('gen-'))}
        orchestrators={agents.filter(a => a.id.startsWith('orch-'))}
      />

      {/* Loading Screen */}
      {step === 'generating' && (
        <Card className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-200 mb-2">Loading your Team...</h2>
          <p className="text-gray-500">Agents are working on your song</p>
        </Card>
      )}

      {/* Input Phase */}
      {step === 'input' && (
        <>
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
        </>
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
                  onSave={handleSaveSong}
                  onIterate={handleIterate}
                  onNewSong={handleNewSong}
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
          evaluation={evaluations[detailModal.agentId]}
          onSave={handleSaveSong}
          onOverride={() => handleOverride(detailModal.agentId)}
          isWinner={winnerId === detailModal.agentId}
          isOverride={overrideAgentId === detailModal.agentId}
        />
      )}
    </div>
  )
}
