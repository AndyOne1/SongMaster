# Song Iteration Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Allow users to iterate on a generated song by passing the orchestrator's evaluation (strengths, weaknesses, recommendations) back to all generator agents for improvement. Users see a save warning before iteration and can choose to save first or proceed without saving.

**Architecture:**
- Add `iteration_context` to the generate API call containing previous evaluation data
- Backend injects evaluation feedback into agent system prompts for iteration rounds
- Frontend shows save warning dialog before iteration, tracks iteration count
- Agents receive both original request AND iteration context to improve upon

**Tech Stack:** React, TypeScript, Supabase, OpenRouter API

---

## Tasks

### Task 1: Add IterationContext type to song.ts

**Files:**
- Modify: `src/types/song.ts`

**Step 1: Add IterationContext interface**

```typescript
export interface IterationContext {
  evaluation: {
    strengths: string[];
    weaknesses: string[];
    recommendations: {
      critical_fixes: string[];
      quick_wins: string[];
      depth_enhancements: string[];
      suno_optimization: string[];
    };
    scores?: {
      music_style: number;
      lyrics: number;
      originality: number;
      cohesion: number;
    };
  };
  original_request: string;
  original_style: string;
  custom_instructions?: string;
  iteration_number: number;
}
```

**Step 2: Commit**

```bash
git add src/types/song.ts
git commit -m "feat: add IterationContext type for song iteration"
```

---

### Task 2: Add SaveWarningDialog component

**Files:**
- Create: `src/components/song/SaveWarningDialog.tsx`

**Step 1: Create the dialog component**

```tsx
import React from 'react';

interface SaveWarningDialogProps {
  isOpen: boolean;
  onSaveAndContinue: () => void;
  onProceedWithoutSaving: () => void;
  onCancel: () => void;
}

export function SaveWarningDialog({
  isOpen,
  onSaveAndContinue,
  onProceedWithoutSaving,
  onCancel,
}: SaveWarningDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold text-white">Song Not Saved</h2>
        </div>

        <p className="text-gray-300 mb-6">
          Iteration will start with this song, but it won&apos;t be saved to your library.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onSaveAndContinue}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Save Song & Continue
          </button>
          <button
            onClick={onProceedWithoutSaving}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Proceed without Saving
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-transparent border border-gray-600 hover:bg-gray-800 text-gray-300 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/song/SaveWarningDialog.tsx
git commit -m "feat: add SaveWarningDialog component"
```

---

### Task 3: Add Iterate button to OrchestratorCard

**Files:**
- Modify: `src/components/song/OrchestratorCard.tsx`

**Step 1: Add iterate prop and button**

