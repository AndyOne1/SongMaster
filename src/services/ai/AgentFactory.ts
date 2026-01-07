import { Agent, AgentOutput } from '../../types'

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

const DEFAULT_PROMPT = `You are a professional songwriter. Create an original song specification.

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

export class AgentFactory {
  static createPrompt(params: GenerationParams): string {
    let prompt = DEFAULT_PROMPT
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
    const prompt = this.createPrompt(params)

    // Call the appropriate API based on provider
    switch (params.agent.provider) {
      case 'Anthropic':
        return this.callAnthropic(params.agent, prompt)
      case 'OpenAI':
        return this.callOpenAI(params.agent, prompt)
      case 'xAI':
        return this.callXAI(params.agent, prompt)
      default:
        throw new Error(`Unsupported provider: ${params.agent.provider}`)
    }
  }

  private static async callAnthropic(agent: Agent, prompt: string): Promise<AgentOutput> {
    const response = await fetch(agent.api_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: agent.model_name,
        max_tokens: agent.capabilities.max_output || 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    return this.parseOutput(data.content?.[0]?.text || '')
  }

  private static async callOpenAI(agent: Agent, prompt: string): Promise<AgentOutput> {
    const response = await fetch(agent.api_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || ''}`,
      },
      body: JSON.stringify({
        model: agent.model_name,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: agent.capabilities.max_output || 4000,
      }),
    })

    const data = await response.json()
    return this.parseOutput(data.choices?.[0]?.message?.content || '')
  }

  private static async callXAI(agent: Agent, prompt: string): Promise<AgentOutput> {
    const response = await fetch(agent.api_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_XAI_API_KEY || ''}`,
      },
      body: JSON.stringify({
        model: agent.model_name,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: agent.capabilities.max_output || 4000,
      }),
    })

    const data = await response.json()
    return this.parseOutput(data.choices?.[0]?.message?.content || '')
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
