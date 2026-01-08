import { useState } from 'react'
import { Agent } from '../../types'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Check, Users, Trophy } from 'lucide-react'

interface AgentSelectionPanelProps {
  onConfirm: (selectedAgentIds: string[], orchestratorId: string) => void
  agents: Agent[]
  orchestrators: Agent[]
}

export function AgentSelectionPanel({
  onConfirm,
  agents,
  orchestrators,
}: AgentSelectionPanelProps) {
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-100">Select Your Team</h2>
        <p className="text-gray-400 mt-2">Choose AI agents to generate and evaluate your song</p>
      </div>

      {/* Generator Agents */}
      <div className="mb-8">
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
                className={`cursor-pointer p-4 transition-colors ${
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
      <div className="mb-8">
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
                className={`cursor-pointer p-4 transition-colors ${
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

      {/* Continue Button */}
      <Button
        onClick={handleConfirm}
        disabled={selectedAgentIds.length === 0 || !selectedOrchestratorId}
        className="w-full"
        size="lg"
      >
        Continue
      </Button>
    </div>
  )
}
