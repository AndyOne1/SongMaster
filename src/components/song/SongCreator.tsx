import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
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
  // iterationCount kept for future use
  const [, setIterationCount] = useState(0)

  useEffect(() => {
    loadAgents()
    if (artistId) loadArtist()
  }, [artistId])

  const loadAgents = async () => {
    // Demo agents for testing - OpenRouter models
    const demoAgents: Agent[] = [
      // Orchestrators (for evaluation)
      {
        id: 'orch-1',
        name: 'GPT-5.2 Orchestrator',
        provider: 'OpenRouter',
        api_endpoint: 'https://openrouter.ai/api/v1',
        model_name: 'openai/gpt-5.2',
        capabilities: { context_window: 200000, max_output: 4000 },
        cost_per_1k_tokens: 0.01,
        is_active: true,
      },
      {
        id: 'orch-2',
        name: 'Claude-Sonnet-4.5 Orchestrator',
        provider: 'OpenRouter',
        api_endpoint: 'https://openrouter.ai/api/v1',
        model_name: 'anthropic/claude-sonnet-4-5',
        capabilities: { context_window: 200000, max_output: 4000 },
        cost_per_1k_tokens: 0.01,
        is_active: true,
      },
      // Generators
      {
        id: 'gen-1',
        name: 'Xiaomi Mimo v2 Flash',
        provider: 'OpenRouter',
        api_endpoint: 'https://openrouter.ai/api/v1',
        model_name: 'xiaomi/mimo-v2-flash:free',
        capabilities: { context_window: 16384, max_output: 2000 },
        cost_per_1k_tokens: 0,
        is_active: true,
      },
      {
        id: 'gen-2',
        name: 'Z-AI GLM-4.7',
        provider: 'OpenRouter',
        api_endpoint: 'https://openrouter.ai/api/v1',
        model_name: 'z-ai/glm-4.7',
        capabilities: { context_window: 128000, max_output: 4000 },
        cost_per_1k_tokens: 0.005,
        is_active: true,
      },
      {
        id: 'gen-3',
        name: 'MiniMax M2.1',
        provider: 'OpenRouter',
        api_endpoint: 'https://openrouter.ai/api/v1',
        model_name: 'minimax/minimax-m2.1',
        capabilities: { context_window: 32768, max_output: 4000 },
        cost_per_1k_tokens: 0.002,
        is_active: true,
      },
      {
        id: 'gen-4',
        name: 'Google Gemini 3 Flash',
        provider: 'OpenRouter',
        api_endpoint: 'https://openrouter.ai/api/v1',
        model_name: 'google/gemini-3-flash-preview',
        capabilities: { context_window: 1048576, max_output: 4000 },
        cost_per_1k_tokens: 0.001,
        is_active: true,
      },
      {
        id: 'gen-5',
        name: 'DeepSeek V3.2',
        provider: 'OpenRouter',
        api_endpoint: 'https://openrouter.ai/api/v1',
        model_name: 'deepseek/deepseek-v3.2',
        capabilities: { context_window: 65536, max_output: 4000 },
        cost_per_1k_tokens: 0.002,
        is_active: true,
      },
      {
        id: 'gen-6',
        name: 'xAI Grok 4.1 Fast',
        provider: 'OpenRouter',
        api_endpoint: 'https://openrouter.ai/api/v1',
        model_name: 'x-ai/grok-4.1-fast',
        capabilities: { context_window: 131072, max_output: 4000 },
        cost_per_1k_tokens: 0.005,
        is_active: true,
      },
    ]
    setAgents(demoAgents)
    if (selectedAgents.length === 0) {
      // Select two generators by default
      setSelectedAgents([demoAgents[2].id, demoAgents[3].id])
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
