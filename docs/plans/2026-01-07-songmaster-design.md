# SongMaster Design Document

**Date:** 2026-01-07
**Version:** 1.0

## Overview

SongMaster is an AI-powered application that uses multiple agents to collaboratively create song specifications (name, style description, lyrics) that can later be integrated with music generation APIs like Suno.

## Core Features

### 1. Multi-Agent Song Generation
- Multiple AI agents (Claude, GPT-4, Grok, etc.) generate song specifications in parallel
- Orchestrator agent evaluates all generated songs against fixed criteria
- Iteration loop allows agents to refine the best song
- User can override orchestrator's choice manually

### 2. Artist/Band Management
- Create, edit, and delete artists with style profiles
- Artists can be attached to song projects to influence generation
- AI-assisted artist creation with 3 options to choose from

### 3. Template System
- Save agent configurations as reusable templates
- Customizable master prompts for agents and orchestrator
- Settings page for system-wide defaults

## Technology Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js/Express (or Next.js)
- **Database:** Supabase (PostgreSQL + Auth)
- **AI Layer:** Custom lightweight agent orchestration

## Data Model

### users
Supabase authentication table.

### agents
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Display name (e.g., "Claude Sonnet 4") |
| provider | TEXT | Provider name (e.g., "Anthropic", "OpenAI", "xAI") |
| api_endpoint | TEXT | URL for API calls |
| model_name | TEXT | Specific model identifier |
| capabilities | JSONB | Context window, max output, features |
| cost_per_1k_tokens | NUMERIC | Cost tracking |
| is_active | BOOLEAN | Enable/disable provider |

### artists
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| name | TEXT | Artist/Band name |
| style_description | TEXT | Detailed style profile |
| special_characteristics | TEXT | Unique traits, influences |
| created_at | TIMESTAMP | Creation time |

### songs
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| artist_id | UUID | Optional foreign key to artists |
| name | TEXT | Song title |
| lyrics | TEXT | Song lyrics |
| style_description | TEXT | Music style specification |
| status | TEXT | Draft, Iterating, Saved, Completed |
| iteration_count | INTEGER | Current iteration round |
| selected_generation_id | UUID | Reference to chosen generation |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update |

### templates
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| name | TEXT | Template name |
| agent_ids | UUID[] | Array of agent configurations |
| max_iterations | INTEGER | Default max iterations |
| use_auto_iterate | BOOLEAN | Auto-iterate setting |
| master_prompt | TEXT | Custom master prompt override |
| created_at | TIMESTAMP | Creation time |

### generations
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| song_id | UUID | Foreign key to songs |
| agent_id | UUID | Foreign key to agents |
| round | INTEGER | Iteration round number |
| output | JSONB | Full agent output |
| music_style_score | INTEGER | 1-10 score |
| lyrics_score | INTEGER | 1-10 score |
| originality_score | INTEGER | 1-10 score |
| cohesion_score | INTEGER | 1-10 score |
| total_score | DECIMAL | Calculated average |
| evaluation_status | TEXT | Pending, Evaluated |
| orchestrator_feedback | TEXT | Orchestrator's reasoning |
| created_at | TIMESTAMP | Creation time |

