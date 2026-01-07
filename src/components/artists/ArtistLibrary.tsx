import { Artist } from '../../types'
import { ArtistCard } from './ArtistCard'
import { Plus } from 'lucide-react'
import { Button } from '../ui/Button'

interface ArtistLibraryProps {
  artists: Artist[]
  onSelectArtist: (artist: Artist) => void
  onCreateArtist: () => void
  onEditArtist: (artist: Artist) => void
  onDeleteArtist: (id: string) => void
}

export function ArtistLibrary({
  artists,
  onSelectArtist,
  onCreateArtist,
  onEditArtist,
  onDeleteArtist,
}: ArtistLibraryProps) {
  if (artists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 text-5xl">🎵</div>
        <h3 className="mb-2 text-xl font-semibold text-gray-200">No artists yet</h3>
        <p className="mb-6 text-gray-500">Create your first artist to get started</p>
        <Button onClick={onCreateArtist}>
          <Plus className="mr-2 h-4 w-4" />
          Create Artist
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-100">Your Artists</h2>
        <Button onClick={onCreateArtist}>
          <Plus className="mr-2 h-4 w-4" />
          Create Artist
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {artists.map((artist) => (
          <ArtistCard
            key={artist.id}
            artist={artist}
            onClick={() => onSelectArtist(artist)}
            onEdit={() => onEditArtist(artist)}
            onDelete={() => onDeleteArtist(artist.id)}
          />
        ))}
      </div>
    </div>
  )
}
