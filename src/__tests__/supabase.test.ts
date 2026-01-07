import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Supabase Client', () => {
  it('should have supabase client module', async () => {
    const { supabase } = await import('../services/supabase/client')
    expect(supabase).toBeDefined()
  })
})