## Component Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Layout.tsx
│   ├── artists/
│   │   ├── ArtistLibrary.tsx
│   │   ├── ArtistCard.tsx
│   │   ├── ArtistWizard.tsx
│   │   └── ArtistPreviewModal.tsx
│   ├── song/
│   │   ├── SongCreator.tsx
│   │   ├── AgentSelector.tsx
│   │   ├── AgentTile.tsx
│   │   ├── SongDescriptionInputs.tsx
│   │   └── SaveTemplateModal.tsx
│   ├── generation/
│   │   ├── GenerationView.tsx
│   │   ├── OrchestratorStream.tsx
│   │   ├── AgentOutputTile.tsx
│   │   └── EvaluationResult.tsx
│   ├── results/
│   │   ├── SongDisplay.tsx
│   │   ├── SongComparison.tsx
│   │   └── SaveSongModal.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Modal.tsx
│       └── Toggle.tsx
├── pages/
│   ├── Home.tsx
│   ├── Artists.tsx
│   ├── SongCreator.tsx
│   ├── Library.tsx
│   └── Settings.tsx
├── hooks/
│   ├── useSupabase.ts
│   ├── useAIGeneration.ts
│   └── useStreaming.ts
├── services/
│   ├── ai/
│   │   ├── AgentOrchestrator.ts
│   │   ├── AgentFactory.ts
│   │   └── StreamingHandler.ts
│   └── supabase/
│       ├── client.ts
│       └── queries.ts
├── types/
│   ├── agent.ts
│   ├── artist.ts
│   └── song.ts
└── utils/
    └── helpers.ts
```

## User Flow

### Song Creation Flow

1. **Setup Phase**
   - User toggles: Standalone Song OR Select Artist/Band
   - User adds agents dynamically via "+ Add Agent" buttons
   - User enters song description and style description
   - Optional: Save agent configuration as template

2. **Generation Phase**
   - All agents generate songs in parallel
   - Agent tiles show gray pulsing animation while generating
   - When complete, tiles show "Generating" until evaluation

3. **Evaluation Phase**
   - Orchestrator evaluates each song against fixed criteria:
     - Music Style: 1-10
     - Lyrics: 1-10
     - Originality: 1-10
     - Cohesion: 1-10
   - Scores displayed in tiles with color coding:
     - Red: 1-4
     - Orange: 5-7
     - Green: 8-10
   - Orchestrator selects winner and provides recommendation

4. **Decision Phase (Manual Checkpoint)**
   - User sees all evaluated songs
   - Orchestrator's winner is highlighted
   - User can:
     - Click any agent tile to view full song
     - Override with a different song
     - Save current song
     - Iterate on selected song
     - Add instructions for next iteration

5. **Iteration Loop**
   - Selected song (orchestrator's choice or user override) sent back to all agents
   - Agents refine the song based on feedback
   - Repeat until:
     - User stops and saves
     - Max iterations reached (if auto-iterate enabled)

### Artist Creation Flow

1. **Library View**
   - Empty state: Prompts to create first artist
   - "Create Artist" button at top
   - Library displays artists in Spotify/Apple Music style

2. **Creation Wizard**
   - Two modes: AI Guided OR Manual
   - **AI Guided:**
     - Text input for name/style description
     - "Generate" button sends to selected AI agent
     - Returns 3 options in card style
     - User selects one and saves
   - **Manual:**
     - Form with all required fields
     - Create artist directly

3. **Artist Data Points**
   - Name
   - Style Description
   - Special Characteristics

## UI States

### Agent Tile States

| State | Visual |
|-------|--------|
| Waiting | Gray pulse animation |
| Generating | Gray pulse animation |
| Pending Evaluation | Spinner |
| Evaluated | Shows scores (color-coded) |
| Winner | Green highlight / border |
| Overridden | Blue highlight / "Selected by user" badge |

### Score Color Coding

- 1-4: Red background
- 5-7: Orange background
- 8-10: Green background

## Settings Configuration

- **Default Iteration Mode:** Manual Checkpoint (default) or Auto-Iterate
- **Max Iterations:** Number (e.g., 3)
- **Master Prompts:** Toggle to override defaults
  - Agent Master Prompt (template)
  - Orchestrator Master Prompt (template)
  - Artist Creator Master Prompt (template)

## API Integration

### Supported AI Providers
- Anthropic (Claude)
- OpenAI (GPT-4)
- xAI (Grok)
- Others via extensible agent system

### Streaming
- Real-time streaming of agent outputs to UI
- StreamingHandler service buffers and pipes responses

## Future Extensions

- Suno/Udio API integration for audio generation
- Album management with artwork
- Social features (share songs, collaborate)
- Usage analytics and credit tracking
