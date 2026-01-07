import { Agent, AgentOutput } from '../../types'
import { promptService } from '../prompts/PromptService'

interface GenerationParams {
  agent: Agent
  songDescription: string
  styleDescription: string
  artistContext?: {
    name: string
    style_description: string
    special_characteristics?: string
  }
  previousSong?: AgentOutput
  iterationFeedback?: string
}

const FALLBACK_PROMPT = `You are a professional songwriter. Create an original song specification.

# Context
- Artist Style: {artist_context}
- Song Description: {song_description}
- Desired Style: {style_description}

{iteration_feedback}

# Output Format
Return a JSON object with:
- name: Song title (max 50 chars)
- lyrics: Complete song lyrics with verse/chorus structure
- style_description: Detailed music style notes

Create a unique, creative song that matches the description.`

// Backend URL - set via environment variable for production
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export class AgentFactory {
  static async getDefaultPrompt(): Promise<string> {
    const dbPrompt = await promptService.getPrompt('song_generation')
    if (dbPrompt) return dbPrompt
    return FALLBACK_PROMPT
  }

  static async createPrompt(params: GenerationParams): Promise<string> {
    const defaultPrompt = await this.getDefaultPrompt()
    let prompt = defaultPrompt
      .replace('{artist_context}', params.artistContext
        ? `${params.artistContext.name} - ${params.artistContext.style_description}${params.artistContext.special_characteristics ? ` (Special: ${params.artistContext.special_characteristics})` : ''}`
        : 'No specific artist context')
      .replace('{song_description}', params.songDescription)
      .replace('{style_description}', params.styleDescription)

    if (params.iterationFeedback && params.previousSong) {
      prompt += `

# Previous Version
Song: ${params.previousSong.name}
Style: ${params.previousSong.style_description}
Lyrics: ${params.previousSong.lyrics}

# Feedback to Apply
${params.iterationFeedback}`
    }

    return prompt
  }

  static async generate(params: GenerationParams): Promise<AgentOutput> {
    const prompt = await this.createPrompt(params)

    // Call the backend API (which handles all AI providers securely)
    try {
      const response = await fetch(`${BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: params.agent,
          prompt,
          model_name: params.agent.model_name,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `API error: ${response.status}`)
      }

      const data = await response.json()
      return this.parseOutput(JSON.stringify(data))
    } catch (error) {
      console.error('Generation failed:', error)
      // Fallback to demo mode for development
      return this.generateDemo(params.agent.name)
    }
  }

  // Generate demo output for development/testing
  private static generateDemo(agentName: string): AgentOutput {
    return {
      name: `${agentName}'s Song`,
      lyrics: `Verse 1:
Walking down the street, feeling free
The sun is shining, just you and me
Every moment feels brand new
With nothing but this melody

Chorus:
This is our song tonight
Dancing under neon lights
Everything feels right
With you by my side

Verse 2:
Memories we made along the way
Will stay with us both night and day
Our hearts beat to the same rhythm
In this perfect, timeless rhythm

[Chorus]

Bridge:
Nothing else matters now
Just you and me, here and now
Our love shines so bright
Guiding us through the night

[Chorus]

Outro:
This song will never end
Our story's just beginning
Together we'll prevail
On this endless trail`,
      style_description: 'A pop-rock song with catchy melodies, driving rhythm guitar, and an uplifting chorus.',
    }
  }

  private static parseOutput(text: string): AgentOutput {
    try {
      // Try to parse as JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          name: parsed.name || 'Untitled',
          lyrics: parsed.lyrics || '',
          style_description: parsed.style_description || '',
        }
      }
    } catch {
      // Fall through to text parsing
    }

    // Fallback: try to extract from text
    const lines = text.split('\n')
    const name = lines[0]?.replace(/^Song[:\s]*/i, '') || 'Untitled'
    const styleMatch = text.match(/Style[:\s]*([\s\S]*?)(?=\n\n|\nLyrics|$)/i)
    const lyricsMatch = text.match(/Lyrics[:\s]*([\s\S]*)$/i)

    return {
      name: name.trim(),
      lyrics: lyricsMatch ? lyricsMatch[1].trim() : text,
      style_description: styleMatch ? styleMatch[1].trim() : '',
    }
  }
}