```tsx
interface OrchestratorCardProps {
  winner: {
    agent_id: string;
    agent_name: string;
    song_name: string;
    scores?: {
      music_style: number;
      lyrics: number;
      originality: number;
      cohesion: number;
      request_alignment?: number;
      suno_execution_prediction?: number;
    };
    evaluation_data?: DetailedEvaluation;
  };
  onSave: () => void;
  onIterate: () => void;          // NEW
  onNewSong: () => void;
  isGenerating?: boolean;
  iterationCount?: number;        // NEW
}

// In the component, add button before "New Song":
<button
  onClick={onIterate}
  disabled={isGenerating}
  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
>
  {iterationCount > 0 ? `Iterate Again (#${iterationCount})` : 'Iterate'}
</button>
```

**Step 2: Commit**

```bash
git add src/components/song/OrchestratorCard.tsx
git commit -m "feat: add Iterate button to OrchestratorCard"
```

---

### Task 4: Add iteration state to SongCreator

**Files:**
- Modify: `src/components/song/SongCreator.tsx`

**Step 1: Add iteration state variables**

```typescript
// Add near other useState declarations
const [iterationContext, setIterationContext] = useState<IterationContext | null>(null);
const [iterationCount, setIterationCount] = useState(0);
const [showSaveWarning, setShowSaveWarning] = useState(false);
```

**Step 2: Add handleIterate function**

```typescript
const handleIterate = () => {
  const winnerAgentId = currentResults.winner_agent_id;
  const winnerEvaluation = agentEvaluations[winnerAgentId];

  if (!winnerEvaluation) {
    console.error('No evaluation found for winner agent');
    return;
  }

  // Store the iteration context for when user confirms
  setIterationContext({
    evaluation: {
      strengths: winnerEvaluation.strengths || [],
      weaknesses: winnerEvaluation.weaknesses || [],
      recommendations: {
        critical_fixes: (winnerEvaluation.recommendations as any)?.critical_fixes || [],
        quick_wins: (winnerEvaluation.recommendations as any)?.quick_wins || [],
        depth_enhancements: (winnerEvaluation.recommendations as any)?.depth_enhancements || [],
        suno_optimization: (winnerEvaluation.recommendations as any)?.suno_optimization || [],
      },
      scores: winnerEvaluation.scores,
    },
    original_request: request,
    original_style: style,
    custom_instructions: customInstructions || undefined,
    iteration_number: iterationCount + 1,
  });

  setShowSaveWarning(true);
};
```

**Step 3: Add iteration handler functions**

```typescript
const handleSaveAndIterate = async () => {
  setShowSaveWarning(false);
  await handleSaveSong();
  await executeIteration();
};

const handleProceedWithoutSaving = () => {
  setShowSaveWarning(false);
  executeIteration();
};

const executeIteration = async () => {
  if (!iterationContext) return;

  setIsGenerating(true);
  setAgentStatuses(selectedGenerators.map(id => ({ agentId: id, status: 'generating' as const })));

  try {
    const results = await Promise.all(
      selectedGenerators.map(async (agentId) => {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent_id: agentId,
            request: iterationContext.original_request,
            style: iterationContext.original_style,
            custom_instructions: iterationContext.custom_instructions,
            iteration_context: iterationContext,  // NEW: pass iteration context
          }),
        });

        const data = await response.json();
        return { agentId, ...data };
      })
    );

    // Process results
    const newResults: Record<string, AgentOutput> = {};
    results.forEach(r => {
      if (r.success && r.result) {
        newResults[r.agentId] = r.result;
      }
    });

    setAgentOutputs(newResults);

    // Call orchestrator with new results
    const evaluationResponse = await fetch('/api/orchestrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orchestrator_id: selectedOrchestrator,
        user_request: iterationContext.original_request,
        user_style: iterationContext.original_style,
        songs: newResults,
      }),
    });

    const evalData = await evaluationResponse.json();
    setAgentEvaluations(evalData.evaluations);
    setCurrentResults({
      winner_agent_id: evalData.winner_agent_id,
      winner_reason: evalData.winner_reason,
    });

    setIterationCount(prev => prev + 1);
  } catch (error) {
    console.error('Iteration error:', error);
  } finally {
    setIsGenerating(false);
  }
};
```

**Step 4: Add SaveWarningDialog to JSX**

```tsx
<SaveWarningDialog
  isOpen={showSaveWarning}
  onSaveAndContinue={handleSaveAndIterate}
  onProceedWithoutSaving={handleProceedWithoutSaving}
  onCancel={() => setShowSaveWarning(false)}
/>
```

**Step 5: Update OrchestratorCard props**

```tsx
<OrchestratorCard
  winner={{
    agent_id: currentResults.winner_agent_id,
    agent_name: getAgentName(currentResults.winner_agent_id),
    song_name: agentOutputs[currentResults.winner_agent_id]?.name || 'Untitled',
    scores: agentEvaluations[currentResults.winner_agent_id]?.scores,
    evaluation_data: agentEvaluations[currentResults.winner_agent_id],
  }}
  onSave={handleSaveSong}
  onIterate={handleIterate}
  onNewSong={handleNewSong}
  isGenerating={isGenerating}
  iterationCount={iterationCount}
/>
```

**Step 6: Commit**

```bash
git add src/components/song/SongCreator.tsx
git commit -m "feat: add iteration state and handlers to SongCreator"
```

---

### Task 5: Update backend to handle iteration context

**Files:**
- Modify: `server/index.js`

**Step 1: Update /api/generate to accept iteration_context**

```javascript
app.post('/api/generate', async (req, res) => {
  const { agent_id, request, style, custom_instructions, iteration_context } = req.body;

  if (!agent_id || !request || !style) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Fetch agent from database
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agent_id)
      .single();

    if (agentError || !agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Fetch system prompt
    const { data: promptData } = await supabase
      .from('system_prompts')
      .select('prompt_text')
      .eq('agent_id', agent_id)
      .single();

    let systemPrompt = promptData?.prompt_text || getDefaultSystemPrompt(agent_id);

    // Inject iteration context if present
    if (iteration_context) {
      systemPrompt = buildIterationPrompt(systemPrompt, iteration_context);
    }

    // Build user message
    const userMessage = `Please create a song with the following description: "${request}". The song should be in the style of: "${style}".${custom_instructions ? ` Additional instructions: "${custom_instructions}"` : ''}`;

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: agent.model_name,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: agent.capabilities?.max_output || 4096,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const completion = await response.json();
    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'No content in response' });
    }

    // Parse JSON response
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try to salvage incomplete JSON
      parsed = salvageJson(content);
    }

    res.json({
      success: true,
      result: {
        name: parsed.name || 'Untitled',
        lyrics: parsed.lyrics || '',
        style_description: parsed.style_description || '',
      },
    });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

**Step 2: Add buildIterationPrompt helper function**

