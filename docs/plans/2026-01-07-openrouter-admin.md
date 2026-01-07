# OpenRouter Integration & Admin Prompts Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate OpenRouter API for multi-model support, add new agents, and implement database-driven master prompts with admin UI for editing.

**Architecture:**
- Add OpenRouter API handler in AgentFactory.ts for unified model access
- Extend Supabase schema with `system_prompts` table for admin-editable prompts
- Add `is_admin` column to track admin users
- Create Settings page section for prompt management (admin only)

**Tech Stack:** React + TypeScript, Supabase (PostgreSQL), OpenRouter API, Vite

---

## Tasks

### Task 1: Add OpenRouter API Key to Environment

**Files:**
- Modify: `.env`
- Modify: `.env.example`

**Step 1: Add OpenRouter key to .env**

```bash
# Append to /home/deck/Desktop/Coding/SongMaster/.worktrees/feature-openrouter-integration/.env
echo "VITE_OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key" >> .env
```

**Step 2: Create .env.example for documentation**

```bash
cat > .env.example << 'EOF'
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# OpenRouter (get key from https://openrouter.ai/keys)
VITE_OPENROUTER_API_KEY=sk-or-v1-...
EOF
```

**Step 3: Verify environment variable works**

```bash
grep "OPENROUTER" .env
```

Expected: `VITE_OPENROUTER_API_KEY=sk-or-v1-...`

---

### Task 2: Add OpenRouter API Call Method to AgentFactory

**Files:**
- Modify: `src/services/ai/AgentFactory.ts`

**Step 1: Add OpenRouter call method**

```typescript
private static async callOpenRouter(agent: Agent, prompt: string): Promise<AgentOutput> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY || ''}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'SongMaster',
    },
    body: JSON.stringify({
      model: agent.model_name,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: agent.capabilities.max_output || 4000,
    }),
  })

  const data = await response.json()
  return this.parseOutput(data.choices?.[0]?.message?.content || '')
}
```

**Step 2: Update generate() switch to use OpenRouter**

```typescript
case 'OpenRouter':
  return this.callOpenRouter(params.agent, prompt)
```

**Step 3: Add error handling for OpenRouter**

```typescript
// In generate() method, add before default case:
case 'OpenRouter':
  if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured')
  }
  return this.callOpenRouter(params.agent, prompt)
```

**Step 4: Run tests to verify**

```bash
npm test -- --run 2>&1 | grep -E "(PASS|FAIL|✓|✗)"
```

Expected: All tests pass

---

### Task 3: Extend Supabase Schema for System Prompts

**Files:**
- Modify: `supabase/schema.sql`

**Step 1: Add system_prompts table**

```sql
-- Add after the templates table definition
CREATE TABLE system_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add admin role column to profiles (after profiles table)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
```

**Step 2: Add RLS policies**

```sql
ALTER TABLE system_prompts ENABLE ROW LEVEL SECURITY;

-- Everyone can read prompts
CREATE POLICY "Allow public read of system prompts"
  ON system_prompts FOR SELECT
  USING (true);

-- Only admins can update prompts
CREATE POLICY "Allow admin update of system prompts"
  ON system_prompts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );
```

**Step 3: Insert default prompts**

```sql
INSERT INTO system_prompts (key, name, content, description) VALUES
('song_generation', 'Song Generation Prompt', 'You are a professional songwriter. Create an original song specification.

# Context
- Artist Style: {artist_context}
- Song Description: {song_description}
- Desired Style: {style_description}

{iteration_feedback}

# Output Format
Return a JSON object with:
- name: Song title (max 50 chars)
- lyrics: Complete song lyrics with verse/chorus structure
- style_description: Detailed music style notes

Create a unique, creative song that matches the description.', 'Default prompt for AI song generation'),
('orchestrator', 'Orchestrator Evaluation Prompt', 'You are an expert music producer. Evaluate these song specifications and score them.

# Songs to Evaluate
{songs}

# Scoring Criteria (1-10 each)
1. Music Style: How well does the style match the request?
2. Lyrics: Quality, coherence, and emotional impact of lyrics
3. Originality: Creative and unique elements
4. Cohesion: How well do lyrics and music style work together?

# Output Format
For each song, provide:
- Individual scores (music_style, lyrics, originality, cohesion)
- Brief feedback explaining the scores
- A final recommendation

Identify the overall best song and explain why.', 'Default orchestrator evaluation prompt');
```

