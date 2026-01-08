import { useState, useEffect } from 'react'
import { Song } from '../types'
import { Card } from '../components/ui/Card'
import { SongDetailModal } from '../components/song/SongDetailModal'
import { LibrarySongCard } from '../components/song/LibrarySongCard'
import { Music } from 'lucide-react'
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
    // The actual save logic is in SongCreator when saving from generation
  }

  const handleOverride = () => {
    // Not applicable for library view
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-100">Your Library</h1>

      {songs.length === 0 ? (
        <Card className="p-12 text-center">
          <Music className="mx-auto mb-4 h-16 w-16 text-gray-600" />
          <h2 className="mb-2 text-xl font-semibold text-gray-200">No songs yet</h2>
          <p className="text-gray-500">Create your first song to get started</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {songs.map((song) => (
            <LibrarySongCard
              key={song.id}
              song={song}
              onClick={() => handleSongClick(song)}
            />
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
