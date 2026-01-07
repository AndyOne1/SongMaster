import { useState } from 'react'
import { Agent } from '../../types'
import { Card } from '../ui/Card'
import { Modal } from '../ui/Modal'
import { Plus, X } from 'lucide-react'

interface AgentSelectorProps {
  agents: Agent[]
  selectedAgents: string[]
  onAddAgent: (agentId: string) => void
  onRemoveAgent: (agentId: string) => void
}

export function AgentSelector({ agents, selectedAgents, onAddAgent, onRemoveAgent }: AgentSelectorProps) {
  const [showModal, setShowModal] = useState(false)

  const selectedAgentObjects = agents.filter(a => selectedAgents.includes(a.id))

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-300">AI Agents</label>
      <div className="flex flex-wrap gap-2">
        {selectedAgentObjects.map((agent) => (
          <div
            key={agent.id}
            className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2"
          >
            <span className="text-sm font-medium text-gray-200">{agent.name}</span>
            <button
              onClick={() => onRemoveAgent(agent.id)}
              className="rounded p-0.5 hover:bg-gray-700"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        ))}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg border border-dashed border-gray-600 bg-gray-800/50 px-3 py-2 text-sm text-gray-400 transition-colors hover:border-gray-500 hover:bg-gray-800 hover:text-gray-200"
        >
          <Plus className="h-4 w-4" />
          Add Agent
        </button>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Select AI Agent">
        <div className="space-y-2">
          {agents.filter(a => !selectedAgents.includes(a.id)).map((agent) => (
            <Card
              key={agent.id}
              className="cursor-pointer p-4 transition-colors hover:border-primary-500"
              onClick={() => {
                onAddAgent(agent.id)
                setShowModal(false)
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-200">{agent.name}</h4>
                  <p className="text-sm text-gray-500">{agent.provider}</p>
                </div>
                <span className="text-xs text-gray-600">{agent.model_name}</span>
              </div>
            </Card>
          ))}
          {agents.filter(a => !selectedAgents.includes(a.id)).length === 0 && (
            <p className="text-center text-gray-500">All agents selected</p>
          )}
        </div>
      </Modal>
    </div>
  )
}
