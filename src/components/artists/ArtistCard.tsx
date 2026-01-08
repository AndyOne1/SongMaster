import { Artist } from '../../types'
import { Card } from '../ui/Card'
import { Music, Edit2, Trash2 } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ArtistCardProps {
  artist: Artist
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}

const careerStageStyles: Record<string, { bg: string; text: string }> = {
  Emerging: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  Breakthrough: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  Established: { bg: 'bg-violet-500/10', text: 'text-violet-400' },
  Legendary: { bg: 'bg-rose-500/10', text: 'text-rose-400' },
}

export function ArtistCard({ artist, onClick, onEdit, onDelete }: ArtistCardProps) {
  const careerStageStyle = careerStageStyles[artist.career_stage || ''] || {
    bg: 'bg-champagne-500/10',
    text: 'text-champagne-500',
  }

  return (
    <Card
      variant="default"
      className="group relative cursor-pointer transition-all hover:border-amber-500/30"
    >
      <div onClick={onClick}>
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-violet-500/20 border border-amber-500/20">
          <Music className="h-10 w-10 text-amber-400" />
        </div>

        <h3 className="font-display text-lg font-semibold text-ivory-100">
          {artist.name}
        </h3>

        {artist.artist_type && (
          <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
            {artist.artist_type}
          </span>
        )}

        {artist.tagline && (
          <p className="mt-2 text-sm text-champagne-500 italic line-clamp-1">
            {artist.tagline}
          </p>
        )}

        <p className="mt-2 text-sm text-ivory-300/80 line-clamp-2">
          {artist.short_style_summary || artist.style_description}
        </p>

        {artist.career_stage && (
          <span
            className={cn(
              'mt-3 inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider',
              careerStageStyle.bg,
              careerStageStyle.text
            )}
          >
            {artist.career_stage}
          </span>
        )}
      </div>

      <div className="absolute right-3 top-3 flex opacity-0 transition-all duration-200 group-hover:opacity-100">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit() }}
          className="rounded-lg p-2 hover:bg-luxury-800/80 transition-colors"
        >
          <Edit2 className="h-4 w-4 text-champagne-400 hover:text-amber-400" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="rounded-lg p-2 hover:bg-luxury-800/80 transition-colors"
        >
          <Trash2 className="h-4 w-4 text-champagne-400 hover:text-red-400" />
        </button>
      </div>
    </Card>
  )
}
