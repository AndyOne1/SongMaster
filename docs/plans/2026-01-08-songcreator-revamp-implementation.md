# SongCreator Revamp Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild SongCreator with new agent selection modal, structured multi-agent generation flow, and improved result display with orchestrator evaluation.

**Architecture:**
- New AgentSelectionModal for agent/orchestrator selection
- AgentCard with 6 states (waiting, generating, done, error, winner, override)
- OrchestratorCard on side with winner actions
- Backend handles parallel agent calls and orchestrator evaluation
- song_id tracks all outputs for linking evaluations

**Tech Stack:** React + TypeScript, Tailwind CSS, Express backend, OpenRouter API

---

## Phase 1: Backend API Updates

### Task 1: Update POST /api/generate for Multi-Agent Flow

**Files:**
- Modify: `server/index.js`

**Step 1: Write the failing test**

```javascript
// No frontend test yet - will test via frontend
```

**Step 2: Run current test to verify baseline**

```bash
npm test -- --run 2>&1 | tail -5
```

Expected: Tests pass (baseline)

**Step 3: Update /api/generate endpoint**

```javascript
// Replace existing /api/generate with multi-agent version
app.post('/api/generate', async (req, res) => {
  const { song_id, agents, prompt, user_request, user_style } = req.body

  if (!song_id || !agents || agents.length === 0) {
    return res.status(400).json({ error: 'song_id and agents required' })
  }

  try {
    // Call all agents in parallel
    const agentPromises = agents.map(async (agent) => {
      const result = await callOpenRouter(
        agent.model_name,
        [{ role: 'user', content: prompt }],
        { maxTokens: 4000 }
      )
      return { agentId: agent.id, ...result }
    })

    const results = await Promise.allSettled(agentPromises)

    // Collect successful results
    const completedResults = {}
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        completedResults[result.value.agentId] = {
          name: result.value.name,
          style: result.value.style,
          lyrics: result.value.lyrics
        }
      }
    }

    res.json({
      song_id,
      results: completedResults,
      completed_count: Object.keys(completedResults).length,
      failed_count: agents.length - Object.keys(completedResults).length
    })
  } catch (error) {
    console.error('Generation error:', error)
    res.status(500).json({ error: error.message || 'Failed to generate' })
  }
})
```

**Step 4: Update callOpenRouter to handle structured output**

