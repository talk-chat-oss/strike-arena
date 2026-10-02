-- ============================================================================
-- STRIKE ARENA - MIGRATION 0002: AUTH, REGISTRATION & MATCH CHAT
-- Instância isolada: strike-arena-db (porta 5433 no deathstar-server)
-- Super-Admin Imune: 80193776-6790-457c-906d-ed45ea16df9f (SPOOKY)
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS password_hash text DEFAULT 'strike123',
  ADD COLUMN IF NOT EXISTS bio text;

-- Senha padrão para Super-Admin SPOOKY e jogadores de demonstração
UPDATE public.profiles
SET password_hash = 'spooky2026'
WHERE id = '80193776-6790-457c-906d-ed45ea16df9f';

-- Garantir permissões no PostgREST para novas colunas e tabelas
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
