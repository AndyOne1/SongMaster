-- Migration: Add system prompts table and admin role
-- Created: 2026-01-07
-- Run this in Supabase SQL Editor after the main schema

-- Add is_admin column to profiles (creates profiles table if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_admin') THEN
        ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        -- Create profiles table if it doesn't exist
        CREATE TABLE profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            is_admin BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
END $$;

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

-- Enable RLS on system_prompts
ALTER TABLE IF EXISTS system_prompts ENABLE ROW LEVEL SECURITY;

-- Public read policy for system_prompts
CREATE POLICY IF NOT EXISTS "Public can read system prompts"
  ON system_prompts FOR SELECT USING (true);

-- Admin update policy for system_prompts
CREATE POLICY IF NOT EXISTS "Admins can update system prompts"
  ON system_prompts FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Insert default system prompts (won't overwrite if key exists)
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

-- Insert OpenRouter agents (won't overwrite if id exists)
INSERT INTO agents (id, name, provider, api_endpoint, model_name, capabilities, cost_per_1k_tokens, is_active) VALUES
('orch-1', 'GPT-4o Orchestrator', 'OpenRouter', 'https://openrouter.ai/api/v1', 'openai/gpt-4o', '{"context_window": 200000, "max_output": 4000}', 0.01, true),
('orch-2', 'Claude-Sonnet-4 Orchestrator', 'OpenRouter', 'https://openrouter.ai/api/v1', 'claude-sonnet-4', '{"context_window": 200000, "max_output": 4000}', 0.01, true),
('gen-1', 'Xiaomi Mimo v2 Flash', 'OpenRouter', 'https://openrouter.ai/api/v1', 'xiaomi/mimo-v2-flash:free', '{"context_window": 16384, "max_output": 2000}', 0, true),
('gen-2', 'Z-AI GLM-4.7', 'OpenRouter', 'https://openrouter.ai/api/v1', 'z-ai/glm-4.7', '{"context_window": 128000, "max_output": 4000}', 0.005, true),
('gen-3', 'MiniMax M2.1', 'OpenRouter', 'https://openrouter.ai/api/v1', 'minimax/minimax-m2.1', '{"context_window": 32768, "max_output": 4000}', 0.002, true),
('gen-4', 'Google Gemini 3 Flash', 'OpenRouter', 'https://openrouter.ai/api/v1', 'google/gemini-3-flash-preview', '{"context_window": 1048576, "max_output": 4000}', 0.001, true),
('gen-5', 'DeepSeek V3.2', 'OpenRouter', 'https://openrouter.ai/api/v1', 'deepseek/deepseek-v3.2', '{"context_window": 65536, "max_output": 4000}', 0.002, true),
('gen-6', 'xAI Grok 4.1 Fast', 'OpenRouter', 'https://openrouter.ai/api/v1', 'x-ai/grok-4.1-fast', '{"context_window": 131072, "max_output": 4000}', 0.005, true)
ON CONFLICT (id) DO NOTHING;

-- Instructions for making a user an admin:
-- 1. Sign up/login as the user you want to make an admin
-- 2. Run this SQL to make them admin:
--    UPDATE profiles SET is_admin = true WHERE id = 'user-uuid-here';
--
-- Or find their UUID from the auth.users table:
--    SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
