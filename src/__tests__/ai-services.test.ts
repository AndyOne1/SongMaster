import { describe, it, expect } from 'vitest'

describe('AI Services', () => {
  it('should have AgentFactory', async () => {
    const { AgentFactory } = await import('../services/ai/AgentFactory')
    expect(AgentFactory).toBeDefined()
  })

  it('should have orchestrateAndEvaluate', async () => {
    const { orchestrateAndEvaluate } = await import('../services/ai/AgentOrchestrator')
    expect(orchestrateAndEvaluate).toBeDefined()
  })

  it('should have StreamingHandler', async () => {
    const { StreamingHandler } = await import('../services/ai/StreamingHandler')
    expect(StreamingHandler).toBeDefined()
  })
})
