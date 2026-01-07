import { Agent } from '../../types'

export class StreamingHandler {
  private onChunk: (chunk: string) => void

  constructor(onChunk: (chunk: string) => void) {
    this.onChunk = onChunk
  }

  async stream(agent: Agent, prompt: string): Promise<string> {
    // For APIs that support streaming
    const response = await fetch(agent.api_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add provider-specific headers
      },
      body: JSON.stringify({
        model: agent.model_name,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      }),
    })

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) return ''

    let result = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      result += chunk
      this.onChunk(chunk)
    }

    return result
  }

  static async streamToBuffer(agent: Agent, prompt: string): Promise<string> {
    const handler = new StreamingHandler(() => {})
    return handler.stream(agent, prompt)
  }
}
