-- ============================================================================
-- MIGRATION 0012: NOVA ECONOMIA OFICIAL — STRIKER COINS
-- - 200 Striker Coins  -> R$ 10,00 (1000 centavos)
-- - 300 Striker Coins  -> R$ 20,00 (2000 centavos)
-- - 500 Striker Coins  -> R$ 30,00 (3000 centavos)
-- - 1000 Striker Coins -> R$ 50,00 (5000 centavos)
-- - Bônus automático de inscrição: 500 Striker Coins
-- ============================================================================

ALTER TABLE public.club_teams
  ALTER COLUMN balance SET DEFAULT 500;

-- Atualizar os 4 pacotes oficiais na tabela escudo_packages
INSERT INTO public.escudo_packages (
  id,
  name,
  escudos_amount,
  price_brl_cents,
  badge_label,
  is_featured,
  active
) VALUES
  (
    'e0000000-0000-4000-8000-000000000001',
    'Pacote 200 Striker Coins',
    200,
    1000,
    'ENTRADA RÁPIDA',
    false,
    true
  ),
  (
    'e0000000-0000-4000-8000-000000000004',
    'Pacote 300 Striker Coins',
    300,
    2000,
    'INTERMEDIÁRIO',
    false,
    true
  ),
  (
    'e0000000-0000-4000-8000-000000000002',
    'Pacote 500 Striker Coins',
    500,
    3000,
    'MAIS VENDIDO',
    true,
    true
  ),
  (
    'e0000000-0000-4000-8000-000000000003',
    'Pacote 1000 Striker Coins',
    1000,
    5000,
    'PACOTE MÁXIMO',
    false,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  escudos_amount = EXCLUDED.escudos_amount,
  price_brl_cents = EXCLUDED.price_brl_cents,
  badge_label = EXCLUDED.badge_label,
  is_featured = EXCLUDED.is_featured,
  active = EXCLUDED.active;

-- Desativar eventuais pacotes fora dos 4 pacotes oficiais
UPDATE public.escudo_packages
SET active = false
WHERE id NOT IN (
  'e0000000-0000-4000-8000-000000000001',
  'e0000000-0000-4000-8000-000000000004',
  'e0000000-0000-4000-8000-000000000002',
  'e0000000-0000-4000-8000-000000000003'
);

-- Atualizar descrições de transações financeiras para Striker Coins
UPDATE public.financial_transactions
SET description = regexp_replace(description, '(Escudos?|Strike Coins?)', 'Striker Coins', 'gi')
WHERE description ~* '(Escudos?|Strike Coins?)';

-- Garantir que no ato da inscrição (criação de conta/clube) o jogador ganhe 500 Striker Coins + registro no extrato
DROP FUNCTION IF EXISTS public.rpc_ensure_user_account_club(uuid, varchar, varchar);

CREATE OR REPLACE FUNCTION public.rpc_ensure_user_account_club(
  p_user_id uuid,
  p_nickname varchar DEFAULT NULL,
  p_preferred_crest varchar DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing public.club_teams%ROWTYPE;
  v_candidates text[] := ARRAY[
    'Real Madrid', 'Manchester City', 'FC Barcelona', 'Bayern München',
    'Liverpool', 'Arsenal', 'Paris Saint-Germain', 'Inter de Milão',
    'Chelsea', 'AC Milan', 'Juventus', 'Atlético de Madrid',
    'Borussia Dortmund', 'Boca Juniors', 'River Plate', 'Parma',
    'Flamengo', 'Palmeiras', 'Corinthians', 'São Paulo', 'Botafogo'
  ];
  v_chosen_name varchar := NULL;
  v_chosen_acronym varchar := 'CLB';
  v_cand text;
  v_new_id uuid;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'ID de usuário inválido.';
  END IF;

  SELECT * INTO v_existing
  FROM public.club_teams
  WHERE user_id = p_user_id
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'ok', true,
      'created', false,
      'id', v_existing.id,
      'name', v_existing.name,
      'acronym', v_existing.acronym,
      'balance', v_existing.balance
    );
  END IF;

  -- Tentar escudo preferido se informado e livre
  IF p_preferred_crest IS NOT NULL AND trim(p_preferred_crest) <> '' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.club_teams WHERE lower(trim(name)) = lower(trim(p_preferred_crest))
    ) THEN
      v_chosen_name := trim(p_preferred_crest);
    END IF;
  END IF;

  -- Caso contrário, escolher o primeiro escudo livre da lista
  IF v_chosen_name IS NULL THEN
    FOREACH v_cand IN ARRAY v_candidates LOOP
      IF NOT EXISTS (
        SELECT 1 FROM public.club_teams WHERE lower(trim(name)) = lower(v_cand)
      ) THEN
        v_chosen_name := v_cand;
        EXIT;
      END IF;
    END LOOP;
  END IF;

  IF v_chosen_name IS NULL THEN
    v_chosen_name := 'Clube ' || COALESCE(NULLIF(trim(p_nickname), ''), 'Strike');
  END IF;

  v_chosen_acronym := upper(left(regexp_replace(v_chosen_name, '[^a-zA-Z0-9]', '', 'g'), 3));

  INSERT INTO public.club_teams (
    user_id,
    name,
    acronym,
    badge_url,
    balance,
    is_delinquent
  ) VALUES (
    p_user_id,
    v_chosen_name,
    v_chosen_acronym,
    v_chosen_name,
    500,
    false
  )
  RETURNING id INTO v_new_id;

  -- Registrar crédito automático de 500 Striker Coins no ato da inscrição
  INSERT INTO public.financial_transactions (
    club_team_id,
    type,
    amount,
    description
  ) VALUES (
    v_new_id,
    'PREMIO_VITORIA',
    500,
    'Bônus de Inscrição Oficial: +500 Striker Coins creditadas automaticamente.'
  );

  RETURN jsonb_build_object(
    'ok', true,
    'created', true,
    'id', v_new_id,
    'name', v_chosen_name,
    'acronym', v_chosen_acronym,
    'balance', 500
  );
END;
$$;
