-- SongMaster Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agents table (seeded by admin, not user-created)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  api_endpoint TEXT NOT NULL,
  model_name TEXT NOT NULL,
  capabilities JSONB DEFAULT '{}',
  cost_per_1k_tokens NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artists table
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  style_description TEXT NOT NULL,
  special_characteristics TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Songs table
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  lyrics TEXT NOT NULL,
  style_description TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'iterating', 'saved', 'completed')),
  iteration_count INTEGER DEFAULT 0,
  selected_generation_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  agent_ids UUID[] DEFAULT '{}',
  max_iterations INTEGER DEFAULT 3,
  use_auto_iterate BOOLEAN DEFAULT false,
  master_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generations table
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  round INTEGER NOT NULL DEFAULT 1,
  output JSONB NOT NULL,
  music_style_score INTEGER CHECK (music_style_score >= 1 AND music_style_score <= 10),
  lyrics_score INTEGER CHECK (lyrics_score >= 1 AND lyrics_score <= 10),
  originality_score INTEGER CHECK (originality_score >= 1 AND originality_score <= 10),
  cohesion_score INTEGER CHECK (cohesion_score >= 1 AND cohesion_score <= 10),
  total_score DECIMAL(3, 2),
  evaluation_status TEXT DEFAULT 'pending' CHECK (evaluation_status IN ('pending', 'evaluated')),
  orchestrator_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update updated_at trigger for songs
CREATE OR REPLACE FUNCTION update_songs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER songs_updated_at
  BEFORE UPDATE ON songs
  FOR EACH ROW
  EXECUTE FUNCTION update_songs_updated_at();

-- Row Level Security Policies
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Artists: users can only see their own
CREATE POLICY "Users can CRUD their own artists" ON artists
  FOR ALL USING (auth.uid() = user_id);

-- Songs: users can only see their own
CREATE POLICY "Users can CRUD their own songs" ON songs
  FOR ALL USING (auth.uid() = user_id);

-- Templates: users can only see their own
CREATE POLICY "Users can CRUD their own templates" ON templates
  FOR ALL USING (auth.uid() = user_id);

-- Agents: read-only for all authenticated users
CREATE POLICY "Authenticated users can read agents" ON agents
  FOR SELECT USING (auth.role() = 'authenticated');

-- Profiles table (extends auth.users with app-specific fields)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, is_admin)
  VALUES (NEW.id, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- System prompts table (admin-editable master prompts)
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

-- Row Level Security Policies for profiles and system_prompts
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_prompts ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles but only update their own
CREATE POLICY "Users can read all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- System prompts: everyone can read, only admins can update
CREATE POLICY "Public can read system prompts" ON system_prompts FOR SELECT USING (true);
CREATE POLICY "Admins can update system prompts" ON system_prompts FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Insert default system prompts
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

-- Seed some default agents (run this separately if needed)
-- INSERT INTO agents (name, provider, api_endpoint, model_name, capabilities) VALUES
-- ('Claude Sonnet 4', 'Anthropic', 'https://api.anthropic.com/v1/messages', 'claude-sonnet-4-20250514', '{"context_window": 200000}'),
-- ('GPT-4o', 'OpenAI', 'https://api.openai.com/v1/chat/completions', 'gpt-4o', '{"context_window": 128000}'),
-- ('Grok 2', 'xAI', 'https://api.x.ai/v1/chat/completions', 'grok-2-1212', '{"context_window": 131072}');

-- To make a user an admin, run:
-- UPDATE profiles SET is_admin = true WHERE id = 'user-uuid-here';
