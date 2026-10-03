-- ============================================================================
-- MIGRATION 0013: PASSE DE LIGA OFICIAL (R$ 30,00 / MÊS)
-- Regra Master League: Só pode jogar torneios quem tiver o Passe de Liga ativo
-- Modelos suportados:
--   1. Assinatura Mensal Recorrente via Stripe (R$ 30,00 / mês)
--   2. Pagamento Mensal via PIX / Avulso (R$ 30,00 com vencimento estipulado de 30 dias)
--   3. Controle de Vencimento estipulado pelo Organizador / Super-Admin
-- ============================================================================

-- 1. Colunas de controle do Passe de Liga em club_teams
ALTER TABLE public.club_teams
  ADD COLUMN IF NOT EXISTS league_pass_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS league_pass_mode varchar(32) NOT NULL DEFAULT 'NONE',
  ADD COLUMN IF NOT EXISTS league_pass_subscription_id varchar(120);

-- 2. Tabela de Auditoria de Pagamentos e Renovações do Passe de Liga
CREATE TABLE IF NOT EXISTS public.league_pass_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_team_id uuid NOT NULL REFERENCES public.club_teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  plan_type varchar(32) NOT NULL DEFAULT 'RECURRING_STRIPE',
  amount_brl_cents integer NOT NULL DEFAULT 3000,
  valid_until timestamptz NOT NULL,
  external_reference varchar(120),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS league_pass_payments_club_idx
  ON public.league_pass_payments(club_team_id);

-- 3. Imunidade Total ao Super-Admin SPOOKY (80193776-6790-457c-906d-ed45ea16df9f)
UPDATE public.club_teams
SET
  league_pass_expires_at = '2099-12-31 23:59:59+00'::timestamptz,
  league_pass_mode = 'ADMIN_GRANTED'
WHERE user_id = '80193776-6790-457c-906d-ed45ea16df9f'::uuid;

-- 4. Inicializar clubes já inscritos em torneios ativos com vencimento de 30 dias
UPDATE public.club_teams
SET
  league_pass_expires_at = now() + interval '30 days',
  league_pass_mode = 'MONTHLY_PIX'
WHERE league_pass_expires_at IS NULL
  AND user_id IN (SELECT DISTINCT user_id FROM public.participants WHERE user_id IS NOT NULL);

-- 5. Função verificadora se o jogador possui Passe de Liga ativo
CREATE OR REPLACE FUNCTION public.fn_has_active_league_pass(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expires_at timestamptz;
BEGIN
  -- Super-Admin SPOOKY possui imunidade total
  IF p_user_id = '80193776-6790-457c-906d-ed45ea16df9f'::uuid THEN
    RETURN true;
  END IF;

  SELECT league_pass_expires_at
  INTO v_expires_at
  FROM public.club_teams
  WHERE user_id = p_user_id
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_expires_at IS NOT NULL AND v_expires_at > now() THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- 6. RPC Atômica e Idempotente para Ativar / Renovar / Estipular Vencimento do Passe de Liga (R$ 30,00)
CREATE OR REPLACE FUNCTION public.rpc_activate_league_pass(
  p_club_team_id uuid,
  p_plan_type varchar DEFAULT 'RECURRING_STRIPE',
  p_external_ref varchar DEFAULT NULL,
  p_custom_expires_at timestamptz DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_club record;
  v_existing_payment record;
  v_new_expires_at timestamptz;
BEGIN
  SELECT * INTO v_club
  FROM public.club_teams
  WHERE id = p_club_team_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Clube não encontrado para ativação do Passe de Liga.';
  END IF;

  -- Idempotência caso venha do Stripe Checkout/Webhook
  IF p_external_ref IS NOT NULL AND length(trim(p_external_ref)) > 0 THEN
    SELECT * INTO v_existing_payment
    FROM public.league_pass_payments
    WHERE external_reference = p_external_ref
    LIMIT 1;

    IF FOUND THEN
      RETURN jsonb_build_object(
        'clubId', v_club.id,
        'clubName', v_club.name,
        'planType', v_club.league_pass_mode,
        'expiresAt', v_club.league_pass_expires_at,
        'alreadyProcessed', true
      );
    END IF;
  END IF;

  -- Estipular vencimento personalizado ou somar +30 dias a partir de hoje/vencimento atual
  IF p_custom_expires_at IS NOT NULL THEN
    v_new_expires_at := p_custom_expires_at;
  ELSE
    v_new_expires_at := GREATEST(COALESCE(v_club.league_pass_expires_at, now()), now()) + interval '30 days';
  END IF;

  UPDATE public.club_teams
  SET
    league_pass_expires_at = v_new_expires_at,
    league_pass_mode = COALESCE(p_plan_type, 'RECURRING_STRIPE'),
    league_pass_subscription_id = COALESCE(p_external_ref, league_pass_subscription_id)
  WHERE id = v_club.id;

  INSERT INTO public.league_pass_payments (
    club_team_id,
    user_id,
    plan_type,
    amount_brl_cents,
    valid_until,
    external_reference,
    notes
  ) VALUES (
    v_club.id,
    v_club.user_id,
    COALESCE(p_plan_type, 'RECURRING_STRIPE'),
    3000,
    v_new_expires_at,
    p_external_ref,
    COALESCE(p_notes, 'Passe de Liga Oficial (R$ 30,00 / mês) ativado com vencimento estipulado.')
  );

  RETURN jsonb_build_object(
    'clubId', v_club.id,
    'clubName', v_club.name,
    'planType', COALESCE(p_plan_type, 'RECURRING_STRIPE'),
    'expiresAt', v_new_expires_at,
    'alreadyProcessed', false
  );
END;
$$;
