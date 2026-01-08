import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Artist } from '../types'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { supabase } from '../services/supabase/client'
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Music2,
  Sparkles,
  User,
  Target
} from 'lucide-react'

interface ArtistDetailsProps {
  onEdit: (artist: Artist) => void
  onDelete: (id: string) => void
}

export function ArtistDetails({ onEdit, onDelete }: ArtistDetailsProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [artist, setArtist] = useState<Artist | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchArtist = async () => {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        console.error('Error fetching artist:', error)
        setArtist(null)
      } else {
        // Cast with proper typing for Supabase JSONB fields
        setArtist({
          id: data.id as string,
          user_id: data.user_id as string,
          name: data.name as string,
          style_description: data.style_description as string,
          special_characteristics: data.special_characteristics as string,
          created_at: new Date(data.created_at),
          tagline: data.tagline as string | undefined,
          origin_story: data.origin_story as string | undefined,
          musical_dna: data.musical_dna as Artist['musical_dna'],
          suno_guidelines: data.suno_guidelines as Artist['suno_guidelines'],
        })
      }
      setLoading(false)
    }

    fetchArtist()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-champagne-500">
          <div className="h-5 w-5 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
          <span>Loading artist...</span>
        </div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-center">
          <h2 className="font-display text-2xl font-semibold text-ivory-100 mb-2">
            Artist not found
          </h2>
          <p className="text-champagne-500 mb-6">
            This artist may have been deleted or doesn't exist.
          </p>
          <Button variant="secondary" onClick={() => navigate('/artists')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Artists
          </Button>
        </div>
      </div>
    )
  }

  // Parse JSON fields that might be stored as strings
  const parseJsonField = (field: unknown): Record<string, unknown> | null => {
    if (!field) return null
    if (typeof field === 'object') return field as Record<string, unknown>
    try {
      return JSON.parse(field as string)
    } catch {
      return null
    }
  }

  const musicalDna = parseJsonField(artist.musical_dna)
  const sunoGuidelines = parseJsonField(artist.suno_guidelines)

  // Convert special_characteristics to array if it's a string
  const specialChars = typeof artist.special_characteristics === 'string'
    ? artist.special_characteristics.split(',').map(s => s.trim()).filter(Boolean)
    : Array.isArray(artist.special_characteristics)
      ? artist.special_characteristics
      : []

  // Extract style description for conditional rendering
  const artistStyleDesc = typeof artist?.style_description === 'string' ? artist.style_description : ''
  const styleDescriptionSection = (artistStyleDesc ? (
    <Card className="mb-6">
      <h2 className="font-display text-xl font-semibold text-ivory-100 mb-4 flex items-center gap-2">
        <Target className="h-5 w-5 text-champagne-500" />
        Style Description
      </h2>
      <p className="text-ivory-300 whitespace-pre-wrap">{artistStyleDesc}</p>
    </Card>
  ) : null) as React.ReactNode

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/artists')}
          className="flex items-center gap-2 text-champagne-500 hover:text-ivory-100 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Artists
        </button>

        <div className="mb-4">
          <h1 className="font-display text-4xl font-semibold text-ivory-100 mb-4">
            {artist.name}
          </h1>

          {artist.tagline && (
            <p className="text-xl text-champagne-500 italic">{artist.tagline}</p>
          )}
        </div>

        {artist.origin_story && (
          <p className="text-ivory-300 max-w-3xl">{artist.origin_story}</p>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <Button variant="gold" onClick={() => navigate(`/songs/new?artist_id=${artist.id}`)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Create Song with This Artist
          </Button>
          <Button variant="secondary" onClick={() => onEdit(artist)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="ghost" onClick={() => onDelete(artist.id)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Style Description */}
      {styleDescriptionSection}

      {/* Special Characteristics */}
      {specialChars.length > 0 && (
        <Card className="mb-6">
          <h2 className="font-display text-xl font-semibold text-ivory-100 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-champagne-500" />
            Special Characteristics
          </h2>
          <div className="flex flex-wrap gap-2">
            {specialChars.map((char, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-sm bg-amber-500/10 text-amber-400 border border-amber-500/20"
              >
                {char}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Musical DNA */}
      {musicalDna && musicalDna.signature_sound && (
        <Card className="mb-6">
          <h2 className="font-display text-xl font-semibold text-ivory-100 mb-4 flex items-center gap-2">
            <Music2 className="h-5 w-5 text-champagne-500" />
            Musical DNA
          </h2>
          <p className="text-ivory-300">{musicalDna.signature_sound as string}</p>
        </Card>
      )}

      {/* Suno Guidelines */}
      {sunoGuidelines?.default_vocal_tags ? (
        <Card className="mb-6">
          <h2 className="font-display text-xl font-semibold text-ivory-100 mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-champagne-500" />
            Suno Guidelines
          </h2>
          <div className="flex flex-wrap gap-2">
            {(sunoGuidelines.default_vocal_tags as string[]).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-sm bg-violet-500/10 text-violet-400 border border-violet-500/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  )
}
