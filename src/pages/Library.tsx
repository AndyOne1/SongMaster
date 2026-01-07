import { useState, useEffect } from 'react'
import { Song } from '../types'
import { Card } from '../components/ui/Card'
import { Music, Clock, Edit2 } from 'lucide-react'

export function Library() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSongs()
  }, [])

  const loadSongs = async () => {
    // Demo empty state
    setSongs([])
    setLoading(false)

    // In production:
    // const { data } = await supabase
    //   .from('songs')
    //   .select('*')
    //   .order('created_at', { ascending: false })
    // if (data) setSongs(data as Song[])
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
        <div className="space-y-3">
          {songs.map((song) => (
            <Card key={song.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-700">
                  <Music className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-200">{song.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(song.created_at).toLocaleDateString()}
                    </span>
                    <span className="capitalize">{song.status}</span>
                  </div>
                </div>
              </div>
              <button className="rounded p-2 hover:bg-gray-700">
                <Edit2 className="h-4 w-4 text-gray-400" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