**Step 4: Update schema test**

```bash
# Verify schema changes are valid by running:
npm test -- --run -t "schema" 2>&1
```

---

### Task 4: Create Prompt Service for Database Access

**Files:**
- Create: `src/services/prompts/PromptService.ts`

**Step 1: Create the service**

```typescript
import { supabase } from '../supabase/client'

interface SystemPrompt {
  id: string
  key: string
  name: string
  content: string
  description: string | null
  is_active: boolean
  updated_at: string
}

class PromptService {
  private cache: Record<string, SystemPrompt> = {}
  private cacheExpiry: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  async getPrompt(key: string): Promise<string | null> {
    // Check cache first
    if (this.cache[key] && Date.now() < this.cacheExpiry) {
      return this.cache[key].content
    }

    // Fetch from database
    const { data, error } = await supabase
      .from('system_prompts')
      .select('content')
      .eq('key', key)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return null
    }

    // Update cache
    this.cache[key] = data as SystemPrompt
    this.cacheExpiry = Date.now() + this.CACHE_DURATION

    return data.content
  }

  async getAllPrompts(): Promise<SystemPrompt[]> {
    const { data, error } = await supabase
      .from('system_prompts')
      .select('*')
      .order('key')

    if (error || !data) {
      return []
    }

    return data as SystemPrompt[]
  }

  async updatePrompt(key: string, content: string): Promise<boolean> {
    const { error } = await supabase
      .from('system_prompts')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('key', key)

    if (error) {
      console.error('Failed to update prompt:', error)
      return false
    }

    // Invalidate cache
    delete this.cache[key]
    return true
  }

  clearCache(): void {
    this.cache = {}
    this.cacheExpiry = 0
  }
}

export const promptService = new PromptService()
```

**Step 2: Run tests**

```bash
npm test -- --run -t "prompt" 2>&1 || echo "No prompt tests yet - expected"
```

Expected: No prompt tests exist yet (will create later)

---

### Task 5: Update AgentFactory to Use Database Prompts

**Files:**
- Modify: `src/services/ai/AgentFactory.ts`
- Modify: `src/services/ai/AgentOrchestrator.ts`

**Step 1: Import promptService**

```typescript
import { promptService } from '../prompts/PromptService'
```

**Step 2: Update DEFAULT_PROMPT to use database**

```typescript
// Replace static DEFAULT_PROMPT with dynamic fetch
export class AgentFactory {
  private static defaultPromptTemplate = '' // Empty, will fetch from DB

  static async getDefaultPrompt(): Promise<string> {
    const dbPrompt = await promptService.getPrompt('song_generation')
    if (dbPrompt) return dbPrompt

    // Fallback to hardcoded default
    return `You are a professional songwriter. Create an original song specification.

# Context
- Artist Style: {artist_context}
- Song Description: {song_description}
- Desired Style: {style_description}

{iteration_feedback}

# Output Format
Return a JSON object with:
- name: Song title (max 50 chars)
- lyrics: Complete song lyrics with verse/chorus structure
- style_description: Detailed music style notes

Create a unique, creative song that matches the description.`
  }

  static async createPrompt(params: GenerationParams): Promise<string> {
    const defaultPrompt = await this.getDefaultPrompt()
    let prompt = defaultPrompt
      // ... rest of method unchanged
```

**Step 3: Update AgentOrchestrator similarly**

```typescript
// In src/services/ai/AgentOrchestrator.ts
import { promptService } from '../prompts/PromptService'

export async function orchestrateAndEvaluate(params: OrchestratorParams): Promise<OrchestratorResult> {
  // Fetch orchestrator prompt from database
  const dbPrompt = await promptService.getPrompt('orchestrator')
  let basePrompt = dbPrompt || DEFAULT_ORCHESTRATOR_PROMPT

  // Build songs summary...
  let prompt = basePrompt.replace('{songs}', songsSummary)
  // ... rest unchanged
```

**Step 4: Run tests**

```bash
npm test -- --run 2>&1 | tail -5
```

Expected: All tests pass

---

### Task 6: Add Admin Check to Supabase Client

**Files:**
- Modify: `src/services/supabase/client.ts`

