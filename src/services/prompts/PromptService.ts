import { supabase } from '../supabase/client'

export interface SystemPrompt {
  id: string
  key: string
  name: string
  content: string
  description: string | null
  is_active: boolean
  updated_at: string
}

class PromptService {
  private cache: Record<string, SystemPrompt> = {}
  private cacheExpiry: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  async getPrompt(key: string): Promise<string | null> {
    // Check cache first
    if (this.cache[key] && Date.now() < this.cacheExpiry) {
      return this.cache[key].content
    }

    // Fetch from database
    const { data, error } = await supabase
      .from('system_prompts')
      .select('content')
      .eq('key', key)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return null
    }

    // Update cache
    const fullData = data as SystemPrompt
    this.cache[key] = fullData
    this.cacheExpiry = Date.now() + this.CACHE_DURATION

    return fullData.content
  }

  async getAllPrompts(): Promise<SystemPrompt[]> {
    const { data, error } = await supabase
      .from('system_prompts')
      .select('*')
      .order('key')

    if (error || !data) {
      return []
    }

    return data as SystemPrompt[]
  }

  async updatePrompt(key: string, content: string): Promise<boolean> {
    const { error } = await supabase
      .from('system_prompts')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('key', key)

    if (error) {
      console.error('Failed to update prompt:', error)
      return false
    }

    // Invalidate cache
    delete this.cache[key]
    return true
  }

  clearCache(): void {
    this.cache = {}
    this.cacheExpiry = 0
  }
}

export const promptService = new PromptService()
