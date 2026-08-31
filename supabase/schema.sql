-- REVO V2 Complete Database Schema
-- Run this in your Supabase SQL Editor if setting up a new project or fixing missing tables.

CREATE TABLE IF NOT EXISTS public.analyses (
    id TEXT PRIMARY KEY,
    owner_id TEXT,
    url TEXT NOT NULL,
    normalized_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    attempt_count INTEGER NOT NULL DEFAULT 1,
    site_title TEXT DEFAULT '',
    site_description TEXT DEFAULT '',
    site_type TEXT DEFAULT 'Web Experience',
    primary_goal TEXT DEFAULT '',
    evidence_data JSONB DEFAULT '{}'::jsonb,
    analysis_data JSONB,
    errors JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_analyses_url ON public.analyses(url);
CREATE INDEX IF NOT EXISTS idx_analyses_normalized_url ON public.analyses(normalized_url);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON public.analyses(status);
CREATE INDEX IF NOT EXISTS idx_analyses_owner_id ON public.analyses(owner_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);

ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read of analyses" ON public.analyses;
CREATE POLICY "Allow public read of analyses"
    ON public.analyses
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow service role full access" ON public.analyses;
CREATE POLICY "Allow service role full access"
    ON public.analyses
    FOR ALL
    USING (true)
    WITH CHECK (true);
