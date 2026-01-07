import { useState, useEffect } from 'react'
import { promptService, SystemPrompt } from '../../services/prompts/PromptService'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { RefreshCw, Save } from 'lucide-react'

interface PromptEditorProps {
  onRefresh?: () => void
}

export function PromptEditor({ onRefresh }: PromptEditorProps) {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState<Record<string, string>>({})

  useEffect(() => {
    loadPrompts()
  }, [])

  const loadPrompts = async () => {
    setLoading(true)
    const data = await promptService.getAllPrompts()
    setPrompts(data)
    setEditedContent(Object.fromEntries(data.map(p => [p.key, p.content])))
    setLoading(false)
  }

  const handleSave = async (key: string) => {
    setSaving(key)
    const success = await promptService.updatePrompt(key, editedContent[key])
    if (success) {
      promptService.clearCache()
      onRefresh?.()
    }
    setSaving(null)
  }

  if (loading) {
    return <div className="py-8 text-center text-gray-500">Loading prompts...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-200">Master Prompts</h2>
        <Button variant="outline" onClick={loadPrompts}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {prompts.length === 0 ? (
        <Card className="p-4">
          <p className="text-gray-500">No system prompts found. Run the database migration to seed default prompts.</p>
        </Card>
      ) : (
        prompts.map((prompt) => (
          <Card key={prompt.key} className="p-4">
            <div className="mb-3">
              <h3 className="font-medium text-gray-200">{prompt.name}</h3>
              {prompt.description && (
                <p className="text-sm text-gray-500">{prompt.description}</p>
              )}
            </div>
            <textarea
              value={editedContent[prompt.key] || ''}
              onChange={(e) => setEditedContent({ ...editedContent, [prompt.key]: e.target.value })}
              className="min-h-[150px] w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-sm text-gray-100 font-mono"
            />
            <div className="mt-3 flex justify-end">
              <Button
                onClick={() => handleSave(prompt.key)}
                disabled={saving === prompt.key || editedContent[prompt.key] === prompt.content}
              >
                {saving === prompt.key ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
