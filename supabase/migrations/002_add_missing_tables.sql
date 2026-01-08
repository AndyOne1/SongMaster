-- Run this in Supabase SQL Editor

-- Profiles table (extends auth.users with app-specific fields)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles but only update their own
CREATE POLICY "Users can read all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Templates table (for saving generation templates)
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  agent_ids TEXT[] DEFAULT '{}',
  max_iterations INTEGER DEFAULT 3,
  use_auto_iterate BOOLEAN DEFAULT false,
  master_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Templates: users can only see their own
CREATE POLICY "Users can CRUD their own templates" ON templates
  FOR ALL USING (auth.uid() = user_id);

-- Generations table (for storing individual generation outputs and scores)
-- Note: agent_id is TEXT not UUID because agents table uses text IDs like 'gen-1'
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
  agent_id TEXT NOT NULL,
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

-- Enable RLS on generations
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Generations: users can only see their own (via songs table)
CREATE POLICY "Users can CRUD their own generations" ON generations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM songs WHERE id = song_id AND user_id = auth.uid()
    )
  );