**Step 1: Add admin check function**

```typescript
export async function isAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()

  return data?.is_admin || false
}
```

**Step 2: Add admin check hook**

```typescript
// Create src/hooks/useIsAdmin.ts
import { useState, useEffect } from 'react'
import { isAdmin as checkAdmin } from '../services/supabase/client'

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdmin().then(setIsAdmin).finally(() => setLoading(false))
  }, [])

  return { isAdmin, loading }
}
```

**Step 3: Run tests**

```bash
npm test -- --run 2>&1 | grep -E "(supabase|admin)"
```

Expected: Supabase tests pass

---

### Task 7: Create Master Prompts Settings Section

**Files:**
- Create: `src/components/settings/PromptEditor.tsx`
- Modify: `src/pages/Settings.tsx`

**Step 1: Create PromptEditor component**

```typescript
import { useState, useEffect } from 'react'
import { promptService } from '../../services/prompts/PromptService'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Save, RefreshCw } from 'lucide-react'

interface Prompt {
  id: string
  key: string
  name: string
  content: string
  description: string | null
}

export function PromptEditor({ onRefresh }: { onRefresh?: () => void }) {
  const [prompts, setPrompts] = useState<Prompt[]>([])
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

      {prompts.map((prompt) => (
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
              {saving === prompt.key ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
```

**Step 2: Add to Settings page**

```typescript
// In src/pages/Settings.tsx, add import:
import { PromptEditor } from '../components/settings/PromptEditor'

// Add in the settings sections (only if isAdmin):
{isAdmin && (
  <Card className="mb-6">
    <PromptEditor onRefresh={() => window.location.reload()} />
  </Card>
)}
```

**Step 3: Run tests**

```bash
npm test -- --run 2>&1 | tail -3
```

Expected: All tests pass

---

### Task 8: Add Demo Agents for OpenRouter Models

**Files:**
- Modify: `src/components/song/SongCreator.tsx`

**Step 1: Update demo agents list**

```typescript
const demoAgents: Agent[] = [
  // Orchestrators
  {
    id: 'orch-1',
    name: 'GPT-5.2 Orchestrator',
    provider: 'OpenRouter',
    api_endpoint: 'https://openrouter.ai/api/v1',
    model_name: 'openai/gpt-5.2',
    capabilities: { context_window: 200000, max_output: 4000 },
    cost_per_1k_tokens: 0.01,
    is_active: true,
  },
  {
    id: 'orch-2',
    name: 'Claude-Sonnet-4.5 Orchestrator',
    provider: 'OpenRouter',
    api_endpoint: 'https://openrouter.ai/api/v1',
    model_name: 'anthropic/claude-sonnet-4.5',
    capabilities: { context_window: 200000, max_output: 4000 },
    cost_per_1k_tokens: 0.01,
    is_active: true,
  },
  // Generators
  {
    id: 'gen-1',
    name: 'Xiaomi Mimo v2 Flash',
    provider: 'OpenRouter',
    api_endpoint: 'https://openrouter.ai/api/v1',
    model_name: 'xiaomi/mimo-v2-flash:free',
    capabilities: { context_window: 16384, max_output: 2000 },
    cost_per_1k_tokens: 0,
    is_active: true,
  },
  {
    id: 'gen-2',
    name: 'Z-AI GLM-4.7',
    provider: 'OpenRouter',
    api_endpoint: 'https://openrouter.ai/api/v1',
    model_name: 'z-ai/glm-4.7',
    capabilities: { context_window: 128000, max_output: 4000 },
    cost_per_1k_tokens: 0.005,
    is_active: true,
  },
  {
    id: 'gen-3',
    name: 'MiniMax M2.1',
    provider: 'OpenRouter',
    api_endpoint: 'https://openrouter.ai/api/v1',
    model_name: 'minimax/minimax-m2.1',
    capabilities: { context_window: 32768, max_output: 4000 },
    cost_per_1k_tokens: 0.002,
    is_active: true,
  },
  {
    id: 'gen-4',
    name: 'Google Gemini 3 Flash',
    provider: 'OpenRouter',
    api_endpoint: 'https://openrouter.ai/api/v1',
    model_name: 'google/gemini-3-flash-preview',
    capabilities: { context_window: 1048576, max_output: 4000 },
    cost_per_1k_tokens: 0.001,
    is_active: true,
  },
  {
    id: 'gen-5',
    name: 'DeepSeek V3.2',
    provider: 'OpenRouter',
    api_endpoint: 'https://openrouter.ai/api/v1',
    model_name: 'deepseek/deepseek-v3.2',
    capabilities: { context_window: 65536, max_output: 4000 },
    cost_per_1k_tokens: 0.002,
    is_active: true,
  },
  {
    id: 'gen-6',
    name: 'xAI Grok 4.1 Fast',
    provider: 'OpenRouter',
    api_endpoint: 'https://openrouter.ai/api/v1',
    model_name: 'x-ai/grok-4.1-fast',
    capabilities: { context_window: 131072, max_output: 4000 },
    cost_per_1k_tokens: 0.005,
    is_active: true,
  },
]
```

