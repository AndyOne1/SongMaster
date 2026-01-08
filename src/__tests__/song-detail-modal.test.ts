import { describe, it, expect } from 'vitest'

describe('SongDetailModal', () => {
  it('should have SongDetailModal component', async () => {
    const { SongDetailModal } = await import('../components/song/SongDetailModal')
    expect(SongDetailModal).toBeDefined()
  })
})
