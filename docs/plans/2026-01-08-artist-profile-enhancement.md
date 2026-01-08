# Artist Profile Enhancement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance the artist system with comprehensive profile data from the new master prompt, add a dedicated Artist Details page, and integrate rich artist data into song generation.

**Architecture:** This implementation extends the existing artist system by:
1. Adding JSON columns to store rich artist profile data (Musical DNA, Suno Guidelines, Brand Identity)
2. **Using the existing `system_prompts` table** (not hardcoding) - fetch the master prompt by key
3. Creating a new Artist Details page for viewing full profiles
4. Updating song generation to leverage new artist fields

**Key Design Decision:** The master prompt is stored in `system_prompts` table with key `artist_generation`. This allows admins to update the prompt without code changes.

**Tech Stack:**
- React 18 + TypeScript + Vite
- Supabase (PostgreSQL) for database
- Express backend for AI orchestration
- Tailwind CSS for styling

---

## Database Schema Changes

### New Artist Columns (add to `supabase/schema.sql`)

```sql
-- Core identity fields
ALTER TABLE artists ADD COLUMN artist_type TEXT DEFAULT 'Solo Artist';
ALTER TABLE artists ADD COLUMN tagline TEXT;
ALTER TABLE artists ADD COLUMN origin_story TEXT;
ALTER TABLE artists ADD COLUMN career_stage TEXT DEFAULT 'Emerging';

-- Musical DNA as JSONB for flexibility
ALTER TABLE artists ADD COLUMN musical_dna JSONB DEFAULT '{}';
ALTER TABLE artists ADD COLUMN instrumentation JSONB DEFAULT '{}';
ALTER TABLE artists ADD COLUMN vocal_identity JSONB DEFAULT '{}';
ALTER TABLE artists ADD COLUMN lyrical_identity JSONB DEFAULT '{}';

-- References and guidelines
ALTER TABLE artists ADD COLUMN references_data JSONB DEFAULT '{}';
ALTER TABLE artists ADD COLUMN suno_guidelines JSONB DEFAULT '{}';
ALTER TABLE artists ADD COLUMN brand_identity JSONB DEFAULT '{}';

-- Quick reference fields
ALTER TABLE artists ADD COLUMN agent_brief TEXT;
ALTER TABLE artists ADD COLUMN short_style_summary TEXT;
```

---

## TypeScript Type Changes

### Update `src/types/artist.ts`

```typescript
export interface Artist {
  id: string
  user_id: string
  name: string
  style_description: string
  special_characteristics: string
  created_at: Date
  // New fields
  artist_type?: string
  tagline?: string
  origin_story?: string
  career_stage?: string
  musical_dna?: {
    core_genre?: string
    signature_sound?: string
    tempo_range?: string
    key_preferences?: string
    production_style?: string
  }
  instrumentation?: {
    primary_instruments?: string[]
    signature_instruments?: string[]
    arrangement_style?: string
    sonic_textures?: string[]
  }
  vocal_identity?: {
    vocal_type?: string
    characteristics?: string
    delivery_style?: string
    production?: string
    signature_techniques?: string[]
  }
  lyrical_identity?: {
    writing_approach?: string
    vocabulary?: string
    rhyme_complexity?: string
    perspective?: string
    core_themes?: string[]
    emotional_palette?: string
    message?: string
  }
  references_data?: {
    sounds_like?: string[]
    influences?: string[]
    era_movement?: string
  }
  suno_guidelines?: {
    default_bpm?: string
    preferred_keys?: string
    standard_instrumentation?: string
    production_approach?: string
    mix_balance?: string
    song_structure?: string
    bridge_usage?: string
    typical_length?: string
    default_vocal_tags?: string[]
    avoid_tags?: string[]
    energy_variation?: string
  }
  brand_identity?: {
    visual_aesthetic?: string
    image?: string
    album_artwork_style?: string
    target_audience?: string
    playlist_placement?: string[]
  }
  agent_brief?: string
  short_style_summary?: string
}
```

---

## Backend Changes

### Update Artist Generation Prompt (`server/services/prompts/PromptService.ts`)

Replace the existing artist generation prompt with the new master prompt. The new prompt is already provided and should be used directly.

### Update Artist API Handler (`server/routes/artist.ts`)

Update the `/api/generate-artist` endpoint to:
1. Pass the new master prompt with user variables (`{artist_type}`, `{desired_style}`)
2. Parse the JSON response into the new data structure
3. Return structured data matching the new Artist type

---

## Frontend Changes

### Step 1: Update ArtistCard

**File:** `src/components/artists/ArtistCard.tsx`

Add display for new fields:
- Artist type badge (Solo Artist, Band, etc.)
- Tagline
- Short style summary
- Career stage indicator

### Step 2: Update ArtistLibrary

**File:** `src/components/artists/ArtistLibrary.tsx`

Update card layout to accommodate new fields. May need to adjust grid sizing.

### Step 3: Create ArtistDetails Page

**File:** `src/pages/ArtistDetails.tsx` (new)

