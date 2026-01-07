import { describe, it, expect } from 'vitest'

describe('Dependencies', () => {
  it('should have react-router-dom installed', async () => {
    const { BrowserRouter } = await import('react-router-dom')
    expect(BrowserRouter).toBeDefined()
  })

  it('should have @supabase/supabase-js installed', async () => {
    const { createClient } = await import('@supabase/supabase-js')
    expect(createClient).toBeDefined()
  })

  it('should have tailwindcss installed', async () => {
    const { twMerge } = await import('tailwind-merge')
    expect(twMerge).toBeDefined()
  })
})
