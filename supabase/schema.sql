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

-- Seed some default agents (run this separately if needed)
-- INSERT INTO agents (name, provider, api_endpoint, model_name, capabilities) VALUES
-- ('Claude Sonnet 4', 'Anthropic', 'https://api.anthropic.com/v1/messages', 'claude-sonnet-4-20250514', '{"context_window": 200000}'),
-- ('GPT-4o', 'OpenAI', 'https://api.openai.com/v1/chat/completions', 'gpt-4o', '{"context_window": 128000}'),
-- ('Grok 2', 'xAI', 'https://api.x.ai/v1/chat/completions', 'grok-2-1212', '{"context_window": 131072}');
