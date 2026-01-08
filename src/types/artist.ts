export interface Artist {
  id: string
  user_id: string
  name: string
  style_description: string
  special_characteristics: string
  created_at: Date
  // New fields
  artist_type?: string
  tagline?: string
  origin_story?: string
  career_stage?: string
  musical_dna?: string
  instrumentation?: string
  vocal_identity?: string
  lyrical_identity?: string
  references_data?: string
  suno_guidelines?: string
  brand_identity?: string
  agent_brief?: string
  short_style_summary?: string
}
