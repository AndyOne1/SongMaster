# SongCreator Revamp Design Document

**Date:** 2026-01-08
**Version:** 1.0

## Overview

Complete redesign of the SongCreator flow to improve UX, add clear agent selection, structured evaluation, and intuitive result display.

## User Flow

### Step 1: Agent Selection Modal
User selects multiple generator agents, then one orchestrator agent.

### Step 2: Input Phase
User enters:
- Song description (what they want the song to be about)
- Style description (musical style target)

### Step 3: Generation
- Loading screen ("Loading your Team...")
- AgentCards appear with live status updates
- Gray pulse during generation
- Green pulse when finished

### Step 4: Orchestrator Evaluation
- OrchestratorCard shows progress phases
- Fetches → Analyzes → Scores → Evaluates → Complete

### Step 5: Results Display
- OrchestratorCard on right side (fixed position)
- AgentCards in grid below
- Each AgentCard shows: Song Name, Style Preview, Score Table
- Winner: Gold pulse animation
- Override: Blue border + "Override by User" badge

### Step 6: Actions
- Save to Library
- Iterate (with optional Custom Instruction toggle)
- Create New Song (reset flow)

## Frontend Components

### AgentCard States
| State | Visual |
|-------|--------|
| Waiting | Gray, agent name only |
| Generating | Gray pulse animation |
| Done | Shows song, green pulse animation |
| Error | Red border, error message |
| Winner | Gold pulse animation |
| Override | Blue border, "Override by User" badge |

### Orchestrator States
| State | Message |
|-------|---------|
| Waiting | Waiting for agents to finish |
| Fetching | Fetching songs from agents... |
| Analyzing | Analyzing songs... |
| Scoring | Scoring songs... |
| Evaluating | Evaluating recommendations... |
| Complete | Shows winner + all evaluations |

## Data Structures

### Agent Output Format
```json
{
  "song_id": "uuid-from-backend",
  "name": "Song Title",
  "style": "Style description",
  "lyrics": "Full lyrics"
}
```

### Orchestrator Evaluation Format
```json
{
  "evaluations": {
    "agent-id-1": {
      "matched_request": "Yes/No + explanation",
      "scores": {
        "music_style": 8,
        "lyrics": 7,
        "originality": 6,
        "cohesion": 8
      },
      "analysis": "Short analysis",
      "evaluation": "Full evaluation",
      "recommendations": "How to improve"
    }
  },
  "winner_agent_id": "agent-id-2",
  "winner_reason": "Why this song won"
}
```

## API Endpoints

### POST /api/generate
Multi-agent batch generation for song creation.

**Request:**
```json
{
  "song_id": "uuid",
  "agents": [
    { "id": "agent-1", "model_name": "..." },
    ...
  ],
  "prompt": "...",
  "user_request": "...",
  "user_style": "..."
}
```

**Response:**
```json
{
  "song_id": "uuid",
  "results": {
    "agent-1": { "name": "...", "style": "...", "lyrics": "..." },
    "agent-2": { "name": "...", "style": "...", "lyrics": "..." }
  }
}
```

### POST /api/generate-artist
Single agent generation for artist creation (unchanged).

## Component Structure

```
src/components/song/
├── SongCreator.tsx          # Main page
├── AgentSelectionModal.tsx  # Agent + orchestrator selection
├── AgentCard.tsx            # Agent result card with states
├── OrchestratorCard.tsx     # Side card with winner + actions
├── SongDetailModal.tsx      # Full song view
└── ScoreTable.tsx           # Reusable scoring display
```

## Layout

```
┌─────────────────────────────────────────────────────┐
│ Header: "Create New Song"                           │
├─────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────┐   │
│ │ ORCHESTRATOR CARD (right side, fixed)         │   │
│ │ - Orchestrator name + status                  │   │
│ │ - Winner badge + Song Name                    │   │
│ │ - Winner reason                               │   │
│ │                                               │   │
│ │ Actions:                                      │   │
│ │ [Save to Library]                             │   │
│ │ [Iterate ▾] + Custom Instruction toggle       │   │
│ │ [Create New Song]                             │   │
│ └───────────────────────────────────────────────┘   │
│                                                     │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐          │
│ │ AGENT 1   │ │ AGENT 2   │ │ AGENT 3   │          │
│ │ Name      │ │ Name      │ │ Name      │          │
│ │ Song Name │ │ Song Name │ │ Song Name │          │
│ │ Style     │ │ Style     │ │ Style     │          │
│ │ Scores    │ │ Scores    │ │ Scores    │          │
│ │ M S O C   │ │ M S O C   │ │ M S O C   │          │
│ │ 8 7 6 8   │ │ 7 6 8 7   │ │ 8 7 6 8   │          │
│ │ [Click]   │ │ [Click]   │ │ [Click]   │          │
│ └───────────┘ └───────────┘ └───────────┘          │
└─────────────────────────────────────────────────────┘
```

## UI Details

### AgentCard Score Table
```
┌─────────────────┐
│ Music Style:  8 │
│ Lyrics:       7 │
│ Originality:  6 │
│ Cohesion:     8 │
└─────────────────┘
```

### SongDetailModal
Shows full song with:
- Song name
- Style description
- Full lyrics
- Orchestrator's evaluation for this song
- Save / Override buttons
