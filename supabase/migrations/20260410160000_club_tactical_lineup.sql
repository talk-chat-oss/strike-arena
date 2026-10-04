-- Add tactical_lineup JSONB column to club_teams to persist virtual pitch lineups and formations
ALTER TABLE public.club_teams
ADD COLUMN IF NOT EXISTS tactical_lineup JSONB NOT NULL DEFAULT '{}'::jsonb;
