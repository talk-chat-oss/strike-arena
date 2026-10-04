-- ============================================================================
-- MIGRATION: Crédito de 50.000 Strike Coins para Ynui, Sart e SPOOKY
-- ============================================================================

BEGIN;

-- 1. Atualizar saldo dos clubes de Ynui (Liverpool), Sart (Palmeiras) e SPOOKY (Real Madrid)
UPDATE public.club_teams
SET
  balance = balance + 50000,
  is_delinquent = false
WHERE user_id IN (
  'c964fddf-af1d-429e-b19a-ea0cc1bafcf3', -- Ynui
  '2363559b-2a96-4e2c-96e3-5e4c3701fee8', -- Sart
  '80193776-6790-457c-906d-ed45ea16df9f'  -- SPOOKY
);

-- 2. Registrar transações no fluxo de caixa (financial_transactions)
INSERT INTO public.financial_transactions (club_team_id, type, amount, description)
SELECT
  ct.id,
  'RECARGA_ESCUDOS',
  50000,
  'Crédito administrativo Strike Arena: +50.000 Strike Coins'
FROM public.club_teams ct
WHERE ct.user_id IN (
  'c964fddf-af1d-429e-b19a-ea0cc1bafcf3', -- Ynui
  '2363559b-2a96-4e2c-96e3-5e4c3701fee8', -- Sart
  '80193776-6790-457c-906d-ed45ea16df9f'  -- SPOOKY
);

COMMIT;
