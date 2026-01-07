import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase/client'
import { Artist } from '../types'
import { ArtistLibrary } from '../components/artists/ArtistLibrary'
import { ArtistWizard } from '../components/artists/ArtistWizard'
import { useAuth } from '../context/AuthContext'

export function Artists() {
  const { user } = useAuth()
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [showWizard, setShowWizard] = useState(false)
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null)

  useEffect(() => {
    if (user) {
      loadArtists()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadArtists = async () => {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading artists:', error)
    } else if (data) {
      setArtists(data as Artist[])
    }
    setLoading(false)
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
      {showWizard && (
        <ArtistWizard
          artist={editingArtist}
          onClose={handleSaveArtist}
          onSave={handleSaveArtist}
        />
      )}
    </div>
  )
}
