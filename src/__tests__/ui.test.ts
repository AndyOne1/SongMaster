import { describe, it, expect } from 'vitest'

describe('UI Components', () => {
  it('should have Button component', async () => {
    const { Button } = await import('../components/ui/Button')
    expect(Button).toBeDefined()
  })

  it('should have Input component', async () => {
    const { Input } = await import('../components/ui/Input')
    expect(Input).toBeDefined()
  })

  it('should have Card component', async () => {
    const { Card } = await import('../components/ui/Card')
    expect(Card).toBeDefined()
  })

  it('should have Modal component', async () => {
    const { Modal } = await import('../components/ui/Modal')
    expect(Modal).toBeDefined()
  })

  it('should have Toggle component', async () => {
    const { Toggle } = await import('../components/ui/Toggle')
    expect(Toggle).toBeDefined()
  })
})