**Step 2: Run tests**

```bash
npm test -- --run -t "song-creator" 2>&1
```

Expected: All song-creator tests pass

---

### Task 9: Create Migration Script for Database

**Files:**
- Create: `supabase/migrations/001_system_prompts_and_admin.sql`

**Step 1: Create migration file**

```sql
-- Migration: Add system prompts table and admin role
-- Created: 2026-01-07

-- Add is_admin column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create system_prompts table
CREATE TABLE IF NOT EXISTS system_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE system_prompts ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY IF NOT EXISTS "Allow public read of system prompts"
  ON system_prompts FOR SELECT USING (true);

-- Admin update policy
CREATE POLICY IF NOT EXISTS "Allow admin update of system prompts"
  ON system_prompts FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Insert default prompts
INSERT INTO system_prompts (key, name, content, description) VALUES
('song_generation', 'Song Generation Prompt', 'You are a professional songwriter. Create an original song specification.

# Context
- Artist Style: {artist_context}
- Song Description: {song_description}
- Desired Style: {style_description}

{iteration_feedback}

# Output Format
Return a JSON object with:
- name: Song title (max 50 chars)
- lyrics: Complete song lyrics with verse/chorus structure
- style_description: Detailed music style notes

Create a unique, creative song that matches the description.', 'Default prompt for AI song generation'),
('orchestrator', 'Orchestrator Evaluation Prompt', 'You are an expert music producer. Evaluate these song specifications and score them.

# Songs to Evaluate
{songs}

# Scoring Criteria (1-10 each)
1. Music Style: How well does the style match the request?
2. Lyrics: Quality, coherence, and emotional impact of lyrics
3. Originality: Creative and unique elements
4. Cohesion: How well do lyrics and music style work together?

# Output Format
For each song, provide:
- Individual scores (music_style, lyrics, originality, cohesion)
- Brief feedback explaining the scores
- A final recommendation

Identify the overall best song and explain why.', 'Default orchestrator evaluation prompt')
ON CONFLICT (key) DO NOTHING;
```

**Step 2: Run build**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build successful

---

### Task 10: Final Verification and Cleanup

**Files:**
- All modified files

**Step 1: Run full test suite**

```bash
npm test -- --run 2>&1
```

Expected: All 33+ tests pass

**Step 2: Run build**

```bash
npm run build 2>&1
```

Expected: Build successful, dist folder created

**Step 3: Verify env file**

```bash
cat .env | grep -E "SUPABASE|OPENROUTER"
```

Expected: All required env vars present

**Step 4: Commit changes**

```bash
git add -A && git status
```

**Step 5: Create commit**

```bash
git commit -m "feat: add OpenRouter integration with admin prompt management

- Add OpenRouter API support in AgentFactory
- Add system_prompts table for database-driven prompts
- Add is_admin column for role-based access
- Create PromptEditor component for admin UI
- Add demo agents for OpenRouter models
- Add migration script for schema updates"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Add OpenRouter API key to environment |
| 2 | Add OpenRouter call method to AgentFactory |
| 3 | Extend Supabase schema with system_prompts table |
| 4 | Create PromptService for database access |
| 5 | Update AgentFactory/Orchestrator to use DB prompts |
| 6 | Add admin check functions and hook |
| 7 | Create PromptEditor UI component |
| 8 | Add demo agents for OpenRouter models |
| 9 | Create database migration script |
| 10 | Final verification and commit |
