export interface Artist {
  id: string
  user_id: string
  name: string
  style_description: string
  special_characteristics: string
  created_at: Date
  // New simplified fields
  tagline?: string
  origin_story?: string
  musical_dna?: {
    signature_sound?: string
  }
  suno_guidelines?: {
    default_vocal_tags?: string[]
  }
}

export interface ArtistOption {
  artist_name: string
  tagline: string
  style_description: string
  special_characteristics: string[]
  origin_story?: string
  musical_dna?: {
    signature_sound: string
  }
  suno_guidelines?: {
    default_vocal_tags: string[]
  }
}

export interface ArtistCreatorResponse {
  options: ArtistOption[]
}
