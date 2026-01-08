import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Agent, Artist } from '../../types'
import { SongDescriptionInputs } from './SongDescriptionInputs'
import { SongResultTile } from './SongResultTile'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Play, Users, Trophy, Check } from 'lucide-react'
import { supabase } from '../../services/supabase/client'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function SongCreator() {
  const [searchParams] = useSearchParams()
  const artistId = searchParams.get('artist_id')

  const [agents, setAgents] = useState<Agent[]>([])
  const [generators, setGenerators] = useState<Agent[]>([])
  const [orchestrators, setOrchestrators] = useState<Agent[]>([])
  const [loadingAgents, setLoadingAgents] = useState(true)

  // Selected agents
  const [selectedGeneratorIds, setSelectedGeneratorIds] = useState<string[]>([])
  const [selectedOrchestratorId, setSelectedOrchestratorId] = useState<string | null>(null)

  const [artist, setArtist] = useState<Artist | null>(null)
  const [songDescription, setSongDescription] = useState('')
  const [styleDescription, setStyleDescription] = useState('')

  // Generation state
  const [generating, setGenerating] = useState(false)
  const [generatorStatuses, setGeneratorStatuses] = useState<Record<string, 'waiting' | 'generating' | 'evaluated'>>({})
  const [generationResults, setGenerationResults] = useState<Record<string, any>>({})
  const [orchestratorStatus, setOrchestratorStatus] = useState<'waiting' | 'generating' | 'evaluated'>('waiting')
  const [orchestratorResult, setOrchestratorResult] = useState<any>(null)
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null)

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
      const allAgents = data as Agent[]
      setAgents(allAgents)

      // Separate generators and orchestrators
      const genAgents = allAgents.filter(a => a.id.startsWith('gen-'))
      const orchAgents = allAgents.filter(a => a.id.startsWith('orch-'))

      setGenerators(genAgents)
      setOrchestrators(orchAgents)

      // Select first 2 generators by default
      if (genAgents.length >= 2) {
        setSelectedGeneratorIds([genAgents[0].id, genAgents[1].id])
      } else if (genAgents.length >= 1) {
        setSelectedGeneratorIds([genAgents[0].id])
      }

      // Select first orchestrator by default
      if (orchAgents.length >= 1) {
        setSelectedOrchestratorId(orchAgents[0].id)
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

  const toggleGenerator = (agentId: string) => {
    if (selectedGeneratorIds.includes(agentId)) {
      setSelectedGeneratorIds(selectedGeneratorIds.filter(id => id !== agentId))
    } else {
      setSelectedGeneratorIds([...selectedGeneratorIds, agentId])
    }
  }

  const selectOrchestrator = (agentId: string) => {
    setSelectedOrchestratorId(agentId)
  }

  const handleGenerate = async () => {
    if (selectedGeneratorIds.length === 0) {
      alert('Please select at least one generator agent')
      return
    }
    if (!selectedOrchestratorId) {
      alert('Please select an orchestrator')
      return
    }
    if (!songDescription.trim() || !styleDescription.trim()) {
      alert('Please describe the song and style')
      return
    }

    setGenerating(true)
    setGeneratorStatuses(Object.fromEntries(selectedGeneratorIds.map(id => [id, 'waiting'])))
    setGenerationResults({})
    setOrchestratorStatus('waiting')
    setOrchestratorResult(null)
    setSelectedSongId(null)

    try {
      const artistContext = artist
        ? `Artist: ${artist.name}\nStyle: ${artist.style_description}\nCharacteristics: ${artist.special_characteristics}`
        : 'Create an original artist style'

      // Generate songs from each selected generator in parallel
      const generationPromises = selectedGeneratorIds.map(async (agentId) => {
        setGeneratorStatuses(prev => ({ ...prev, [agentId]: 'generating' }))

        const agent = generators.find(a => a.id === agentId)
        if (!agent) return { agentId, result: null }

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
              agent: { id: agentId, name: agent.name, model_name: agent.model_name },
              prompt,
              model_name: agent.model_name,
            }),
          })

          if (!response.ok) {
            throw new Error(`Generation failed: ${response.status}`)
          }

          const data = await response.json()
          setGeneratorStatuses(prev => ({ ...prev, [agentId]: 'evaluated' }))
          return { agentId, result: data }
        } catch (error) {
          console.error(`Generation failed for ${agentId}:`, error)
          setGeneratorStatuses(prev => ({ ...prev, [agentId]: 'waiting' }))
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

      // Call orchestrator if we have results
      if (Object.keys(validResults).length > 0) {
        setOrchestratorStatus('generating')

        const orchestrator = orchestrators.find(a => a.id === selectedOrchestratorId)
        if (orchestrator) {
          const orchestratorResponse = await fetch(`${BACKEND_URL}/api/orchestrate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `Evaluate these songs for: ${songDescription}\nStyle: ${styleDescription}`,
              songs: validResults,
              model_name: orchestrator.model_name,
            }),
          })

          if (orchestratorResponse.ok) {
            const data = await orchestratorResponse.json()
            setOrchestratorResult(data)
            if (data.winner_agent_id) {
              setSelectedSongId(data.winner_agent_id)
            }
          }
        }
        setOrchestratorStatus('evaluated')
      }
    } catch (error) {
      console.error('Generation failed:', error)
      alert('Failed to generate songs. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  if (loadingAgents) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
      </div>
    )
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
      </div>

      {/* Generator Agents Selection */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary-400" />
          <h2 className="text-lg font-semibold text-gray-200">Generator Agents</h2>
          <span className="text-xs text-gray-500">(Select multiple)</span>
        </div>
        <p className="text-sm text-gray-400 mb-4">These agents will generate song specifications in parallel.</p>
        <div className="flex flex-wrap gap-2">
          {generators.map((agent) => {
            const isSelected = selectedGeneratorIds.includes(agent.id)
            return (
              <button
                key={agent.id}
                onClick={() => toggleGenerator(agent.id)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                  isSelected
                    ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                }`}
              >
                {isSelected && <Check className="h-4 w-4" />}
                <span className="text-sm">{agent.name}</span>
              </button>
            )
          })}
          {generators.length === 0 && (
            <p className="text-gray-500">No generator agents available</p>
          )}
        </div>
      </Card>

      {/* Orchestrator Selection */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <h2 className="text-lg font-semibold text-gray-200">Orchestrator</h2>
          <span className="text-xs text-gray-500">(Select one)</span>
        </div>
        <p className="text-sm text-gray-400 mb-4">This agent will evaluate and score all generated songs.</p>
        <div className="flex flex-wrap gap-2">
          {orchestrators.map((agent) => {
            const isSelected = selectedOrchestratorId === agent.id
            return (
              <button
                key={agent.id}
                onClick={() => selectOrchestrator(agent.id)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                  isSelected
                    ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                }`}
              >
                {isSelected && <Check className="h-4 w-4" />}
                <span className="text-sm">{agent.name}</span>
              </button>
            )
          })}
          {orchestrators.length === 0 && (
            <p className="text-gray-500">No orchestrator agents available</p>
          )}
        </div>
      </Card>

      {/* Song Description */}
      <Card className="mb-6">
        <SongDescriptionInputs
          artist={artist}
          songDescription={songDescription}
          styleDescription={styleDescription}
          onSongDescriptionChange={setSongDescription}
          onStyleDescriptionChange={setStyleDescription}
        />
      </Card>

      {/* Generate Button */}
      <div className="mb-6 flex justify-center">
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={generating || selectedGeneratorIds.length === 0 || !selectedOrchestratorId}
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

      {/* Results */}
      {Object.keys(generationResults).length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-100">Generated Songs</h2>

          {/* Orchestrator Result */}
          {orchestratorResult && orchestratorStatus === 'evaluated' && (
            <Card className="mb-6 border-yellow-500/30 bg-yellow-500/5 p-4">
              <div className="flex items-start gap-3">
                <Trophy className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-200">Orchestrator Evaluation</h3>
                  {orchestratorResult.feedback && (
                    <p className="text-sm text-gray-400 mt-1">{orchestratorResult.feedback}</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Generator Status */}
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">
              {Object.values(generationResults).length} song(s) generated
            </span>
          </div>

          {/* Song Tiles */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {selectedGeneratorIds.map((agentId) => {
              const agent = generators.find(a => a.id === agentId)
              const status = generatorStatuses[agentId] || 'waiting'
              const result = generationResults[agentId]
              const isWinner = selectedSongId === agentId

              if (!result) return null

              return (
                <SongResultTile
                  key={agentId}
                  agentName={agent?.name || 'Unknown'}
                  songName={result.name}
                  lyrics={result.lyrics}
                  styleDescription={result.style_description}
                  status={status}
                  isWinner={isWinner}
                  onSelect={() => setSelectedSongId(agentId)}
                />
              )
            })}
          </div>

          {/* Selected Song Actions */}
          {selectedSongId && generationResults[selectedSongId] && (
            <div className="mt-6 flex flex-wrap gap-4">
              <Button onClick={() => {
                const song = generationResults[selectedSongId]
                // TODO: Save song to library
                alert(`Save "${song.name}" to library? (Not implemented yet)`)
              }}>
                Save to Library
              </Button>
              <Button variant="outline" onClick={() => {
                // TODO: Iterate on selected song
                alert('Iteration feature coming soon!')
              }}>
                Iterate on This Song
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
