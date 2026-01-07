export interface Agent {
  id: string
  name: string
  provider: string
  api_endpoint: string
  model_name: string
  capabilities: {
    context_window: number
    max_output?: number
    supported_features?: string[]
  }
  cost_per_1k_tokens: number
  is_active: boolean
}

export interface AgentConfig {
  agent_id: string
  order: number
}
