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
  // Evaluation data from orchestrator
  evaluation_data?: DetailedEvaluation
  winner_agent_id?: string
  winner_reason?: string
  winner_analysis?: WinnerAnalysis
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

// Detailed evaluation types for the new orchestrator prompt

export interface SunoCompliance {
  score: number
  issues: string[]
  will_it_work: 'Yes' | 'No'
}

export interface MatchedRequest {
  alignment: 'Excellent' | 'Good' | 'Partial' | 'Poor'
  explanation: string
}

export interface Recommendations {
  critical_fixes: string[]
  quick_wins: string[]
  depth_enhancements: string[]
  suno_optimization: string[]
}

export interface WinnerAnalysis {
  reason: string
  key_differentiators: string[]
  best_for: string
}

export interface ComparativeInsights {
  common_strengths: string
  common_weaknesses: string
  stylistic_range: string
  surprising_choice: string
}

export interface UserGuidance {
  if_choosing_winner: string
  if_wanting_alternatives: string
  iteration_suggestions: string
}

export interface DetailedEvaluation {
  suno_compliance?: SunoCompliance
  matched_request?: MatchedRequest
  scores?: {
    music_style: number
    lyrics: number
    originality: number
    cohesion: number
    request_alignment: number
    suno_execution_prediction: number
  }
  strengths?: string[]
  weaknesses?: string[]
  analysis?: string
  recommendations?: Recommendations
  predicted_suno_result?: string
  commercial_potential?: string
}

export interface DetailedOrchestratorResult {
  evaluations: Record<string, DetailedEvaluation>
  winner_agent_id: string
  winner_analysis?: WinnerAnalysis
  comparative_insights?: ComparativeInsights
  user_guidance?: UserGuidance
}

// Legacy evaluation format (backward compatible)
export interface Evaluation {
  matched_request?: string
  scores?: {
    music_style: number
    lyrics: number
    originality: number
    cohesion: number
  }
  analysis?: string
  evaluation?: string
  recommendations?: string
}

export interface IterationContext {
  evaluation: {
    strengths: string[]
    weaknesses: string[]
    recommendations: {
      critical_fixes: string[]
      quick_wins: string[]
      depth_enhancements: string[]
      suno_optimization: string[]
    }
    scores?: {
      music_style: number
      lyrics: number
      originality: number
      cohesion: number
    }
  }
  original_request: string
  original_style: string
  custom_instructions?: string
  iteration_number: number
}
