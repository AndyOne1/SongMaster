import { Artist } from '../../types'

interface SongDescriptionInputsProps {
  artist?: Artist | null
  songDescription: string
  styleDescription: string
  onSongDescriptionChange: (value: string) => void
  onStyleDescriptionChange: (value: string) => void
}

export function SongDescriptionInputs({
  artist,
  songDescription,
  styleDescription,
  onSongDescriptionChange,
  onStyleDescriptionChange,
}: SongDescriptionInputsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Describe the song you want</label>
        <textarea
          value={songDescription}
          onChange={(e) => onSongDescriptionChange(e.target.value)}
          placeholder="What should this song be about? What emotions should it convey?"
          className="min-h-[100px] w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-gray-100 placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        {artist && (
          <div className="mb-2 rounded-lg border border-gray-700 bg-gray-800/50 p-3">
            <div className="mb-1 text-xs font-medium text-gray-500 uppercase">Artist Style Context</div>
            <p className="text-sm text-gray-300">{artist.style_description}</p>
            {artist.special_characteristics && (
              <p className="mt-1 text-xs text-gray-500">✨ {artist.special_characteristics}</p>
            )}
          </div>
        )}
        <label className="mb-2 block text-sm font-medium text-gray-300">
          {artist ? 'Add or modify style description' : 'Music Style Description'}
        </label>
        <textarea
          value={styleDescription}
          onChange={(e) => onStyleDescriptionChange(e.target.value)}
          placeholder={artist ? 'How should the artist style be adapted for this song?' : 'Describe the desired music style...'}
          className="min-h-[80px] w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-gray-100 placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>
    </div>
  )
}
