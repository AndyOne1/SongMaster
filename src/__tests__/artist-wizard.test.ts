import { describe, it, expect } from 'vitest'

describe('Artist Wizard', () => {
  it('should have ArtistWizard component', async () => {
    const { ArtistWizard } = await import('../components/artists/ArtistWizard')
    expect(ArtistWizard).toBeDefined()
  })
})
