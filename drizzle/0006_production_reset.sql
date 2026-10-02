-- ============================================================================
-- STRIKE ARENA - MIGRATION 0006: PRODUCTION RESET (CLEAN SLATE)
-- Instância isolada: strike-arena-db (porta 5433 no deathstar-server)
-- Super-Admin Imune: 80193776-6790-457c-906d-ed45ea16df9f (SPOOKY)
-- ============================================================================

BEGIN;

-- 1. Limpar todas as tabelas transacionais e de teste
TRUNCATE TABLE
  public.match_messages,
  public.matches,
  public.standings,
  public.participants,
  public.tournament_groups,
  public.tournaments,
  public.teams,
  public.auction_bids,
  public.auctions,
  public.transfer_proposals,
  public.financial_transactions,
  public.escudo_purchases,
  public.head_to_head_cache,
  public.contracts,
  public.club_teams
RESTART IDENTITY CASCADE;

-- 2. Remover todos os perfis de teste, mantendo EXCLUSIVAMENTE o Super-Admin SPOOKY
DELETE FROM public.profiles
WHERE id <> '80193776-6790-457c-906d-ed45ea16df9f';

-- 3. Garantir que o Super-Admin SPOOKY existe e está íntegro com role super_admin
INSERT INTO public.profiles (
  id,
  nickname,
  email,
  role,
  password_hash,
  psn_id,
  ea_id,
  discord_handle
) VALUES (
  '80193776-6790-457c-906d-ed45ea16df9f',
  'SPOOKY',
  'spooky@strikearena.gg',
  'super_admin',
  'spooky2026',
  'SPOOKY_BR99',
  'SPOOKY_ADMIN',
  'spooky#0001'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  nickname = EXCLUDED.nickname,
  email = COALESCE(public.profiles.email, EXCLUDED.email),
  password_hash = COALESCE(public.profiles.password_hash, EXCLUDED.password_hash);

-- 4. Garantir os 3 pacotes oficiais da Loja de Escudos ativos
INSERT INTO public.escudo_packages (id, name, escudos_amount, price_brl_cents, badge_label, is_featured, active)
VALUES
  ('e0000000-0000-4000-8000-000000000001', 'Pacote Tático 200 Escudos', 200, 2000, 'ENTRADA RÁPIDA', false, true),
  ('e0000000-0000-4000-8000-000000000002', 'Pacote Craque 500 Escudos', 500, 3000, 'MAIS VENDIDO • +25% BÔNUS', true, true),
  ('e0000000-0000-4000-8000-000000000003', 'Cofre Galáctico 1000 Escudos', 1000, 5000, 'MELHOR CUSTO-BENEFÍCIO • 2X', false, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  escudos_amount = EXCLUDED.escudos_amount,
  price_brl_cents = EXCLUDED.price_brl_cents,
  badge_label = EXCLUDED.badge_label,
  is_featured = EXCLUDED.is_featured,
  active = EXCLUDED.active;

COMMIT;

NOTIFY pgrst, 'reload schema';
