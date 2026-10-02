-- ============================================================================
-- STRIKE ARENA - SUPABASE LOCAL SCHEMA (deathstar-server / supabase-db)
-- Tabelas isoladas com prefixo sa_ no schema public (exposto via Cloudflare Tunnel)
-- Super-Admin Imune: 80193776-6790-457c-906d-ed45ea16df9f (SPOOKY)
-- ============================================================================

DROP TABLE IF EXISTS public.sa_match_messages CASCADE;
DROP TABLE IF EXISTS public.sa_matches CASCADE;
DROP TABLE IF EXISTS public.sa_standings CASCADE;
DROP TABLE IF EXISTS public.sa_participants CASCADE;
DROP TABLE IF EXISTS public.sa_tournament_groups CASCADE;
DROP TABLE IF EXISTS public.sa_tournaments CASCADE;
DROP TABLE IF EXISTS public.sa_teams CASCADE;
DROP TABLE IF EXISTS public.sa_profiles CASCADE;

-- 1. PROFILES
CREATE TABLE public.sa_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname varchar(64) NOT NULL UNIQUE,
  email varchar(255),
  role varchar(24) NOT NULL DEFAULT 'player',
  psn_id varchar(64),
  xbox_gamertag varchar(64),
  ea_id varchar(64),
  konami_id varchar(64),
  discord_handle varchar(64),
  avatar_url text,
  is_super_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. TEAMS
CREATE TABLE public.sa_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  tag varchar(8) NOT NULL,
  logo_url text,
  captain_id uuid NOT NULL REFERENCES public.sa_profiles(id) ON DELETE CASCADE,
  game varchar(24) NOT NULL DEFAULT 'ea_fc',
  platform varchar(24) NOT NULL DEFAULT 'crossplay',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. TOURNAMENTS
CREATE TABLE public.sa_tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(160) NOT NULL,
  slug varchar(180) NOT NULL UNIQUE,
  organizer_id uuid NOT NULL REFERENCES public.sa_profiles(id) ON DELETE RESTRICT,
  format varchar(32) NOT NULL DEFAULT 'groups_playoffs',
  game varchar(24) NOT NULL DEFAULT 'ea_fc',
  platform varchar(24) NOT NULL DEFAULT 'crossplay',
  status varchar(24) NOT NULL DEFAULT 'open',
  max_participants integer NOT NULL DEFAULT 8,
  entry_fee_brl integer NOT NULL DEFAULT 0,
  prize_pool_brl integer NOT NULL DEFAULT 0,
  banner_url text,
  rules_markdown text NOT NULL DEFAULT '',
  starts_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. TOURNAMENT GROUPS
CREATE TABLE public.sa_tournament_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.sa_tournaments(id) ON DELETE CASCADE,
  name varchar(64) NOT NULL,
  code varchar(8) NOT NULL DEFAULT 'A',
  display_order integer NOT NULL DEFAULT 1
);

-- 5. PARTICIPANTS
CREATE TABLE public.sa_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.sa_tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.sa_profiles(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.sa_teams(id) ON DELETE SET NULL,
  group_id uuid REFERENCES public.sa_tournament_groups(id) ON DELETE SET NULL,
  seed integer,
  club_name varchar(100) NOT NULL,
  checkin_status varchar(24) NOT NULL DEFAULT 'pending',
  checked_in_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

-- 6. STANDINGS
CREATE TABLE public.sa_standings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.sa_tournaments(id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.sa_tournament_groups(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL UNIQUE REFERENCES public.sa_participants(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 0,
  matches_played integer NOT NULL DEFAULT 0,
  wins integer NOT NULL DEFAULT 0,
  draws integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  goals_for integer NOT NULL DEFAULT 0,
  goals_against integer NOT NULL DEFAULT 0,
  goal_difference integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. MATCHES
CREATE TABLE public.sa_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.sa_tournaments(id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.sa_tournament_groups(id) ON DELETE SET NULL,
  stage varchar(24) NOT NULL DEFAULT 'group',
  round integer NOT NULL DEFAULT 1,
  bracket_position integer,
  label varchar(64),
  home_participant_id uuid REFERENCES public.sa_participants(id) ON DELETE SET NULL,
  away_participant_id uuid REFERENCES public.sa_participants(id) ON DELETE SET NULL,
  home_score integer,
  away_score integer,
  winner_participant_id uuid REFERENCES public.sa_participants(id) ON DELETE SET NULL,
  proof_url text,
  reported_by_id uuid REFERENCES public.sa_profiles(id) ON DELETE SET NULL,
  notes text,
  status varchar(32) NOT NULL DEFAULT 'scheduled',
  scheduled_at timestamptz,
  played_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. MATCH MESSAGES
CREATE TABLE public.sa_match_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.sa_matches(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.sa_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS & Permissões para PostgREST (anon, authenticated, service_role)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

ALTER TABLE public.sa_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sa_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sa_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sa_tournament_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sa_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sa_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sa_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sa_match_messages ENABLE ROW LEVEL SECURITY;

-- Função Super-Admin Imune (SPOOKY: 80193776-6790-457c-906d-ed45ea16df9f)
CREATE OR REPLACE FUNCTION public.is_sa_super_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT COALESCE(
    check_user_id = '80193776-6790-457c-906d-ed45ea16df9f'::uuid
    OR EXISTS (
      SELECT 1 FROM public.sa_profiles
      WHERE id = check_user_id AND (is_super_admin = TRUE OR role = 'super_admin')
    ),
    FALSE
  );
$$;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'sa_profiles', 'sa_teams', 'sa_tournaments', 'sa_tournament_groups',
    'sa_participants', 'sa_standings', 'sa_matches', 'sa_match_messages'
  ]
  LOOP
    EXECUTE format('CREATE POLICY "public_read_%I" ON public.%I FOR SELECT USING (true);', tbl, tbl);
    EXECUTE format('CREATE POLICY "mvp_write_%I" ON public.%I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
  END LOOP;
END $$;

INSERT INTO public.sa_profiles (id, nickname, email, psn_id, ea_id, role, is_super_admin)
VALUES (
  '80193776-6790-457c-906d-ed45ea16df9f',
  'SPOOKY',
  'spooky@strikearena.gg',
  'SPOOKY_BR_99',
  'SPOOKY_EAFC',
  'super_admin',
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  is_super_admin = TRUE;

NOTIFY pgrst, 'reload schema';
