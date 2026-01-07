import { describe, it, expect } from 'vitest'

describe('Project Setup', () => {
  it('should have App component exported', async () => {
    const App = (await import('../App')).default
    expect(App).toBeDefined()
  })
})