Create a new page that displays:
- Full artist profile with expandable sections
- Musical DNA, Instrumentation, Vocal Identity
- Lyrical Identity and Themes
- Suno Guidelines (important for song creation)
- Brand Identity
- "Create Song with This Artist" button
- Edit/Delete actions

### Step 4: Update Routing

**File:** `src/App.tsx`

Add route for Artist Details:
```tsx
<Route path="/artists/:id" element={<ArtistDetails />} />
```

### Step 5: Update ArtistLibrary Click Behavior

**File:** `src/components/artists/ArtistLibrary.tsx`

Change `onSelectArtist` to navigate to Artist Details page instead of SongCreator.

### Step 6: Update SongCreator to Use New Artist Fields

**File:** `src/components/song/SongCreator.tsx`

When artist is loaded, use the new fields:
- `artist.short_style_summary` for display
- `artist.agent_brief` as part of the generation context
- `artist.suno_guidelines` for default parameters if applicable

### Step 7: Update ArtistWizard

**File:** `src/components/artists/ArtistWizard.tsx`

Update to handle the new response format from the AI generation. Parse JSON and save all new fields.

---

## Testing Strategy

1. **Database:** Verify new columns are added correctly
2. **TypeScript:** Ensure all new fields are typed correctly
3. **Backend:** Test new prompt format and JSON parsing
4. **Frontend:**
   - Artist cards display new fields correctly
   - Artist Details page shows full profile
   - Clicking artist navigates to Details page
   - Create Song button works from Details page
   - Song generation uses new artist fields

---

## Execution Order

1. **Database:** Run migration to add new artist columns
2. **Backend:** Update artist API to fetch prompt from `system_prompts` table
3. **Types:** Update Artist TypeScript interface
4. **ArtistWizard:** Update to parse and save new JSON fields
5. **ArtistCard:** Update display for new fields
6. **ArtistLibrary:** Update navigation to Details page
7. **ArtistDetails:** Create new page
8. **Routing:** Add `/artists/:id` route
9. **SongCreator:** Integrate new artist fields
10. **Test:** End-to-end flow

---

## Tasks (for subagent-driven execution)

### Task 1: Database Migration
Create SQL migration file with ALTER TABLE statements for all new columns.

### Task 2: Update TypeScript Types
Update `src/types/artist.ts` with all new fields.

### Task 3: Backend - Fetch Prompt from Database
Update `server/routes/artist.ts` to:
- Fetch master prompt from `system_prompts` table
- Replace template variables `{artist_type}`, `{desired_style}`
- Parse JSON response into complete Artist structure

### Task 4: ArtistWizard - Handle New Format
Update `src/components/artists/ArtistWizard.tsx` to:
- Parse complete JSON from AI response
- Save all new fields to Supabase

### Task 5: ArtistCard - Update Display
Update `src/components/artists/ArtistCard.tsx` to show:
- Artist type badge
- Tagline
- Short style summary
- Career stage

### Task 6: ArtistLibrary - Update Navigation
Update `src/components/artists/ArtistLibrary.tsx`:
- Change `onSelectArtist` to navigate to `/artists/{id}`

### Task 7: Create ArtistDetails Page
Create `src/pages/ArtistDetails.tsx` with:
- Full profile sections (expandable)
- Musical DNA, Instrumentation, Vocal Identity
- Lyrical Identity and Themes
- Suno Guidelines
- Brand Identity
- Create Song / Edit / Delete buttons

### Task 8: Update Routing
Add route in `src/App.tsx`:
```tsx
<Route path="/artists/:id" element={<ArtistDetails />} />
```

### Task 9: SongCreator Integration
Update `src/components/song/SongCreator.tsx` to:
- Use `artist.agent_brief` in generation context
- Use `artist.short_style_summary` for display

### Task 10: Test End-to-End

---

## Seed Data: Add Artist Generation Prompt to system_prompts

Run this SQL to add the master prompt (use the full prompt from the user's specification):

```sql
INSERT INTO system_prompts (key, name, content, description)
VALUES (
  'artist_generation',
  'Artist Generation Prompt',
  -- PASTE THE FULL MASTER PROMPT HERE
  'You are an expert music industry A&R professional...',
  'Master prompt for generating detailed artist profiles with Musical DNA, Suno Guidelines, and Brand Identity'
)
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content;
```

The backend will fetch this prompt by key when generating artists.

---

## Backend API Change

Instead of hardcoding the prompt, the `/api/generate-artist` endpoint will:

1. Query Supabase: `SELECT content FROM system_prompts WHERE key = 'artist_generation' AND is_active = true`
2. Replace template variables `{artist_type}`, `{desired_style}`
3. Send to AI model
4. Parse JSON response into the new Artist structure

---

## Plan Complete

This plan transforms the artist system from simple name/style descriptions to comprehensive profiles that enable more consistent and higher-quality song generation with detailed Suno v5 guidelines.

**Key Design Decisions:**
- Master prompt stored in `system_prompts` table (not hardcoded)
- All new artist fields stored as JSONB for flexibility
- Artist Details page enables deep profile exploration
- Agent brief and Suno Guidelines integrate with song generation
