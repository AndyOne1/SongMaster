export interface Song {
  id: string
  user_id: string
  artist_id?: string
  name: string
  lyrics: string
  style_description: string
  status: SongStatus
  iteration_count: number
  selected_generation_id?: string
  created_at: Date
  updated_at?: Date
}

export type SongStatus = 'draft' | 'iterating' | 'saved' | 'completed'

export interface Generation {
  id: string
  song_id: string
  agent_id: string
  round: number
  output: AgentOutput
  music_style_score?: number
  lyrics_score?: number
  originality_score?: number
  cohesion_score?: number
  total_score?: number
  evaluation_status: 'pending' | 'evaluated'
  orchestrator_feedback?: string
  created_at: Date
}

export interface AgentOutput {
  name: string
  lyrics: string
  style_description: string
}
