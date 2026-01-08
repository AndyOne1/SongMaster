import { useState } from 'react'
import { Artist } from '../../types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { Wand2, Edit3, Loader2, Check } from 'lucide-react'
import { cn } from '../../lib/utils'
import { supabase } from '../../services/supabase/client'
import { useToast } from '../ui/Toast'

// Backend URL - set via environment variable for production
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface ArtistWizardProps {
  artist?: Artist | null
  onClose: () => void
  onSave: () => void
}

type WizardMode = 'select' | 'ai-guided' | 'manual'

interface AIAgent {
  id: string
  name: string
  provider: string
  model_name: string
}

export function ArtistWizard({ artist, onClose, onSave }: ArtistWizardProps) {
  const { showToast } = useToast()
  const [mode, setMode] = useState<WizardMode>('select')
  const [input, setInput] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedOptions, setGeneratedOptions] = useState<Artist[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [selectedAgent] = useState<AIAgent>({ id: 'gen-6', name: 'Grok', provider: 'xAI', model_name: 'x-ai/grok-4.1-fast' })

  // Manual form state
  const [manualForm, setManualForm] = useState({
    name: artist?.name || '',
    style_description: artist?.style_description || '',
    special_characteristics: artist?.special_characteristics || '',
  })

  const handleAIGenerate = async () => {
    if (!input.trim()) return

    setGenerating(true)
    try {
      // Call API to generate artist options
      const response = await fetch(`${BACKEND_URL}/api/generate-artist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, model_name: selectedAgent.model_name }),
      })
      const data = await response.json()
      setGeneratedOptions(data.options || [])
    } catch (error) {
      console.error('Failed to generate artists:', error)
      // Demo fallback with mock data
      setGeneratedOptions([
        {
          id: 'demo-1',
          user_id: 'demo',
          name: 'Neon Horizon',
          style_description: 'Synthwave band with dreamy 80s aesthetics',
          special_characteristics: 'Retro synth leads and driving basslines',
          created_at: new Date(),
        },
        {
          id: 'demo-2',
          user_id: 'demo',
          name: 'Velvet Echo',
          style_description: 'Indie rock with psychedelic influences',
          special_characteristics: 'Layered guitar textures and introspective lyrics',
          created_at: new Date(),
        },
        {
          id: 'demo-3',
          user_id: 'demo',
          name: 'Crystal Waves',
          style_description: 'Ambient electronic with nature sounds',
          special_characteristics: 'Ethereal vocals and organic soundscapes',
          created_at: new Date(),
        },
      ])
    } finally {
      setGenerating(false)
    }
  }

  const handleManualSave = async () => {
    if (!manualForm.name.trim() || !manualForm.style_description.trim()) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      showToast('Please sign in to save artists', 'error')
      return
    }

    const { error } = await supabase.from('artists').insert({
      user_id: user.id,
      name: manualForm.name,
      style_description: manualForm.style_description,
      special_characteristics: manualForm.special_characteristics,
    })

    if (error) {
      console.error('Failed to save artist:', error)
      showToast('Failed to save artist: ' + error.message, 'error')
      return
    }

    onSave()
  }

  const handleAISave = async () => {
    if (selectedOption === null || !generatedOptions[selectedOption]) return

    const selected = generatedOptions[selectedOption]

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      showToast('Please sign in to save artists', 'error')
      return
    }

    const { error } = await supabase.from('artists').insert({
      user_id: user.id,
      name: selected.name,
      style_description: selected.style_description,
      special_characteristics: selected.special_characteristics,
    })

    if (error) {
      console.error('Failed to save artist:', error)
      showToast('Failed to save artist: ' + error.message, 'error')
      return
    }

    onSave()
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={artist ? 'Edit Artist' : 'Create Artist'} className="max-w-2xl">
      {/* Mode Selection */}
      {mode === 'select' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => setMode('ai-guided')}
            className="flex flex-col items-center gap-3 rounded-xl border-2 border-gray-700 p-6 transition-colors hover:border-primary-500 hover:bg-gray-800/50"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600/20">
              <Wand2 className="h-8 w-8 text-primary-400" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-200">AI Guided</h3>
              <p className="mt-1 text-sm text-gray-500">Describe and let AI create options</p>
            </div>
          </button>
          <button
            onClick={() => setMode('manual')}
            className="flex flex-col items-center gap-3 rounded-xl border-2 border-gray-700 p-6 transition-colors hover:border-primary-500 hover:bg-gray-800/50"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700">
              <Edit3 className="h-8 w-8 text-gray-400" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-200">Manual</h3>
              <p className="mt-1 text-sm text-gray-500">Fill in the form yourself</p>
            </div>
          </button>
        </div>
      )}

      {/* AI Guided Mode */}
      {mode === 'ai-guided' && (
        <div>
          <button onClick={() => setMode('select')} className="mb-4 text-sm text-gray-400 hover:text-gray-200">
            ← Back to mode selection
          </button>

          {/* Agent Selector */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">Select AI Agent</label>
            <Card
              className="flex cursor-pointer items-center gap-3 p-3"
              onClick={() => {/* Open agent selector */}}
            >
              <span className="font-medium text-gray-200">{selectedAgent.name}</span>
              <span className="text-sm text-gray-500">({selectedAgent.provider})</span>
            </Card>
          </div>

          {/* Input */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Describe the artist you want to create
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., A 80s synth-pop band with dreamy vocals and electronic beats"
              className="min-h-[100px] w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-gray-100 placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <Button onClick={handleAIGenerate} disabled={generating || !input.trim()} className="w-full">
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate 3 Options
              </>
            )}
          </Button>

          {/* Generated Options */}
          {generatedOptions.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-medium text-gray-300">Choose an option:</h4>
              {generatedOptions.map((option, index) => (
                <Card
                  key={index}
                  className={cn(
                    'cursor-pointer p-4 transition-all',
                    selectedOption === index
                      ? 'border-primary-500 bg-primary-600/10'
                      : 'hover:border-gray-600'
                  )}
                  onClick={() => setSelectedOption(index)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-semibold text-gray-200">{option.name}</h5>
                      <p className="mt-1 text-sm text-gray-400">{option.style_description}</p>
                      {option.special_characteristics && (
                        <p className="mt-1 text-xs text-gray-500">✨ {option.special_characteristics}</p>
                      )}
                    </div>
                    {selectedOption === index && <Check className="h-5 w-5 text-primary-400" />}
                  </div>
                </Card>
              ))}
              <Button onClick={handleAISave} disabled={selectedOption === null} className="mt-4 w-full">
                Save Artist
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Manual Mode */}
      {mode === 'manual' && (
        <div>
          <button onClick={() => setMode('select')} className="mb-4 text-sm text-gray-400 hover:text-gray-200">
            ← Back to mode selection
          </button>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Artist Name *</label>
              <Input
                value={manualForm.name}
                onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                placeholder="e.g., The Midnight Echo"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Style Description *</label>
              <textarea
                value={manualForm.style_description}
                onChange={(e) => setManualForm({ ...manualForm, style_description: e.target.value })}
                placeholder="Describe the musical style, genre, influences..."
                className="min-h-[80px] w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-gray-100 placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Special Characteristics</label>
              <textarea
                value={manualForm.special_characteristics}
                onChange={(e) => setManualForm({ ...manualForm, special_characteristics: e.target.value })}
                placeholder="What makes this artist unique? Signature sounds, themes, etc."
                className="min-h-[80px] w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-gray-100 placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleManualSave} className="flex-1">
                {artist ? 'Update Artist' : 'Create Artist'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
