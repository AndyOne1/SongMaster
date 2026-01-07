import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../services/supabase/client'
import { Agent, Artist } from '../../types'
import { AgentSelector } from './AgentSelector'
import { AgentTile } from './AgentTile'
import { SongDescriptionInputs } from './SongDescriptionInputs'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Save, Play } from 'lucide-react'

export function SongCreator() {
  const [searchParams] = useSearchParams()
  const artistId = searchParams.get('artist_id')

  const [agents, setAgents] = useState<Agent[]>([])
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
  const [iterationCount, setIterationCount] = useState(0)

  useEffect(() => {
    loadAgents()
    if (artistId) loadArtist()
  }, [artistId])

  const loadAgents = async () => {
    // Demo agents for testing
    const demoAgents: Agent[] = [
      {
        id: '1',
        name: 'Claude',
        provider: 'Anthropic',
        api_endpoint: 'https://api.anthropic.com',
        model_name: 'claude-sonnet-4',
        capabilities: { context_window: 200000 },
        cost_per_1k_tokens: 0.01,
        is_active: true,
      },
      {
        id: '2',
        name: 'GPT-4o',
        provider: 'OpenAI',
        api_endpoint: 'https://api.openai.com',
        model_name: 'gpt-4o',
        capabilities: { context_window: 128000 },
        cost_per_1k_tokens: 0.03,
        is_active: true,
      },
      {
        id: '3',
        name: 'Grok',
        provider: 'xAI',
        api_endpoint: 'https://api.x.ai',
        model_name: 'grok-2-1212',
        capabilities: { context_window: 131072 },
        cost_per_1k_tokens: 0.02,
        is_active: true,
      },
    ]
    setAgents(demoAgents)
    if (selectedAgents.length === 0) {
      setSelectedAgents(demoAgents.slice(0, 2).map(a => a.id))
    }
  }

  const loadArtist = async () => {
    // Demo artist
    setArtist({
      id: 'demo-artist',
      user_id: 'demo',
      name: 'Neon Horizon',
      style_description: 'Synthwave band with dreamy 80s aesthetics',
      special_characteristics: 'Retro synth leads and driving basslines',
      created_at: new Date(),
    })
    setStyleDescription('Synthwave band with dreamy 80s aesthetics')
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
      // Simulate generation with demo data
      for (const agentId of selectedAgents) {
        await new Promise(resolve => setTimeout(resolve, 1500))
        setAgentStatuses(prev => ({ ...prev, [agentId]: 'generating' }))

        const agent = agents.find(a => a.id === agentId)!
        setGenerationResults(prev => ({
          ...prev,
          [agentId]: {
            name: `${agent.name}'s Song`,
            lyrics: 'Demo lyrics for the song...',
            style_description: styleDescription,
            scores: {
              music_style: Math.floor(Math.random() * 3) + 7,
              lyrics: Math.floor(Math.random() * 3) + 6,
              originality: Math.floor(Math.random() * 3) + 5,
              cohesion: Math.floor(Math.random() * 3) + 6,
            }
          }
        }))
        setAgentStatuses(prev => ({ ...prev, [agentId]: 'evaluated' }))
      }

      // Simulate orchestrator result
      const results = Object.entries(generationResults)
      if (results.length > 0) {
        const winnerId = selectedAgents[Math.floor(Math.random() * selectedAgents.length)]
        setOrchestratorResult({
          winnerAgentId: winnerId,
          feedback: 'This song has a strong melodic structure and matches the requested style well.',
        })
        setSelectedSong(winnerId)
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
              const agent = agents.find(a => a.id === agentId)!
              const status = agentStatuses[agentId] as any
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
