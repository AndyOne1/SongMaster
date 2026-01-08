import { useState } from 'react'
import { Agent } from '../../types'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Check, Users, Trophy } from 'lucide-react'

interface AgentSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selectedAgentIds: string[], orchestratorId: string) => void
  agents: Agent[]
  orchestrators: Agent[]
}

export function AgentSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  agents,
  orchestrators
}: AgentSelectionModalProps) {
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([])
  const [selectedOrchestratorId, setSelectedOrchestratorId] = useState<string | null>(null)

  const toggleAgent = (agentId: string) => {
    if (selectedAgentIds.includes(agentId)) {
      setSelectedAgentIds(selectedAgentIds.filter(id => id !== agentId))
    } else {
      setSelectedAgentIds([...selectedAgentIds, agentId])
    }
  }

  const handleConfirm = () => {
    if (selectedAgentIds.length > 0 && selectedOrchestratorId) {
      onConfirm(selectedAgentIds, selectedOrchestratorId)
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Your Team" className="max-w-2xl">
      {/* Generator Agents */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-primary-400" />
          <h3 className="font-medium text-gray-200">Generator Agents</h3>
          <span className="text-xs text-gray-500">(Select multiple)</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {agents.map((agent) => {
            const isSelected = selectedAgentIds.includes(agent.id)
            return (
              <Card
                key={agent.id}
                className={`cursor-pointer p-3 transition-colors ${
                  isSelected
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => toggleAgent(agent.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-200">{agent.name}</h4>
                    <p className="text-xs text-gray-500">{agent.provider}</p>
                  </div>
                  {isSelected && <Check className="h-5 w-5 text-primary-400" />}
                </div>
              </Card>
            )
          })}
        </div>
        {agents.length === 0 && (
          <p className="text-gray-500 text-sm">No generator agents available</p>
        )}
      </div>

      {/* Orchestrator */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <h3 className="font-medium text-gray-200">Orchestrator</h3>
          <span className="text-xs text-gray-500">(Select one)</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {orchestrators.map((agent) => {
            const isSelected = selectedOrchestratorId === agent.id
            return (
              <Card
                key={agent.id}
                className={`cursor-pointer p-3 transition-colors ${
                  isSelected
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedOrchestratorId(agent.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-200">{agent.name}</h4>
                    <p className="text-xs text-gray-500">{agent.provider}</p>
                  </div>
                  {isSelected && <Check className="h-5 w-5 text-yellow-400" />}
                </div>
              </Card>
            )
          })}
        </div>
        {orchestrators.length === 0 && (
          <p className="text-gray-500 text-sm">No orchestrator agents available</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={selectedAgentIds.length === 0 || !selectedOrchestratorId}
          className="flex-1"
        >
          Generate Song
        </Button>
      </div>
    </Modal>
  )
}
