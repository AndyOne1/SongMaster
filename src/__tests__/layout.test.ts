import { describe, it, expect } from 'vitest'

describe('Layout Components', () => {
  it('should have Layout component', async () => {
    const { Layout } = await import('../components/layout/Layout')
    expect(Layout).toBeDefined()
  })

  it('should have Sidebar component', async () => {
    const { Sidebar } = await import('../components/layout/Sidebar')
    expect(Sidebar).toBeDefined()
  })

  it('should have Header component', async () => {
    const { Header } = await import('../components/layout/Header')
    expect(Header).toBeDefined()
  })
})
