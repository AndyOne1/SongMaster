import { useState, useEffect } from 'react'
import { Song } from '../types'
import { Card } from '../components/ui/Card'
import { SongDetailModal } from '../components/song/SongDetailModal'
import { LibrarySongCard } from '../components/song/LibrarySongCard'
import { Music2 } from 'lucide-react'
import { supabase } from '../services/supabase/client'
import { useAuth } from '../context/AuthContext'

export function Library() {
  const { user } = useAuth()
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)

  useEffect(() => {
    if (user) {
      loadSongs()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadSongs = async () => {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading songs:', error)
    } else if (data) {
      setSongs(data as Song[])
    }
    setLoading(false)
  }

  const handleSongClick = (song: Song) => {
    setSelectedSong(song)
  }

  const handleSaveSong = async () => {
    // Song is already saved - just refresh or show confirmation
  }

  const handleOverride = () => {
    // Not applicable for library view
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-champagne-500">
          <div className="h-5 w-5 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
          <span>Loading your library...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/20">
            <Music2 className="h-5 w-5 text-white" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-ivory-100">
            Your Library
          </h1>
        </div>
        <p className="text-champagne-500">
          {songs.length} {songs.length === 1 ? 'song' : 'songs'} in your collection
        </p>
      </div>

      {/* Songs Grid */}
      {songs.length === 0 ? (
        <Card className="p-16 text-center relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/3 via-transparent to-violet-500/3" />
          <div className="absolute2 left-1/2 -translate-x-1/ top-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-luxury-800 border border-white/10">
              <Music2 className="h-10 w-10 text-champagne-500" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-ivory-100 mb-3">
              Your library is empty
            </h2>
            <p className="text-champagne-500 mb-8 max-w-md mx-auto">
              Create your first song to see it appear here. Your creative journey starts with a single note.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {songs.map((song) => (
            <div key={song.id} className="animate-fade-in-up" style={{ animationDelay: `${songs.indexOf(song) * 0.05}s` }}>
              <LibrarySongCard
                song={song}
                onClick={() => handleSongClick(song)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Song Detail Modal */}
      {selectedSong && (
        <SongDetailModal
          isOpen={true}
          onClose={() => setSelectedSong(null)}
          agentName="Saved Song"
          songName={selectedSong.name}
          style={selectedSong.style_description}
          lyrics={selectedSong.lyrics}
          evaluation={selectedSong.evaluation_data}
          winnerAnalysis={selectedSong.winner_analysis}
          onSave={handleSaveSong}
          onOverride={handleOverride}
          isWinner={true}
        />
      )}
    </div>
  )
}
