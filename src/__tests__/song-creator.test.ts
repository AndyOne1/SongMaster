import { describe, it, expect } from 'vitest'

describe('Song Creator', () => {
  it('should have SongCreator component', async () => {
    const { SongCreator } = await import('../components/song/SongCreator')
    expect(SongCreator).toBeDefined()
  })

  it('should have AgentTile component', async () => {
    const { AgentTile } = await import('../components/song/AgentTile')
    expect(AgentTile).toBeDefined()
  })

  it('should have AgentSelector component', async () => {
    const { AgentSelector } = await import('../components/song/AgentSelector')
    expect(AgentSelector).toBeDefined()
  })

  it('should have SongDescriptionInputs component', async () => {
    const { SongDescriptionInputs } = await import('../components/song/SongDescriptionInputs')
    expect(SongDescriptionInputs).toBeDefined()
  })
})
