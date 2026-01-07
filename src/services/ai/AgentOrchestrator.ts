import { Agent, AgentOutput } from '../../types'
import { AgentFactory } from './AgentFactory'

interface OrchestratorParams {
  songs: Record<string, AgentOutput>
  masterPrompt?: string
}

interface OrchestratorResult {
  scores: Record<string, {
    music_style: number
    lyrics: number
    originality: number
    cohesion: number
    total: number
  }>
  feedback: Record<string, string>
  winnerAgentId: string
}

const DEFAULT_ORCHESTRATOR_PROMPT = `You are an expert music producer. Evaluate these song specifications and score them.

# Songs to Evaluate
{songs}

# Scoring Criteria (1-10 each)
1. Music Style: How well does the style match the request?
2. Lyrics: Quality, coherence, and emotional impact of lyrics
3. Originality: Creative and unique elements
4. Cohesion: How well do lyrics and music style work together?

# Output Format
For each song, provide:
- Individual scores (music_style, lyrics, originality, cohesion)
- Brief feedback explaining the scores
- A final recommendation

Identify the overall best song and explain why.`

export async function orchestrateAndEvaluate(params: OrchestratorParams): Promise<OrchestratorResult> {
  // Build songs summary for orchestrator
  const songsSummary = Object.entries(params.songs).map(([agentId, song]) => {
    return `[Agent: ${agentId}]
Name: ${song.name}
Style: ${song.style_description}
Lyrics: ${song.lyrics.substring(0, 500)}...`
  }).join('\n\n---\n\n')

  let prompt = DEFAULT_ORCHESTRATOR_PROMPT.replace('{songs}', songsSummary)
  if (params.masterPrompt) {
    prompt = params.masterPrompt + '\n\n' + prompt
  }

  // Call orchestrator API (uses backend for actual AI calls)
  try {
    const response = await fetch('/api/orchestrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, songs: params.songs }),
    })

    const data = await response.json()

    const scores: Record<string, any> = {}
    const feedback: Record<string, string> = {}

    Object.entries(params.songs).forEach(([agentId, _song]) => {
      scores[agentId] = {
        music_style: data.scores?.[agentId]?.music_style || 5,
        lyrics: data.scores?.[agentId]?.lyrics || 5,
        originality: data.scores?.[agentId]?.originality || 5,
        cohesion: data.scores?.[agentId]?.cohesion || 5,
        total: 0,
      }
      scores[agentId].total = (
        scores[agentId].music_style +
        scores[agentId].lyrics +
        scores[agentId].originality +
        scores[agentId].cohesion
      ) / 4

      feedback[agentId] = data.feedback?.[agentId] || ''
    })

    const winnerAgentId = Object.entries(scores)
      .sort(([, a], [, b]) => b.total - a.total)[0]?.[0] || ''

    return {
      scores,
      feedback,
      winnerAgentId,
    }
  } catch (error) {
    console.error('Orchestration failed:', error)
    // Return demo scores for testing
    const scores: Record<string, any> = {}
    const feedback: Record<string, string> = {}

    Object.entries(params.songs).forEach(([agentId]) => {
      scores[agentId] = {
        music_style: Math.floor(Math.random() * 4) + 6,
        lyrics: Math.floor(Math.random() * 4) + 5,
        originality: Math.floor(Math.random() * 4) + 5,
        cohesion: Math.floor(Math.random() * 4) + 6,
        total: 0,
      }
      scores[agentId].total = (
        scores[agentId].music_style +
        scores[agentId].lyrics +
        scores[agentId].originality +
        scores[agentId].cohesion
      ) / 4
      feedback[agentId] = 'Demo feedback for this song.'
    })

    const winnerAgentId = Object.entries(scores)
      .sort(([, a], [, b]) => b.total - a.total)[0]?.[0] || ''

    return {
      scores,
      feedback,
      winnerAgentId,
    }
  }
}

export async function generateSong(params: {
  agent: Agent
  songDescription: string
  styleDescription: string
  artistContext?: { name: string; style_description: string; special_characteristics?: string }
  previousSong?: AgentOutput
  iterationFeedback?: string
}): Promise<AgentOutput & { scores?: any }> {
  return AgentFactory.generate(params)
}
