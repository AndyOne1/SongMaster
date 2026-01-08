import { describe, it, expect } from 'vitest'

describe('AgentSelectionModal', () => {
  it('should have AgentSelectionModal component', async () => {
    const { AgentSelectionModal } = await import('../components/song/AgentSelectionModal')
    expect(AgentSelectionModal).toBeDefined()
  })
})
