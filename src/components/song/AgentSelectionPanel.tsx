import { useState } from 'react'
import { Agent } from '../../types'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Check, Users, Trophy } from 'lucide-react'
import { cn } from '../../lib/utils'

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
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="mb-8 text-center">
        <h2 className="font-display text-3xl font-semibold text-ivory-100 mb-2">
          Select Your Team
        </h2>
        <p className="text-champagne-500">Choose AI agents to generate and evaluate your song</p>
      </div>

      {/* Generator Agents */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
            <Users className="h-4 w-4 text-violet-400" />
          </div>
          <h3 className="font-display text-lg font-medium text-ivory-100">Generator Agents</h3>
          <span className="text-xs text-champagne-500 ml-2">(Select multiple)</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {agents.map((agent) => {
            const isSelected = selectedAgentIds.includes(agent.id)
            return (
              <Card
                key={agent.id}
                className={cn(
                  'cursor-pointer p-4 transition-all duration-300',
                  isSelected
                    ? 'border-violet-500/50 bg-violet-500/10'
                    : 'border-white/10 hover:border-white/20 hover:bg-luxury-800/50'
                )}
                onClick={() => toggleAgent(agent.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-ivory-100">{agent.name}</h4>
                    <p className="text-xs text-champagne-500 mt-0.5">{agent.provider}</p>
                  </div>
                  {isSelected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 shadow-lg shadow-violet-500/30">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
        {agents.length === 0 && (
          <p className="text-champagne-500 text-sm">No generator agents available</p>
        )}
      </div>

      {/* Orchestrator */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
            <Trophy className="h-4 w-4 text-amber-400" />
          </div>
          <h3 className="font-display text-lg font-medium text-ivory-100">Orchestrator</h3>
          <span className="text-xs text-champagne-500 ml-2">(Select one)</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {orchestrators.map((agent) => {
            const isSelected = selectedOrchestratorId === agent.id
            return (
              <Card
                key={agent.id}
                className={cn(
                  'cursor-pointer p-4 transition-all duration-300',
                  isSelected
                    ? 'border-amber-500/50 bg-amber-500/10'
                    : 'border-white/10 hover:border-white/20 hover:bg-luxury-800/50'
                )}
                onClick={() => setSelectedOrchestratorId(agent.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-ivory-100">{agent.name}</h4>
                    <p className="text-xs text-champagne-500 mt-0.5">{agent.provider}</p>
                  </div>
                  {isSelected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-lg shadow-amber-500/30">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
        {orchestrators.length === 0 && (
          <p className="text-champagne-500 text-sm">No orchestrator agents available</p>
        )}
      </div>

      {/* Continue Button */}
      <Button
        onClick={handleConfirm}
        disabled={selectedAgentIds.length === 0 || !selectedOrchestratorId}
        variant="gold"
        className="w-full"
        size="lg"
      >
        Continue to Description
      </Button>
    </div>
  )
}