```javascript
function buildIterationPrompt(basePrompt, iterationContext) {
  const strengths = iterationContext.evaluation.strengths
    .map(s => `- ${s}`)
    .join('\n');

  const weaknesses = iterationContext.evaluation.weaknesses
    .map(w => `- ${w}`)
    .join('\n');

  const criticalFixes = iterationContext.evaluation.recommendations.critical_fixes
    .map(r => `- ${r}`)
    .join('\n');

  const quickWins = iterationContext.evaluation.recommendations.quick_wins
    .map(r => `- ${r}`)
    .join('\n');

  const depthEnhancements = iterationContext.evaluation.recommendations.depth_enhancements
    .map(r => `- ${r}`)
    .join('\n');

  const sunoOptimization = iterationContext.evaluation.recommendations.suno_optimization
    .map(r => `- ${r}`)
    .join('\n');

  return `${basePrompt}

---

## ITERATION CONTEXT (Previous Generation Feedback)

Your previous generation of this song received the following evaluation:

### STRENGTHS (Preserve these):
${strengths}

### WEAKNESSES (Improve these):
${weaknesses}

### RECOMMENDATIONS:

Critical Fixes:
${criticalFixes}

Quick Wins:
${quickWins}

Depth Enhancements:
${depthEnhancements}

Suno Optimization:
${sunoOptimization}

---

## TASK
Improve this song based on the feedback above. Preserve the strengths while addressing the weaknesses and recommendations. The original request was:

**Request:** ${iterationContext.original_request}
**Style:** ${iterationContext.original_style}
${iterationContext.custom_instructions ? `**Custom Instructions:** ${iterationContext.custom_instructions}` : ''}

Iteration #${iterationContext.iteration_number}
`;
}
```

**Step 3: Commit**

```bash
git add server/index.js
git commit -m "feat: add iteration context handling to /api/generate"
```

---

### Task 6: Update SaveSongModal to include iteration data

**Files:**
- Modify: `src/components/song/SaveSongModal.tsx`

**Step 1: Ensure iteration count is passed through**

```typescript
// When saving, include iteration_count and original iteration context
const handleSave = async () => {
  const songData = {
    name: songName,
    lyrics: winnerOutput.lyrics,
    style_description: winnerOutput.style_description,
    status: 'saved',
    selected_generation_id: winnerAgentId,
    evaluation_data: winnerEvaluation,
    winner_agent_id: winnerAgentId,
    winner_reason: currentResults.winner_reason,
    iteration_count: iterationCount,  // NEW
    // Store previous evaluation for reference if needed
    previous_evaluation: iterationContext?.evaluation,  // NEW
  };

  await saveSong(songData);
};
```

**Step 2: Commit**

```bash
git add src/components/song/SaveSongModal.tsx
git commit -m "feat: include iteration data when saving songs"
```

---

### Task 7: Manual testing checklist

**Test the iteration flow:**

1. [ ] Generate a song with 2+ agents
2. [ ] Orchestrator picks a winner with evaluation (strengths, weaknesses, recommendations)
3. [ ] Click "Iterate" button
4. [ ] Verify save warning dialog appears
5. [ ] Click "Proceed without Saving"
6. [ ] Verify all agents regenerate (generating state shown)
7. [ ] Verify new results appear with new scores
8. [ ] Verify orchestrator picks new winner
9. [ ] Click "Iterate" again
10. [ ] Click "Save Song & Continue"
11. [ ] Verify song is saved to library
12. [ ] Verify iteration continues with new generation
13. [ ] Verify custom_instructions are passed to iteration context

**Test iteration prompt content:**

1. [ ] Check server logs to verify iteration context is being injected
2. [ ] Verify agents are using the original request + iteration feedback

**Edge cases:**

1. [ ] No evaluation data (fallback)
2. [ ] Missing recommendations (handle undefined arrays)
3. [ ] Iteration with no custom instructions
4. [ ] Multiple iterations (3+) work correctly

---

### Task 8: Commit final changes

```bash
git status
git diff --stat
git add -A
git commit -m "feat: complete song iteration feature"
```

---

## Summary of Files Changed

| File | Change |
|------|--------|
| `src/types/song.ts` | Add `IterationContext` interface |
| `src/components/song/SaveWarningDialog.tsx` | Create new component |
| `src/components/song/OrchestratorCard.tsx` | Add `onIterate` prop and Iterate button |
| `src/components/song/SongCreator.tsx` | Add iteration state, handlers, integrate dialog |
| `server/index.js` | Add `buildIterationPrompt`, handle `iteration_context` in `/api/generate` |
| `src/components/song/SaveSongModal.tsx` | Pass iteration data when saving |

---

**Plan complete and saved to `docs/plans/2026-01-08-song-iteration-feature.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
