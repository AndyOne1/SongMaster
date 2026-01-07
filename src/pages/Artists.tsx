import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase/client'
import { Artist } from '../types'
import { ArtistLibrary } from '../components/artists/ArtistLibrary'

export function Artists() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [showWizard, setShowWizard] = useState(false)
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null)

  useEffect(() => {
    loadArtists()
  }, [])

  const loadArtists = async () => {
    // For demo, use empty array since we don't have auth
    setArtists([])
    setLoading(false)

    // In production with auth:
    // const { data, error } = await supabase
    //   .from('artists')
    //   .select('*')
    //   .order('created_at', { ascending: false })
    // if (data) setArtists(data as Artist[])
  }

  const handleCreateArtist = () => {
    setEditingArtist(null)
    setShowWizard(true)
  }

  const handleEditArtist = (artist: Artist) => {
    setEditingArtist(artist)
    setShowWizard(true)
  }

  const handleDeleteArtist = async (id: string) => {
    if (confirm('Are you sure you want to delete this artist?')) {
      await supabase.from('artists').delete().eq('id', id)
      loadArtists()
    }
  }

  const handleSaveArtist = () => {
    setShowWizard(false)
    setEditingArtist(null)
    loadArtists()
  }

  const handleSelectArtist = (artist: Artist) => {
    // Navigate to song creation with artist
    window.location.href = `/songs/new?artist_id=${artist.id}`
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-100">Artists</h1>
      <ArtistLibrary
        artists={artists}
        onSelectArtist={handleSelectArtist}
        onCreateArtist={handleCreateArtist}
        onEditArtist={handleEditArtist}
        onDeleteArtist={handleDeleteArtist}
      />
      {/* Wizard will be added in Task 10 */}
    </div>
  )
}
