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
    <div className="space-y-5">
      {/* Song Description */}
      <div>
        <label className="mb-3 block text-sm font-medium text-ivory-200">
          Describe your song
        </label>
        <textarea
          value={songDescription}
          onChange={(e) => onSongDescriptionChange(e.target.value)}
          placeholder="What story do you want to tell? What emotions should this song convey?"
          className="min-h-[140px] w-full rounded-xl border border-white/10 bg-luxury-900/60 p-4 text-ivory-100 placeholder:text-champagne-500/40 focus:border-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-500/10 transition-all resize-none"
        />
      </div>

      {/* Style Description */}
      <div>
        {artist && (
          <div className="mb-3 rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-transparent p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/20">
                <span className="text-xs text-violet-400">🎨</span>
              </div>
              <span className="text-xs font-medium text-violet-400 uppercase tracking-wider">Artist Style Context</span>
            </div>
            <p className="text-sm text-ivory-300 leading-relaxed">{artist.style_description}</p>
            {artist.special_characteristics && (
              <p className="mt-2 text-xs text-champagne-500 flex items-center gap-1">
                <span className="text-violet-400">✨</span>
                {artist.special_characteristics}
              </p>
            )}
          </div>
        )}
        <label className="mb-3 block text-sm font-medium text-ivory-200">
          {artist ? 'Adapt or override style' : 'Music style description'}
        </label>
        <textarea
          value={styleDescription}
          onChange={(e) => onStyleDescriptionChange(e.target.value)}
          placeholder={artist
            ? "How should the artist's style be adapted for this song? (Leave empty to use artist defaults)"
            : "Describe the desired music style: genre, tempo, mood, instrumentation..."
          }
          className="min-h-[100px] w-full rounded-xl border border-white/10 bg-luxury-900/60 p-4 text-ivory-100 placeholder:text-champagne-500/40 focus:border-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-500/10 transition-all resize-none"
        />
      </div>
    </div>
  )
}
