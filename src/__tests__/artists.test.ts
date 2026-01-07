import { describe, it, expect } from 'vitest'

describe('Artists Page', () => {
  it('should have Artists page', async () => {
    const { Artists } = await import('../pages/Artists')
    expect(Artists).toBeDefined()
  })

  it('should have ArtistCard component', async () => {
    const { ArtistCard } = await import('../components/artists/ArtistCard')
    expect(ArtistCard).toBeDefined()
  })

  it('should have ArtistLibrary component', async () => {
    const { ArtistLibrary } = await import('../components/artists/ArtistLibrary')
    expect(ArtistLibrary).toBeDefined()
  })
})
