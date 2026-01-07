import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Toggle } from '../components/ui/Toggle'
import { PromptEditor } from '../components/settings/PromptEditor'
import { useIsAdmin } from '../hooks/useIsAdmin'

export function Settings() {
  const { isAdmin, loading: adminLoading } = useIsAdmin()
  const [settings, setSettings] = useState({
    defaultIterations: 3,
    autoIterate: false,
    useCustomPrompts: false,
    agentMasterPrompt: '',
    orchestratorMasterPrompt: '',
    artistCreatorMasterPrompt: '',
  })

  if (adminLoading) {
    return <div className="flex items-center justify-center py-12">Loading settings...</div>
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold text-gray-100">Settings</h1>

      <Card className="mb-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-200">Iteration Settings</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-300">Auto-Iterate</h3>
              <p className="text-sm text-gray-500">Automatically iterate on songs without manual checkpoints</p>
            </div>
            <Toggle
              pressed={settings.autoIterate}
              onPressedChange={(pressed) => setSettings({ ...settings, autoIterate: pressed })}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Max Iterations</label>
            <Input
              type="number"
              value={settings.defaultIterations}
              onChange={(e) => setSettings({ ...settings, defaultIterations: parseInt(e.target.value) })}
              className="w-32"
            />
            <p className="mt-1 text-xs text-gray-500">Maximum number of iteration cycles</p>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-200">Master Prompts</h2>
          <Toggle
            pressed={settings.useCustomPrompts}
            onPressedChange={(pressed) => setSettings({ ...settings, useCustomPrompts: pressed })}
          />
        </div>

        {settings.useCustomPrompts && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Agent Master Prompt</label>
              <textarea
                value={settings.agentMasterPrompt}
                onChange={(e) => setSettings({ ...settings, agentMasterPrompt: e.target.value })}
                placeholder="Custom prompt for song generation agents..."
                className="min-h-[100px] w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-gray-100 placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Orchestrator Master Prompt</label>
              <textarea
                value={settings.orchestratorMasterPrompt}
                onChange={(e) => setSettings({ ...settings, orchestratorMasterPrompt: e.target.value })}
                placeholder="Custom prompt for the orchestrator agent..."
                className="min-h-[100px] w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-gray-100 placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Artist Creator Master Prompt</label>
              <textarea
                value={settings.artistCreatorMasterPrompt}
                onChange={(e) => setSettings({ ...settings, artistCreatorMasterPrompt: e.target.value })}
                placeholder="Custom prompt for AI-assisted artist creation..."
                className="min-h-[100px] w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-gray-100 placeholder:text-gray-500"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Admin-only System Prompts Section */}
      {isAdmin && (
        <Card className="mb-6 border-primary-500/30">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-200">System Master Prompts</h2>
            <p className="text-sm text-gray-500">Admin-only: Edit the default prompts used by all users</p>
          </div>
          <PromptEditor />
        </Card>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setSettings({
          defaultIterations: 3,
          autoIterate: false,
          useCustomPrompts: false,
          agentMasterPrompt: '',
          orchestratorMasterPrompt: '',
          artistCreatorMasterPrompt: '',
        })}>
          Reset to Defaults
        </Button>
        <Button onClick={() => alert('Settings saved!')}>Save Settings</Button>
      </div>
    </div>
  )
}
