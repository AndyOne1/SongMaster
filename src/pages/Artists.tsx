import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../services/supabase/client'
import { Artist } from '../types'
import { ArtistLibrary } from '../components/artists/ArtistLibrary'
import { ArtistWizard } from '../components/artists/ArtistWizard'
import { useAuth } from '../context/AuthContext'
import { Mic2 } from 'lucide-react'

export function Artists() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [showWizard, setShowWizard] = useState(false)
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null)

  useEffect(() => {
    if (user) {
      loadArtists()

      // Check for edit query param
      const editId = searchParams.get('edit')
      if (editId) {
        const artistToEdit = artists.find(a => a.id === editId)
        if (artistToEdit) {
          setEditingArtist(artistToEdit)
          setShowWizard(true)
        }
      }
    } else {
      setLoading(false)
    }
  }, [user])

  // Re-run when artists are loaded to handle edit param
  useEffect(() => {
    if (artists.length > 0) {
      const editId = searchParams.get('edit')
      if (editId) {
        const artistToEdit = artists.find(a => a.id === editId)
        if (artistToEdit) {
          setEditingArtist(artistToEdit)
          setShowWizard(true)
        }
      }
    }
  }, [artists.length])

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
    // Clear the edit query param
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      newParams.delete('edit')
      return newParams
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-champagne-500">
          <div className="h-5 w-5 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
          <span>Loading artists...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg shadow-violet-500/20">
            <Mic2 className="h-5 w-5 text-white" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-ivory-100">
            Artists
          </h1>
        </div>
        <p className="text-champagne-500">
          {artists.length} {artists.length === 1 ? 'artist' : 'artists'} in your collection
        </p>
      </div>

      <ArtistLibrary
        artists={artists}
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
