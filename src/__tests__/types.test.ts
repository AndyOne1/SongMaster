import { describe, it, expect } from 'vitest'
import type { Agent, Artist, Song, Generation } from '../types'

describe('Type Definitions', () => {
  it('should define Agent type', () => {
    const agent: Agent = {
      id: '123',
      name: 'Claude',
      provider: 'Anthropic',
      api_endpoint: 'https://api.anthropic.com',
      model_name: 'claude-sonnet-4',
      capabilities: { context_window: 200000 },
      cost_per_1k_tokens: 0.01,
      is_active: true,
    }
    expect(agent.name).toBe('Claude')
  })

  it('should define Artist type', () => {
    const artist: Artist = {
      id: '123',
      user_id: 'user-1',
      name: 'The Beatles',
      style_description: 'Rock band from Liverpool',
      special_characteristics: 'Innovative harmonies',
      created_at: new Date(),
    }
    expect(artist.name).toBe('The Beatles')
  })

  it('should define Song type', () => {
    const song: Song = {
      id: '123',
      user_id: 'user-1',
      name: 'Hey Jude',
      lyrics: 'Hey Jude, don\'t make it bad...',
      style_description: 'Rock ballad',
      status: 'draft',
      iteration_count: 0,
    }
    expect(song.name).toBe('Hey Jude')
  })

  it('should define Generation type', () => {
    const generation: Generation = {
      id: '123',
      song_id: 'song-1',
      agent_id: 'agent-1',
      round: 1,
      output: { name: 'Song', lyrics: '...', style_description: 'rock' },
      music_style_score: 8,
      lyrics_score: 7,
      originality_score: 6,
      cohesion_score: 8,
      total_score: 7.25,
      evaluation_status: 'evaluated',
      orchestrator_feedback: 'Great song!',
    }
    expect(generation.total_score).toBe(7.25)
  })
})
