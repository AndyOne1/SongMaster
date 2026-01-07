import { describe, it, expect } from 'vitest'

describe('App Router', () => {
  it('should have all pages', async () => {
    const { Home } = await import('../pages/Home')
    const { Library } = await import('../pages/Library')
    const { Settings } = await import('../pages/Settings')
    expect(Home).toBeDefined()
    expect(Library).toBeDefined()
    expect(Settings).toBeDefined()
  })
})
