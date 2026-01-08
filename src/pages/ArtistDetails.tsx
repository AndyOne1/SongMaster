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
  Mic2,
  Palette,
  User,
  Headphones,
  BookOpen,
  Target,
  Briefcase,
  Layers
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
        setArtist(data as Artist)
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

  const parseJsonField = (field: string | undefined): Record<string, unknown> | null => {
    if (!field) return null
    try {
      return JSON.parse(field)
    } catch {
      return null
    }
  }

  const musicalDna = parseJsonField(artist.musical_dna)
  const instrumentation = parseJsonField(artist.instrumentation)
  const vocalIdentity = parseJsonField(artist.vocal_identity)
  const lyricalIdentity = parseJsonField(artist.lyrical_identity)
  const referencesData = parseJsonField(artist.references_data)
  const sunoGuidelines = parseJsonField(artist.suno_guidelines)
  const brandIdentity = parseJsonField(artist.brand_identity)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/artists')}
          className="flex items-center gap-2 text-champagne-500 hover:text-ivory-100 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Artists
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="font-display text-4xl font-semibold text-ivory-100 mb-4">
              {artist.name}
            </h1>

            <div className="flex flex-wrap gap-2 mb-4">
              {artist.artist_type && (
                <span className="px-3 py-1 rounded-full text-sm bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  {artist.artist_type}
                </span>
              )}
              {artist.career_stage && (
                <span className="px-3 py-1 rounded-full text-sm bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {artist.career_stage}
                </span>
              )}
            </div>

            {artist.tagline && (
              <p className="text-xl text-champagne-500 italic">{artist.tagline}</p>
            )}
          </div>
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

      {/* Musical DNA */}
      <Section title="Musical DNA" icon={<Music2 className="h-5 w-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Core Genre" value={musicalDna?.core_genre as string | undefined} />
          <Field label="Signature Sound" value={musicalDna?.signature_sound as string | undefined} />
          <Field label="Tempo Range" value={musicalDna?.tempo_range as string | undefined} />
          <Field label="Key Preferences" value={musicalDna?.key_preferences as string | undefined} />
          <Field label="Production Style" value={musicalDna?.production_style as string | undefined} className="md:col-span-2" />
        </div>
      </Section>

      {/* Instrumentation */}
      <Section title="Instrumentation" icon={<Layers className="h-5 w-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ArrayField label="Primary Instruments" value={instrumentation?.primary_instruments as string[] | undefined} />
          <ArrayField label="Signature Instruments" value={instrumentation?.signature_instruments as string[] | undefined} />
          <ArrayField label="Arrangement Style" value={instrumentation?.arrangement_style as string[] | undefined} />
          <ArrayField label="Sonic Textures" value={instrumentation?.sonic_textures as string[] | undefined} />
        </div>
      </Section>

      {/* Vocal Identity */}
      <Section title="Vocal Identity" icon={<Mic2 className="h-5 w-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Vocal Type" value={vocalIdentity?.vocal_type as string | undefined} />
          <Field label="Characteristics" value={vocalIdentity?.characteristics as string | undefined} />
          <Field label="Delivery Style" value={vocalIdentity?.delivery_style as string | undefined} />
          <Field label="Production" value={vocalIdentity?.production as string | undefined} />
          <ArrayField label="Signature Techniques" value={vocalIdentity?.signature_techniques as string[] | undefined} className="md:col-span-2" />
        </div>
      </Section>

      {/* Lyrical Identity */}
      <Section title="Lyrical Identity" icon={<BookOpen className="h-5 w-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Writing Approach" value={lyricalIdentity?.writing_approach as string | undefined} />
          <Field label="Vocabulary" value={lyricalIdentity?.vocabulary as string | undefined} />
          <Field label="Rhyme Complexity" value={lyricalIdentity?.rhyme_complexity as string | undefined} />
          <Field label="Perspective" value={lyricalIdentity?.perspective as string | undefined} />
          <ArrayField label="Core Themes" value={lyricalIdentity?.core_themes as string[] | undefined} />
          <ArrayField label="Emotional Palette" value={lyricalIdentity?.emotional_palette as string[] | undefined} />
          <Field label="Message" value={lyricalIdentity?.message as string | undefined} className="md:col-span-2" />
        </div>
      </Section>

      {/* References */}
      <Section title="References" icon={<Headphones className="h-5 w-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ArrayField label="Sounds Like" value={referencesData?.sounds_like as string[] | undefined} />
          <ArrayField label="Influences" value={referencesData?.influences as string[] | undefined} />
          <ArrayField label="Era/Movement" value={referencesData?.era_movement as string[] | undefined} />
        </div>
      </Section>

      {/* Suno Guidelines */}
      <Section title="Suno Guidelines" icon={<Sparkles className="h-5 w-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Default BPM" value={sunoGuidelines?.default_bpm as string | undefined} />
          <Field label="Preferred Keys" value={sunoGuidelines?.preferred_keys as string | undefined} />
          <Field label="Standard Instrumentation" value={sunoGuidelines?.standard_instrumentation as string | undefined} />
          <Field label="Production Approach" value={sunoGuidelines?.production_approach as string | undefined} />
          <Field label="Mix Balance" value={sunoGuidelines?.mix_balance as string | undefined} />
          <Field label="Song Structure" value={sunoGuidelines?.song_structure as string | undefined} />
          <Field label="Bridge Usage" value={sunoGuidelines?.bridge_usage as string | undefined} />
          <Field label="Typical Length" value={sunoGuidelines?.typical_length as string | undefined} />
          <Field label="Energy Variation" value={sunoGuidelines?.energy_variation as string | undefined} />
          <ArrayField label="Default Vocal Tags" value={sunoGuidelines?.default_vocal_tags as string[] | undefined} />
          <ArrayField label="Avoid Tags" value={sunoGuidelines?.avoid_tags as string[] | undefined} className="lg:col-span-2" />
        </div>
      </Section>

      {/* Brand Identity */}
      <Section title="Brand Identity" icon={<Palette className="h-5 w-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Visual Aesthetic" value={brandIdentity?.visual_aesthetic as string | undefined} />
          <Field label="Image" value={brandIdentity?.image as string | undefined} />
          <Field label="Album Artwork Style" value={brandIdentity?.album_artwork_style as string | undefined} />
          <Field label="Target Audience" value={brandIdentity?.target_audience as string | undefined} />
          <ArrayField label="Playlist Placement" value={brandIdentity?.playlist_placement as string[] | undefined} className="md:col-span-2" />
        </div>
      </Section>

      {/* Agent Brief */}
      {artist.agent_brief && (
        <Section title="Agent Brief" icon={<Briefcase className="h-5 w-5" />}>
          <div className="bg-luxury-800/50 rounded-xl p-4 border border-white/5">
            <p className="text-ivory-300 whitespace-pre-wrap">{artist.agent_brief}</p>
          </div>
        </Section>
      )}

      {/* Original Style Description */}
      {artist.style_description && (
        <Section title="Style Description" icon={<Target className="h-5 w-5" />}>
          <div className="bg-luxury-800/50 rounded-xl p-4 border border-white/5">
            <p className="text-ivory-300 whitespace-pre-wrap">{artist.style_description}</p>
          </div>
        </Section>
      )}

      {/* Special Characteristics */}
      {artist.special_characteristics && (
        <Section title="Special Characteristics" icon={<User className="h-5 w-5" />}>
          <div className="bg-luxury-800/50 rounded-xl p-4 border border-white/5">
            <p className="text-ivory-300 whitespace-pre-wrap">{artist.special_characteristics}</p>
          </div>
        </Section>
      )}
    </div>
  )
}

interface SectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}

function Section({ title, icon, children }: SectionProps) {
  return (
    <Card className="mb-6">
      <h2 className="font-display text-xl font-semibold text-ivory-100 mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
    </Card>
  )
}

interface FieldProps {
  label: string
  value?: string
  className?: string
}

function Field({ label, value, className = '' }: FieldProps) {
  if (!value) return null

  return (
    <div className={className}>
      <label className="block text-sm text-champagne-500 mb-1">{label}</label>
      <p className="text-ivory-100">{value}</p>
    </div>
  )
}

interface ArrayFieldProps {
  label: string
  value?: string[]
  className?: string
}

function ArrayField({ label, value, className = '' }: ArrayFieldProps) {
  if (!value || value.length === 0) return null

  return (
    <div className={className}>
      <label className="block text-sm text-champagne-500 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {value.map((item, index) => (
          <span
            key={index}
            className="px-3 py-1 rounded-full text-sm bg-amber-500/10 text-amber-400 border border-amber-500/20"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
