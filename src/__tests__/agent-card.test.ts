import { describe, it, expect } from 'vitest'

describe('AgentCard', () => {
  it('should have AgentCard component', async () => {
    const { AgentCard } = await import('../components/song/AgentCard')
    expect(AgentCard).toBeDefined()
  })
})
