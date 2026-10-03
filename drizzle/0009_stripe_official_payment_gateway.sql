-- ============================================================================
-- MIGRATION 0009: STRIPE COMO MEIO DE PAGAMENTO ÚNICO E OFICIAL DA LIGA
-- ============================================================================

-- 1. Definir STRIPE como padrão da coluna payment_method e normalizar histórico
ALTER TABLE public.escudo_purchases
  ALTER COLUMN payment_method SET DEFAULT 'STRIPE';

UPDATE public.escudo_purchases
SET payment_method = 'STRIPE'
WHERE payment_method IS DISTINCT FROM 'STRIPE';

-- 2. RPC Idempotente: Confirmação de Compra de Pacote de Escudos via Stripe Checkout
CREATE OR REPLACE FUNCTION public.rpc_purchase_escudos_package(
  p_club_team_id uuid,
  p_package_id uuid,
  p_payment_method varchar DEFAULT 'STRIPE',
  p_external_ref varchar DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_club public.club_teams%ROWTYPE;
  v_pkg public.escudo_packages%ROWTYPE;
  v_existing public.escudo_purchases%ROWTYPE;
  v_purchase_id uuid;
  v_ref varchar;
BEGIN
  v_ref := COALESCE(NULLIF(trim(p_external_ref), ''), 'STRIPE-' || substr(md5(random()::text), 1, 10));

  -- Idempotência: se esta sessão Stripe (p_external_ref) já foi creditada, retorna sem duplicar saldo
  IF p_external_ref IS NOT NULL AND trim(p_external_ref) <> '' THEN
    SELECT * INTO v_existing
    FROM public.escudo_purchases
    WHERE external_reference = trim(p_external_ref)
      AND payment_status = 'CONFIRMED'
    LIMIT 1;

    IF FOUND THEN
      SELECT * INTO v_club FROM public.club_teams WHERE id = v_existing.club_team_id;
      SELECT * INTO v_pkg FROM public.escudo_packages WHERE id = v_existing.package_id;
      RETURN jsonb_build_object(
        'ok', true,
        'alreadyProcessed', true,
        'purchaseId', v_existing.id,
        'clubName', COALESCE(v_club.name, 'Clube'),
        'packageName', COALESCE(v_pkg.name, 'Pacote de Escudos'),
        'escudosCredited', v_existing.escudos_credited,
        'newBalance', COALESCE(v_club.balance, 0)
      );
    END IF;
  END IF;

  SELECT * INTO v_club FROM public.club_teams WHERE id = p_club_team_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Clube não encontrado para crédito de Escudos.';
  END IF;

  SELECT * INTO v_pkg FROM public.escudo_packages WHERE id = p_package_id AND active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pacote promocional de Escudos não encontrado.';
  END IF;

  -- Creditar Escudos instantaneamente na carteira do clube
  UPDATE public.club_teams
  SET balance = balance + v_pkg.escudos_amount,
      is_delinquent = (balance + v_pkg.escudos_amount) < 0
  WHERE id = v_club.id;

  -- Registrar compra auditável via Stripe
  INSERT INTO public.escudo_purchases (
    club_team_id,
    package_id,
    escudos_credited,
    amount_paid_brl_cents,
    payment_method,
    payment_status,
    external_reference
  ) VALUES (
    v_club.id,
    v_pkg.id,
    v_pkg.escudos_amount,
    v_pkg.price_brl_cents,
    'STRIPE',
    'CONFIRMED',
    v_ref
  ) RETURNING id INTO v_purchase_id;

  -- Registrar no fluxo de caixa do clube
  INSERT INTO public.financial_transactions (club_team_id, type, amount, description)
  VALUES (
    v_club.id,
    'RECARGA_ESCUDOS',
    v_pkg.escudos_amount,
    format('Recarga Stripe confirmada (%s): +%s Escudos creditados (R$ %s)',
      v_pkg.name,
      v_pkg.escudos_amount,
      to_char(v_pkg.price_brl_cents / 100.0, 'FM999G990D00')
    )
  );

  RETURN jsonb_build_object(
    'ok', true,
    'alreadyProcessed', false,
    'purchaseId', v_purchase_id,
    'clubName', v_club.name,
    'packageName', v_pkg.name,
    'escudosCredited', v_pkg.escudos_amount,
    'newBalance', v_club.balance + v_pkg.escudos_amount
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_purchase_escudos_package(uuid, uuid, varchar, varchar) TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
