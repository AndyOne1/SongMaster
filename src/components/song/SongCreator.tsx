import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Agent, Artist } from '../../types'
import { AgentSelector } from './AgentSelector'
import { AgentTile } from './AgentTile'
import { SongDescriptionInputs } from './SongDescriptionInputs'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Save, Play } from 'lucide-react'
import { supabase } from '../../services/supabase/client'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function SongCreator() {
  const [searchParams] = useSearchParams()
  const artistId = searchParams.get('artist_id')
  const [, setIterationCount] = useState(0)

  const [agents, setAgents] = useState<Agent[]>([])
  const [loadingAgents, setLoadingAgents] = useState(true)
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [artist, setArtist] = useState<Artist | null>(null)
  const [songDescription, setSongDescription] = useState('')
  const [styleDescription, setStyleDescription] = useState('')

  // Generation state
  const [generating, setGenerating] = useState(false)
  const [agentStatuses, setAgentStatuses] = useState<Record<string, 'waiting' | 'generating' | 'evaluated'>>({})
  const [generationResults, setGenerationResults] = useState<Record<string, any>>({})
  const [orchestratorResult, setOrchestratorResult] = useState<any>(null)
  const [selectedSong, setSelectedSong] = useState<string | null>(null)

  useEffect(() => {
    loadAgents()
    if (artistId) loadArtist(artistId)
  }, [artistId])

  const loadAgents = async () => {
    setLoadingAgents(true)
    const { data } = await supabase
      .from('agents')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (data) {
      const fetchedAgents = data as Agent[]
      setAgents(fetchedAgents)
      if (fetchedAgents.length > 0) {
        // Select two generators by default (skip orchestrators at index 0-1)
        const generators = fetchedAgents.filter(a => a.id.startsWith('gen-'))
        if (generators.length >= 2) {
          setSelectedAgents([generators[0].id, generators[1].id])
        } else if (fetchedAgents.length >= 2) {
          // Fallback: just take any two agents
          setSelectedAgents([fetchedAgents[0].id, fetchedAgents[1].id])
        }
      }
    }
    setLoadingAgents(false)
  }

  const loadArtist = async (id: string) => {
    const { data } = await supabase
      .from('artists')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      setArtist(data as Artist)
      setStyleDescription(data.style_description)
    }
  }

  const handleAddAgent = (agentId: string) => {
    setSelectedAgents([...selectedAgents, agentId])
  }

  const handleRemoveAgent = (agentId: string) => {
    setSelectedAgents(selectedAgents.filter(id => id !== agentId))
  }

  const handleGenerate = async () => {
    if (selectedAgents.length === 0) {
      alert('Please select at least one agent')
      return
    }
    if (!songDescription.trim() || !styleDescription.trim()) {
      alert('Please describe the song and style')
      return
    }

    setGenerating(true)
    setAgentStatuses(Object.fromEntries(selectedAgents.map(id => [id, 'waiting'])))
    setGenerationResults({})
    setOrchestratorResult(null)
    setSelectedSong(null)

    try {
      // Build the prompt
      const artistContext = artist
        ? `Artist: ${artist.name}\nStyle: ${artist.style_description}\nCharacteristics: ${artist.special_characteristics}`
        : 'Create an original artist style'

      // Generate songs from each selected agent in parallel
      const generationPromises = selectedAgents.map(async (agentId) => {
        setAgentStatuses(prev => ({ ...prev, [agentId]: 'generating' }))

        const agent = agents.find(a => a.id === agentId)
        if (!agent) {
          console.error(`Agent not found: ${agentId}`)
          setAgentStatuses(prev => ({ ...prev, [agentId]: 'waiting' }))
          return { agentId, result: null }
        }

        const modelName = agent.model_name || agentId
        const prompt = `You are a professional songwriter.

Artist Context:
${artistContext}

Song Description: ${songDescription}
Desired Style: ${styleDescription}

Create an original song specification. Return JSON with:
- name: Song title (max 50 chars)
- lyrics: Complete song lyrics with verse/chorus structure
- style_description: Detailed music style notes`

        try {
          const response = await fetch(`${BACKEND_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agent: { id: agentId, name: agent.name, model_name: modelName },
              prompt,
              model_name: modelName,
            }),
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Generation failed: ${response.status} - ${errorText}`)
          }

          const data = await response.json()
          setAgentStatuses(prev => ({ ...prev, [agentId]: 'evaluated' }))
          return { agentId, result: data }
        } catch (error) {
          console.error(`Generation failed for ${agentId}:`, error)
          setAgentStatuses(prev => ({ ...prev, [agentId]: 'waiting' }))
          return { agentId, result: null }
        }
      })

      const results = await Promise.all(generationPromises)

      // Update results
      const validResults: Record<string, any> = {}
      for (const { agentId, result } of results) {
        if (result) {
          validResults[agentId] = result
        }
      }
      setGenerationResults(validResults)

      // If we have results, call orchestrator
      const resultEntries = Object.entries(validResults)
      if (resultEntries.length > 0) {
        setAgentStatuses(prev => ({ ...prev, ['orchestrator']: 'generating' }))

        const orchestratorAgent = agents.find(a => a.id.startsWith('orch-'))
        if (orchestratorAgent) {
          const orchestratorResponse = await fetch(`${BACKEND_URL}/api/orchestrate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `Evaluate these songs for: ${songDescription}\nStyle: ${styleDescription}`,
              songs: validResults,
              model_name: orchestratorAgent.model_name,
            }),
          })

          if (orchestratorResponse.ok) {
            const orchData = await orchestratorResponse.json()
            setOrchestratorResult(orchData)
            if (orchData.winner_agent_id) {
              setSelectedSong(orchData.winner_agent_id)
            }
          }
        }
        setAgentStatuses(prev => ({ ...prev, ['orchestrator']: 'evaluated' }))
      }
    } catch (error) {
      console.error('Generation failed:', error)
      alert('Failed to generate songs. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleIterate = async () => {
    if (!selectedSong) return
    setIterationCount(prev => prev + 1)
    await handleGenerate()
  }

  const handleSaveTemplate = () => {
    const name = prompt('Enter template name:')
    if (name) {
      alert(`Template "${name}" saved!`)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Create New Song</h1>
          {artist && (
            <p className="text-gray-500">Creating song for {artist.name}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveTemplate}>
            <Save className="mr-2 h-4 w-4" />
            Save Template
          </Button>
        </div>
      </div>

      {loadingAgents ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
        </div>
      ) : (
        <>
          <Card className="mb-6">
            <AgentSelector
              agents={agents}
              selectedAgents={selectedAgents}
              onAddAgent={handleAddAgent}
              onRemoveAgent={handleRemoveAgent}
            />
          </Card>

          <Card className="mb-6">
            <SongDescriptionInputs
              artist={artist}
              songDescription={songDescription}
              styleDescription={styleDescription}
              onSongDescriptionChange={setSongDescription}
              onStyleDescriptionChange={setStyleDescription}
            />
          </Card>

          <div className="mb-6 flex justify-center">
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={generating || selectedAgents.length === 0}
              className="px-8"
            >
              {generating ? (
                <>
                  <span className="animate-spin">⏳</span> Generating...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Generate Songs
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* Results */}
      {Object.keys(generationResults).length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-100">Generated Songs</h2>

          {/* Orchestrator Result */}
          {orchestratorResult && (
            <Card className="mb-6 border-primary-500/50 bg-primary-500/5 p-4">
              <h3 className="mb-2 font-medium text-gray-300">Orchestrator Recommendation</h3>
              <p className="text-sm text-gray-400">{orchestratorResult.feedback}</p>
              {orchestratorResult.winnerAgentId && (
                <p className="mt-2 text-sm">
                  Selected: <span className="font-medium text-primary-400">
                    {agents.find(a => a.id === orchestratorResult.winnerAgentId)?.name}
                  </span>
                </p>
              )}
            </Card>
          )}

          {/* Agent Tiles */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {selectedAgents.map((agentId) => {
              const agent = agents.find(a => a.id === agentId)
              if (!agent) return null // Skip if agent not loaded yet
              const status = agentStatuses[agentId] || 'waiting'
              const scores = generationResults[agentId]?.scores

              return (
                <AgentTile
                  key={agentId}
                  agent={agent}
                  status={status === 'generating' ? 'generating' : 'evaluated'}
                  scores={scores}
                  onClick={() => setSelectedSong(agentId)}
                />
              )
            })}
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-4">
            <Button onClick={handleIterate} disabled={!selectedSong}>
              Iterate on Selected Song
            </Button>
            <Button variant="outline">
              Save to Library
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
