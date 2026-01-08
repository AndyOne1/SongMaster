import { describe, it, expect } from 'vitest'

describe('Song Creator', () => {
  it('should have SongCreator component', async () => {
    const { SongCreator } = await import('../components/song/SongCreator')
    expect(SongCreator).toBeDefined()
  })

  it('should have SongResultTile component', async () => {
    const { SongResultTile } = await import('../components/song/SongResultTile')
    expect(SongResultTile).toBeDefined()
  })

  it('should have SongDescriptionInputs component', async () => {
    const { SongDescriptionInputs } = await import('../components/song/SongDescriptionInputs')
    expect(SongDescriptionInputs).toBeDefined()
  })
})
