import { Artist } from '../../types'
import { Card } from '../ui/Card'
import { Music, Edit2, Trash2 } from 'lucide-react'

interface ArtistCardProps {
  artist: Artist
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}

export function ArtistCard({ artist, onClick, onEdit, onDelete }: ArtistCardProps) {
  return (
    <Card className="group relative cursor-pointer transition-all hover:border-primary-500/50">
      <div onClick={onClick}>
        <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-gray-700">
          <Music className="h-12 w-12 text-gray-500" />
        </div>
        <h3 className="font-semibold text-gray-200">{artist.name}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
          {artist.style_description}
        </p>
      </div>
      <div className="absolute right-2 top-2 flex opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit() }}
          className="rounded p-1 hover:bg-gray-700"
        >
          <Edit2 className="h-4 w-4 text-gray-400" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="rounded p-1 hover:bg-gray-700"
        >
          <Trash2 className="h-4 w-4 text-red-400" />
        </button>
      </div>
    </Card>
  )
}
