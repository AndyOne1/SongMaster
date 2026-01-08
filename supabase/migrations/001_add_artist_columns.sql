-- Migration: Add artist profile enhancement columns
-- Description: Extends the artists table with comprehensive profile data for the SongMaster app
-- This migration adds 14 new columns to store detailed artist profile information
-- including style preferences, brand identity, agent briefs, and references.

-- Safe migration: Uses IF NOT EXISTS to make it idempotent
-- Run multiple times without errors or duplicate columns

-- Add new columns to the artists table
ALTER TABLE IF EXISTS artists
ADD COLUMN IF NOT EXISTS artist_type TEXT DEFAULT 'Solo Artist',
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS origin_story TEXT,
ADD COLUMN IF NOT EXISTS career_stage TEXT DEFAULT 'Emerging',
ADD COLUMN IF NOT EXISTS musical_dna JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS instrumentation JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS vocal_identity JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS lyrical_identity JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS references_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS suno_guidelines JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS brand_identity JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS agent_brief TEXT,
ADD COLUMN IF NOT EXISTS short_style_summary TEXT;
