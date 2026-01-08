import { useNavigate } from 'react-router-dom'
import { Artist } from '../../types'
import { ArtistCard } from './ArtistCard'
import { Plus, Music } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface ArtistLibraryProps {
  artists: Artist[]
  onCreateArtist: () => void
  onEditArtist: (artist: Artist) => void
  onDeleteArtist: (id: string) => void
}

export function ArtistLibrary({
  artists,
  onCreateArtist,
  onEditArtist,
  onDeleteArtist,
}: ArtistLibraryProps) {
  const navigate = useNavigate()

  if (artists.length === 0) {
    return (
      <Card variant="default" className="flex flex-col items-center justify-center py-16 px-8">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/10 to-violet-500/10 border border-amber-500/20">
          <Music className="h-10 w-10 text-champagne-500" />
        </div>
        <h3 className="font-display text-xl font-semibold text-ivory-100 mb-2">
          No artists yet
        </h3>
        <p className="text-champagne-500 text-sm mb-8 text-center max-w-sm">
          Create your first artist to start building your song collection
        </p>
        <Button onClick={onCreateArtist} variant="gold">
          <Plus className="mr-2 h-4 w-4" />
          Create Artist
        </Button>
      </Card>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-2xl font-semibold text-ivory-100">
          Your Artists
        </h2>
        <p className="text-champagne-500 text-sm mt-1">
          {artists.length} {artists.length === 1 ? 'artist' : 'artists'} in your collection
        </p>
      </div>

      <div className="mb-6">
        <Button onClick={onCreateArtist} variant="gold">
          <Plus className="mr-2 h-4 w-4" />
          Create Artist
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {artists.map((artist) => (
          <ArtistCard
            key={artist.id}
            artist={artist}
            onClick={() => navigate(`/artists/${artist.id}`)}
            onEdit={() => onEditArtist(artist)}
            onDelete={() => onDeleteArtist(artist.id)}
          />
        ))}
      </div>
    </div>
  )
}