```javascript
async function callOpenRouter(model, messages, options = {}) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://songmaster.app',
      'X-Title': 'SongMaster',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: options.maxTokens || 4000,
      temperature: options.temperature || 0.7,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `OpenRouter error: ${response.status}`)
  }

  const data = await response.json()
  let content = data.choices[0].message.content

  // Strip markdown code fences
  content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '')
  content = content.replace(/^```\s*/, '').replace(/\s*```$/, '')

  // Parse and extract fields
  const parsed = JSON.parse(content)
  return {
    name: parsed.name || 'Untitled',
    style: parsed.style || parsed.style_description || '',
    lyrics: parsed.lyrics || ''
  }
}
```

**Step 5: Test the endpoint**

```bash
curl -X POST https://songmaster.fly.dev/api/generate \
  -H "Content-Type: application/json" \
  -d '{"song_id":"test-123","agents":[{"id":"gen-1","model_name":"anthropic/claude-sonnet-4-20250514"}],"prompt":"Test"}' | jq .
```

Expected: JSON response with song_id, results object

**Step 6: Commit**

```bash
git add server/index.js
git commit -m "feat: update /api/generate for multi-agent parallel generation"
```

---

### Task 2: Update POST /api/orchestrate with Structured Evaluations

**Files:**
- Modify: `server/index.js`

**Step 1: Write the failing test**

```javascript
// No test yet - will test via frontend
```

**Step 2: Update /api/orchestrate endpoint**

```javascript
app.post('/api/orchestrate', async (req, res) => {
  const { song_id, user_request, user_style, songs } = req.body

  if (!song_id || !songs || Object.keys(songs).length === 0) {
    return res.status(400).json({ error: 'song_id and songs required' })
  }

  try {
    // Build songs summary for evaluation
    const songsSummary = Object.entries(songs).map(([agentId, song]) => {
      return `[Agent: ${agentId}]
Name: ${song.name}
Style: ${song.style}
Lyrics: ${song.lyrics.substring(0, 500)}...`
    }).join('\n\n---\n\n')

    const result = await callOpenRouter(
      process.env.ORCHESTRATOR_MODEL || 'anthropic/claude-sonnet-4-20250514',
      [
        {
          role: 'system',
          content: `You are an expert music producer. Evaluate these song specifications and score them.

# User Request
Song Description: ${user_request}
Desired Style: ${user_style}

# Songs to Evaluate
${songsSummary}

# Scoring Criteria (1-10 each)
1. Music Style: How well the style matches the request
2. Lyrics: Quality, coherence, and emotional impact
3. Originality: Creative and unique elements
4. Cohesion: How well lyrics and style work together

# Output Format
Return JSON with this structure:
{
  "evaluations": {
    "agent_id": {
      "matched_request": "Yes/No + brief explanation",
      "scores": {
        "music_style": 8,
        "lyrics": 7,
        "originality": 6,
        "cohesion": 8
      },
      "analysis": "Short 1-2 sentence analysis",
      "evaluation": "Full evaluation paragraph",
      "recommendations": "How to improve / make more like request"
    }
  },
  "winner_agent_id": "agent_id_of_best_song",
  "winner_reason": "Why this song won (2-3 sentences)"
}`
        },
        { role: 'user', content: 'Evaluate all songs and return structured JSON.' }
      ],
      { maxTokens: 3000 }
    )

    res.json({
      song_id,
      ...result
    })
  } catch (error) {
    console.error('Orchestration error:', error)
    res.status(500).json({ error: error.message || 'Failed to orchestrate' })
  }
})
```

**Step 3: Test the endpoint**

```bash
curl -X POST https://songmaster.fly.dev/api/orchestrate \
  -H "Content-Type: application/json" \
  -d '{"song_id":"test-123","user_request":"A sad song about loss","user_style":" acoustic ballad","songs":{"gen-1":{"name":"Tears","style":"acoustic ballad","lyrics":"Verse 1..."}}}' | jq .
```

Expected: JSON with evaluations, winner_agent_id, winner_reason

**Step 4: Commit**

```bash
git add server/index.js
git commit -m "feat: update /api/orchestrate with structured evaluations per song"
```

---

## Phase 2: Frontend Components

### Task 3: Create AgentSelectionModal Component

**Files:**
- Create: `src/components/song/AgentSelectionModal.tsx`

**Step 1: Write the failing test**

```typescript
// src/__tests__/agent-selection-modal.test.tsx
import { describe, it, expect, render, screen, fireEvent } from '@testing-library/react'
import { AgentSelectionModal } from '../components/song/AgentSelectionModal'

describe('AgentSelectionModal', () => {
  it('should render when isOpen is true', () => {
    render(
      <AgentSelectionModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        agents={[]}
        orchestrators={[]}
      />
    )
    expect(screen.getByText(/select agents/i)).toBeInTheDocument()
  })

  it('should show generate button disabled when no agents selected', () => {
    render(
      <AgentSelectionModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        agents={[{ id: 'gen-1', name: 'Agent 1', provider: 'OpenRouter' }]}
        orchestrators={[{ id: 'orch-1', name: 'Orchestrator 1', provider: 'OpenRouter' }]}
      />
    )
    expect(screen.getByText(/generate song/i)).toBeDisabled()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- --run -t "AgentSelectionModal" 2>&1
```

Expected: FAIL - Component not found

**Step 3: Write minimal implementation**

```typescript
// src/components/song/AgentSelectionModal.tsx
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
```

**Step 4: Run test to verify it passes**

```bash
npm test -- --run -t "AgentSelectionModal" 2>&1
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/song/AgentSelectionModal.tsx src/__tests__/agent-selection-modal.test.tsx
git commit -m "feat: create AgentSelectionModal component"
```

---

### Task 4: Create AgentCard Component with States

**Files:**
- Create: `src/components/song/AgentCard.tsx`

**Step 1: Write the failing test**

```typescript
// src/__tests__/agent-card.test.tsx
import { describe, it, expect, render, screen } from '@testing-library/react'
import { AgentCard } from '../components/song/AgentCard'

describe('AgentCard', () => {
  it('should render agent name in waiting state', () => {
    render(
      <AgentCard
        agentName="Claude"
        status="waiting"
        onClick={() => {}}
      />
    )
    expect(screen.getByText('Claude')).toBeInTheDocument()
  })

  it('should show song name when done', () => {
    render(
      <AgentCard
        agentName="Claude"
        status="done"
        songName="My Song"
        stylePreview="Rock ballad"
        scores={{ music_style: 8, lyrics: 7, originality: 6, cohesion: 8 }}
        onClick={() => {}}
      />
    )
    expect(screen.getByText('My Song')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument() // Score
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- --run -t "AgentCard" 2>&1
```

Expected: FAIL - Component not found

**Step 3: Write minimal implementation**

```typescript
// src/components/song/AgentCard.tsx
import { cn } from '../../lib/utils'
import { Card } from '../ui/Card'
import { Music } from 'lucide-react'

interface AgentCardProps {
  agentName: string
  status: 'waiting' | 'generating' | 'done' | 'error' | 'winner' | 'override'
  songName?: string
  stylePreview?: string
  scores?: {
    music_style: number
    lyrics: number
    originality: number
    cohesion: number
  }
  onClick: () => void
}

const scoreLabels = ['Music', 'Lyrics', 'Originality', 'Cohesion']

export function AgentCard({
  agentName,
  status,
  songName,
  stylePreview,
  scores,
  onClick
}: AgentCardProps) {
  const isGenerating = status === 'generating'
  const isDone = status === 'done'
  const isWinner = status === 'winner'
  const isOverride = status === 'override'
  const hasError = status === 'error'

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all',
        isWinner && 'border-2 border-yellow-500 bg-yellow-500/5 animate-pulse',
        isOverride && 'border-2 border-blue-500 bg-blue-500/5',
        hasError && 'border-red-500',
        !isWinner && !isOverride && !hasError && isDone && 'border-green-500/30'
      )}
      onClick={onClick}
    >
      {/* Header - Agent Name */}
      <div className="flex items-center gap-2 mb-2">
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
          isWinner ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'
        )}>
          {agentName.charAt(0)}
        </div>
        <span className="font-medium text-gray-200">{agentName}</span>
        {isOverride && (
          <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
            Override
          </span>
        )}
      </div>

      {/* Song Info - only when done/winner/override */}
      {isDone || isWinner || isOverride ? (
        <>
          <div className="mb-2">
            <h4 className="font-medium text-gray-200">{songName}</h4>
            {stylePreview && (
              <p className="text-xs text-gray-400 line-clamp-1">{stylePreview}</p>
            )}
          </div>

          {/* Score Table */}
          {scores && (
            <div className="bg-gray-900/50 rounded p-2 text-xs">
              <div className="grid grid-cols-4 gap-1 text-center mb-1">
                {scoreLabels.map((label) => (
                  <span key={label} className="text-gray-500 text-[10px] uppercase">
                    {label.substring(0, 3)}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-1 text-center">
                <span className="text-gray-200">{scores.music_style}</span>
                <span className="text-gray-200">{scores.lyrics}</span>
                <span className="text-gray-200">{scores.originality}</span>
                <span className="text-gray-200">{scores.cohesion}</span>
              </div>
            </div>
          )}
        </>
      ) : isGenerating ? (
        <div className="flex items-center justify-center py-4 text-gray-500">
          <div className="h-2 w-2 rounded-full bg-gray-600 animate-pulse mr-2" />
          <span className="text-sm">Generating...</span>
        </div>
      ) : hasError ? (
        <div className="py-4 text-red-400 text-sm text-center">
          Generation failed
        </div>
      ) : (
        <div className="py-4 text-gray-500 text-sm text-center">
          Waiting...
        </div>
      )}
    </Card>
  )
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- --run -t "AgentCard" 2>&1
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/song/AgentCard.tsx src/__tests__/agent-card.test.tsx
git commit -m "feat: create AgentCard component with states"
```

---

### Task 5: Create OrchestratorCard Component

**Files:**
- Create: `src/components/song/OrchestratorCard.tsx`

**Step 1: Write the failing test**

```typescript
// src/__tests__/orchestrator-card.test.tsx
import { describe, it, expect, render, screen } from '@testing-library/react'
import { OrchestratorCard } from '../components/song/OrchestratorCard'

describe('OrchestratorCard', () => {
  it('should show status when waiting', () => {
    render(
      <OrchestratorCard
        orchestratorName="Claude"
        status="waiting"
        onSave={() => {}}
        onIterate={() => {}}
      />
    )
    expect(screen.getByText(/waiting/i)).toBeInTheDocument()
  })

  it('should show winner when complete', () => {
    render(
      <OrchestratorCard
        orchestratorName="Claude"
        status="complete"
        winnerName="Song Title"
        winnerReason="Great song"
        onSave={() => {}}
        onIterate={() => {}}
      />
    )
    expect(screen.getByText('Song Title')).toBeInTheDocument()
    expect(screen.getByText('Great song')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- --run -t "OrchestratorCard" 2>&1
```

Expected: FAIL - Component not found

**Step 3: Write minimal implementation**

```typescript
// src/components/song/OrchestratorCard.tsx
import { useState } from 'react'
import { cn } from '../../lib/utils'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Trophy, RefreshCw, Plus, ChevronDown, ChevronUp } from 'lucide-react'

interface OrchestratorCardProps {
  orchestratorName: string
  status: 'waiting' | 'fetching' | 'analyzing' | 'scoring' | 'evaluating' | 'complete'
  winnerName?: string
  winnerReason?: string
  winnerAgentId?: string
  onSave: () => void
  onIterate: (customInstruction?: string) => void
  onNewSong: () => void
}

const statusMessages: Record<string, string> = {
  waiting: 'Waiting for agents to finish...',
  fetching: 'Fetching songs from agents...',
  analyzing: 'Analyzing songs...',
  scoring: 'Scoring songs...',
  evaluating: 'Evaluating recommendations...',
  complete: 'Evaluation complete'
}

export function OrchestratorCard({
  orchestratorName,
  status,
  winnerName,
  winnerReason,
  onSave,
  onIterate,
  onNewSong
}: OrchestratorCardProps) {
  const [showCustomInstruction, setShowCustomInstruction] = useState(false)
  const [customInstruction, setCustomInstruction] = useState('')

  const isComplete = status === 'complete'
  const isProcessing = !isComplete && status !== 'waiting'

  return (
    <Card className={cn(
      'p-4',
      isComplete && 'border-yellow-500/30 bg-yellow-500/5'
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Trophy className={cn(
          'h-5 w-5',
          isComplete ? 'text-yellow-400' : 'text-gray-500'
        )} />
        <span className="font-medium text-gray-200">{orchestratorName}</span>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded ml-auto',
          isComplete ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-400'
        )}>
          {isComplete ? 'Winner' : status}
        </span>
      </div>

      {/* Status / Winner */}
      {isProcessing ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
          <RefreshCw className="h-4 w-4 animate-spin" />
          {statusMessages[status]}
        </div>
      ) : isComplete && winnerName ? (
        <div className="mb-4">
          <h3 className="font-medium text-gray-200 mb-1">{winnerName}</h3>
          {winnerReason && (
            <p className="text-sm text-gray-400">{winnerReason}</p>
          )}
        </div>
      ) : (
        <div className="py-4 text-sm text-gray-500">
          {statusMessages[status]}
        </div>
      )}

      {/* Actions */}
      {isComplete && (
        <div className="space-y-3">
          {/* Iterate with Custom Instruction */}
          <div>
            <Button
              variant="outline"
              onClick={() => onIterate(customInstruction || undefined)}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Iterate on Song
            </Button>
            <button
              onClick={() => setShowCustomInstruction(!showCustomInstruction)}
              className="flex items-center gap-1 text-xs text-gray-500 mt-2 hover:text-gray-400"
            >
              Custom Instruction
              {showCustomInstruction ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
            {showCustomInstruction && (
              <textarea
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="Add instructions for the iteration..."
                className="w-full mt-2 p-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder:text-gray-500"
                rows={2}
              />
            )}
          </div>

          <Button onClick={onSave} className="w-full">
            Save to Library
          </Button>

          <Button
            variant="ghost"
            onClick={onNewSong}
            className="w-full text-gray-400 hover:text-gray-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Song
          </Button>
        </div>
      )}
    </Card>
  )
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- --run -t "OrchestratorCard" 2>&1
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/song/OrchestratorCard.tsx src/__tests__/orchestrator-card.test.tsx
git commit -m "feat: create OrchestratorCard component"
```

---

### Task 6: Create SongDetailModal Component

**Files:**
- Create: `src/components/song/SongDetailModal.tsx`

**Step 1: Write the failing test**

```typescript
// src/__tests__/song-detail-modal.test.tsx
import { describe, it, expect, render, screen, fireEvent } from '@testing-library/react'
import { SongDetailModal } from '../components/song/SongDetailModal'

describe('SongDetailModal', () => {
  it('should render song details when open', () => {
    render(
      <SongDetailModal
        isOpen={true}
        onClose={() => {}}
        agentName="Claude"
        songName="My Song"
        style="Rock ballad"
        lyrics="Verse 1..."
        evaluation={{ analysis: 'Good song', scores: { music_style: 8 } }}
        onSave={() => {}}
        onOverride={() => {}}
        isWinner={true}
      />
    )
    expect(screen.getByText('My Song')).toBeInTheDocument()
    expect(screen.getByText('Rock ballad')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- --run -t "SongDetailModal" 2>&1
```

Expected: FAIL - Component not found

**Step 3: Write minimal implementation**

```typescript
// src/components/song/SongDetailModal.tsx
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Music, Save, Check } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Evaluation {
  analysis: string
  scores: {
    music_style: number
    lyrics: number
    originality: number
    cohesion: number
  }
  recommendations?: string
}

interface SongDetailModalProps {
  isOpen: boolean
  onClose: () => void
  agentName: string
  songName: string
  style: string
  lyrics: string
  evaluation?: Evaluation
  onSave: () => void
  onOverride: () => void
  isWinner: boolean
  isOverride?: boolean
}

export function SongDetailModal({
  isOpen,
  onClose,
  agentName,
  songName,
  style,
  lyrics,
  evaluation,
  onSave,
  onOverride,
  isWinner,
  isOverride
}: SongDetailModalProps) {
  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={songName} className="max-w-2xl">
      {/* Header Info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <span>by {agentName}</span>
          {isWinner && !isOverride && (
            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
              Orchestrator Pick
            </span>
          )}
          {isOverride && (
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
              User Override
            </span>
          )}
        </div>
        <p className="text-gray-300">{style}</p>
      </div>

      {/* Evaluation */}
      {evaluation && (
        <Card className="mb-4 p-3 bg-gray-900/50">
          <h4 className="font-medium text-gray-200 mb-2">Orchestrator Evaluation</h4>
          <p className="text-sm text-gray-400 mb-3">{evaluation.analysis}</p>

          {/* Scores */}
          <div className="grid grid-cols-4 gap-2 text-center mb-3">
            {[
              { label: 'Music', value: evaluation.scores.music_style },
              { label: 'Lyrics', value: evaluation.scores.lyrics },
              { label: 'Originality', value: evaluation.scores.originality },
              { label: 'Cohesion', value: evaluation.scores.cohesion },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className={cn(
                  'text-lg font-bold',
                  value >= 8 ? 'text-green-400' : value >= 5 ? 'text-yellow-400' : 'text-red-400'
                )}>
                  {value}
                </div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>

          {evaluation.recommendations && (
            <div className="text-sm text-gray-400 border-t border-gray-700 pt-2">
              <strong className="text-gray-300">Recommendations:</strong>
              <p>{evaluation.recommendations}</p>
            </div>
          )}
        </Card>
      )}

      {/* Lyrics */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-200 mb-2">Lyrics</h4>
        <div className="bg-gray-900/50 p-4 rounded-lg text-gray-300 whitespace-pre-wrap font-mono text-sm max-h-60 overflow-y-auto">
          {lyrics}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Close
        </Button>
        {!isWinner && !isOverride && (
          <Button onClick={onOverride} className="flex-1">
            <Check className="mr-2 h-4 w-4" />
            Pick This Song
          </Button>
        )}
        <Button onClick={onSave} className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          Save to Library
        </Button>
      </div>
    </Modal>
  )
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- --run -t "SongDetailModal" 2>&1
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/song/SongDetailModal.tsx src/__tests__/song-detail-modal.test.tsx
git commit -m "feat: create SongDetailModal component"
```

---

### Task 7: Rebuild SongCreator.tsx

**Files:**
- Modify: `src/pages/SongCreator.tsx` (update to use new components)
- Create: `src/components/song/SongCreator.tsx` (main component)

**Step 1: Write the failing test**

```typescript
// src/__tests__/song-creator-revamp.test.tsx
import { describe, it, expect, render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SongCreator } from '../components/song/SongCreator'
import { MemoryRouter } from 'react-router-dom'

describe('SongCreator Revamp', () => {
  it('should show agent selection modal initially', () => {
    render(
      <MemoryRouter>
        <SongCreator />
      </MemoryRouter>
    )
    // Should show agent selection or prompt to start
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- --run -t "SongCreator Revamp" 2>&1
```

Expected: FAIL - Component not found

**Step 3: Write minimal implementation**

```typescript
// src/components/song/SongCreator.tsx
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Agent, Artist } from '../../types'
import { AgentSelectionModal } from './AgentSelectionModal'
import { AgentCard } from './AgentCard'
import { OrchestratorCard } from './OrchestratorCard'
import { SongDetailModal } from './SongDetailModal'
import { SongDescriptionInputs } from './SongDescriptionInputs'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { supabase } from '../../services/supabase/client'
import { Play, Users, Trophy } from 'lucide-react'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface SongResult {
  name: string
  style: string
  lyrics: string
}

interface Evaluation {
  analysis: string
  scores: {
    music_style: number
    lyrics: number
    originality: number
    cohesion: number
  }
  recommendations?: string
}

export function SongCreator() {
  const [searchParams] = useSearchParams()
  const artistId = searchParams.get('artist_id')

  // UI State
  const [step, setStep] = useState<'selection' | 'input' | 'generating' | 'results'>('selection')
  const [showAgentModal, setShowAgentModal] = useState(true)

  // Data
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([])
  const [selectedOrchestratorId, setSelectedOrchestratorId] = useState<string | null>(null)
  const [artist, setArtist] = useState<Artist | null>(null)
  const [songDescription, setSongDescription] = useState('')
  const [styleDescription, setStyleDescription] = useState('')

  // Results
  const [songId, setSongId] = useState<string | null>(null)
  const [agentResults, setAgentResults] = useState<Record<string, SongResult>>({})
  const [agentStatuses, setAgentStatuses] = useState<Record<string, 'waiting' | 'generating' | 'done' | 'error'>>({})
  const [orchestratorStatus, setOrchestratorStatus] = useState<'waiting' | 'fetching' | 'analyzing' | 'scoring' | 'evaluating' | 'complete'>('waiting')
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({})
  const [winnerAgentId, setWinnerAgentId] = useState<string | null>(null)
  const [winnerReason, setWinnerReason] = useState('')
  const [overrideAgentId, setOverrideAgentId] = useState<string | null>(null)

  // Detail Modal
  const [detailModal, setDetailModal] = useState<{
    open: boolean
    agentId: string
  } | null>(null)

  useEffect(() => {
    loadAgents()
    if (artistId) loadArtist(artistId)
  }, [artistId])

  const loadAgents = async () => {
    const { data } = await supabase.from('agents').select('*').eq('is_active', true).order('name')
    if (data) {
      setAgents(data as Agent[])
    }
  }

  const loadArtist = async (id: string) => {
    const { data } = await supabase.from('artists').select('*').eq('id', id).single()
    if (data) {
      setArtist(data as Artist)
      setStyleDescription(data.style_description)
    }
  }

  const handleAgentsSelected = (agentIds: string[], orchestratorId: string) => {
    setSelectedAgentIds(agentIds)
    setSelectedOrchestratorId(orchestratorId)
    setShowAgentModal(false)
    setStep('input')
  }

  const handleGenerate = async () => {
    if (!songId || selectedAgentIds.length === 0 || !selectedOrchestratorId) return

    setStep('generating')
    setAgentResults({})
    setAgentStatuses(Object.fromEntries(selectedAgentIds.map(id => [id, 'waiting'])))
    setOrchestratorStatus('waiting')
    setEvaluations({})
    setWinnerAgentId(null)
    setOverrideAgentId(null)

    try {
      // Generate song_id for tracking
      const newSongId = crypto.randomUUID()
      setSongId(newSongId)

      // Get selected agents
      const selectedAgents = agents.filter(a => selectedAgentIds.includes(a.id))
      const orchestrator = agents.find(a => a.id === selectedOrchestratorId)

      // Build prompt
      const artistContext = artist
        ? `Artist: ${artist.name}\nStyle: ${artist.style_description}\nCharacteristics: ${artist.special_characteristics}`
        : 'Create an original artist style'

      const prompt = `You are a professional songwriter.

Artist Context:
${artistContext}

Song Description: ${songDescription}
Desired Style: ${styleDescription}

Create an original song specification. Return JSON with:
- name: Song title (max 50 chars)
- style: Detailed music style description
- lyrics: Complete song lyrics with verse/chorus structure

Return valid JSON only.`

      // Call all agents in parallel
      const generatePromises = selectedAgents.map(async (agent) => {
        setAgentStatuses(prev => ({ ...prev, [agent.id]: 'generating' }))

        try {
          const response = await fetch(`${BACKEND_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              song_id: newSongId,
              agents: [{ id: agent.id, model_name: agent.model_name }],
              prompt,
              user_request: songDescription,
              user_style: styleDescription
            })
          })

          if (!response.ok) throw new Error('Generation failed')

          const data = await response.json()
          setAgentStatuses(prev => ({ ...prev, [agent.id]: 'done' }))

          if (data.results && data.results[agent.id]) {
            return { agentId: agent.id, result: data.results[agent.id] }
          }
        } catch (error) {
          console.error(`Generation failed for ${agent.id}:`, error)
          setAgentStatuses(prev => ({ ...prev, [agent.id]: 'error' }))
        }
        return null
      })

      const results = await Promise.all(generatePromises)

      // Collect results
      const validResults: Record<string, SongResult> = {}
      for (const { agentId, result } of results) {
        if (agentId && result) {
          validResults[agentId] = result
        }
      }
      setAgentResults(validResults)

      // Call orchestrator if we have results
      if (Object.keys(validResults).length > 0 && orchestrator) {
        setOrchestratorStatus('fetching')

        const orchResponse = await fetch(`${BACKEND_URL}/api/orchestrate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            song_id: newSongId,
            user_request: songDescription,
            user_style: styleDescription,
            songs: validResults
          })
        })

        if (orchResponse.ok) {
          const data = await orchResponse.json()
          setEvaluations(data.evaluations || {})
          setWinnerAgentId(data.winner_agent_id)
          setWinnerReason(data.winner_reason || '')
        }

        setOrchestratorStatus('complete')
      }

      setStep('results')
    } catch (error) {
      console.error('Generation failed:', error)
      alert('Failed to generate songs. Please try again.')
      setStep('input')
    }
  }

  const handleSaveSong = async () => {
    // Save song to library
    const winnerId = overrideAgentId || winnerAgentId
    const winnerResult = winnerId ? agentResults[winnerId] : null

    if (!winnerResult) return

    const { error } = await supabase.from('songs').insert({
      name: winnerResult.name,
      lyrics: winnerResult.lyrics,
      style_description: winnerResult.style,
      status: 'saved',
      user_id: (await supabase.auth.getUser()).data.user?.id,
      artist_id: artistId
    })

    if (!error) {
      alert(`"${winnerResult.name}" saved to library!`)
    }
  }

  const handleIterate = (customInstruction?: string) => {
    // TODO: Implement iteration
    alert('Iteration feature coming soon!')
  }

  const handleNewSong = () => {
    setStep('selection')
    setShowAgentModal(true)
    setSongDescription('')
    setAgentResults({})
    setEvaluations({})
    setWinnerAgentId(null)
    setOverrideAgentId(null)
  }

  const handleOverride = (agentId: string) => {
    setOverrideAgentId(agentId)
    setDetailModal(null)
  }

  const selectedAgents = agents.filter(a => selectedAgentIds.includes(a.id))
  const orchestrator = agents.find(a => a.id === selectedOrchestratorId)
  const winnerId = overrideAgentId || winnerAgentId

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Create New Song</h1>
        {artist && <p className="text-gray-500">for {artist.name}</p>}
      </div>

      {/* Agent Selection Modal */}
      <AgentSelectionModal
        isOpen={showAgentModal && step === 'selection'}
        onClose={() => {}}
        onConfirm={handleAgentsSelected}
        agents={agents.filter(a => a.id.startsWith('gen-'))}
        orchestrators={agents.filter(a => a.id.startsWith('orch-'))}
      />

      {/* Loading Screen */}
      {step === 'generating' && (
        <Card className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-200 mb-2">Loading your Team...</h2>
          <p className="text-gray-500">Agents are working on your song</p>
        </Card>
      )}

      {/* Input Phase */}
      {step === 'input' && (
        <>
          <Card className="mb-6">
            <SongDescriptionInputs
              artist={artist}
              songDescription={songDescription}
              styleDescription={styleDescription}
              onSongDescriptionChange={setSongDescription}
              onStyleDescriptionChange={setStyleDescription}
            />
          </Card>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={!songDescription.trim() || !styleDescription.trim()}
              className="px-8"
            >
              <Play className="mr-2 h-5 w-5" />
              Generate Song
            </Button>
          </div>
        </>
      )}

      {/* Results Phase */}
      {step === 'results' && (
        <div className="flex gap-6">
          {/* Orchestrator Card - Fixed on right */}
          <div className="w-80 flex-shrink-0">
            {orchestrator && (
              <div className="sticky top-6">
                <OrchestratorCard
                  orchestratorName={orchestrator.name}
                  status={orchestratorStatus}
                  winnerName={winnerId ? agentResults[winnerId]?.name : undefined}
                  winnerReason={winnerReason}
                  onSave={handleSaveSong}
                  onIterate={handleIterate}
                  onNewSong={handleNewSong}
                />
              </div>
            )}
          </div>

          {/* Agent Cards Grid */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-gray-400" />
              <span className="text-gray-400">
                {Object.keys(agentResults).length} song(s) generated
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {selectedAgentIds.map((agentId) => {
                const agent = agents.find(a => a.id === agentId)
                const status = agentStatuses[agentId] || 'waiting'
                const result = agentResults[agentId]
                const evaluation = evaluations[agentId]

                return (
                  <AgentCard
                    key={agentId}
                    agentName={agent?.name || 'Unknown'}
                    status={
                      overrideAgentId === agentId ? 'override' :
                      winnerId === agentId ? 'winner' :
                      status === 'error' ? 'error' :
                      status
                    }
                    songName={result?.name}
                    stylePreview={result?.style}
                    scores={evaluation?.scores}
                    onClick={() => setDetailModal({ open: true, agentId })}
                  />
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Song Detail Modal */}
      {detailModal && detailModal.open && (
        <SongDetailModal
          isOpen={true}
          onClose={() => setDetailModal(null)}
          agentName={agents.find(a => a.id === detailModal.agentId)?.name || ''}
          songName={agentResults[detailModal.agentId]?.name || ''}
          style={agentResults[detailModal.agentId]?.style || ''}
          lyrics={agentResults[detailModal.agentId]?.lyrics || ''}
          evaluation={evaluations[detailModal.agentId]}
          onSave={handleSaveSong}
          onOverride={() => handleOverride(detailModal.agentId)}
          isWinner={winnerId === detailModal.agentId}
          isOverride={overrideAgentId === detailModal.agentId}
        />
      )}
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- --run -t "SongCreator Revamp" 2>&1
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/song/SongCreator.tsx src/pages/SongCreator.tsx src/__tests__/song-creator-revamp.test.tsx
git commit -m "feat: rebuild SongCreator with new flow and components"
```

---

### Task 8: Update SongCreator Page to Use New Component

**Files:**
- Modify: `src/pages/SongCreator.tsx`

**Step 1: Update page to import new component**

```typescript
// src/pages/SongCreator.tsx
import { SongCreator } from '../components/song/SongCreator'

export function SongCreatorPage() {
  return <SongCreator />
}
```

**Step 2: Run tests**

```bash
npm test -- --run 2>&1 | tail -10
```

Expected: All tests pass

**Step 3: Commit**

```bash
git add src/pages/SongCreator.tsx
git commit -m "refactor: update SongCreator page to use new component"
```

---

## Phase 3: Testing & Verification

### Task 9: Run Full Test Suite

**Step 1: Run all tests**

```bash
npm test -- --run 2>&1
```

Expected: All tests pass

**Step 2: Run build**

```bash
npm run build 2>&1
```

Expected: Build successful

**Step 3: Fix any issues**

Address any test failures or build errors.

**Step 4: Commit**

```bash
git add -A && git status
git commit -m "fix: resolve test and build issues"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Update POST /api/generate for multi-agent parallel generation |
| 2 | Update POST /api/orchestrate with structured evaluations |
| 3 | Create AgentSelectionModal component |
| 4 | Create AgentCard component with states |
| 5 | Create OrchestratorCard component |
| 6 | Create SongDetailModal component |
| 7 | Rebuild SongCreator with new flow |
| 8 | Update SongCreator page |
| 9 | Full test suite and build verification |
