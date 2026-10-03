-- ============================================================================
-- MIGRATION 0010: SALDO GLOBAL NA CONTA DO TREINADOR & TROCA LIVRE DE ESCUDO
-- ============================================================================
-- Regra de Negócio Oficial (Alinhamento Líder):
-- 1. O saldo financeiro (Escudos) e o elenco de jogadores (Contratos) pertencem
--    GLOBALMENTE À CONTA DO TREINADOR (ex: YNUI, SPOOKY), e não ficam presos a
--    um time fixo.
-- 2. O treinador pode trocar o Escudo/Uniforme que representa sua conta (ex: sair
--    do Liverpool e mudar para Boca Juniors ou Parma) escolhendo qualquer escudo
--    do catálogo oficial que NÃO esteja em uso por outro treinador.
-- 3. Ao trocar de escudo, o dinheiro global da conta, os jogadores contratados,
--    salários, multas e histórico continuam 100% intactos.
-- ============================================================================

-- 1. RPC: Trocar o Escudo / Uniforme da Conta mantendo Saldo Global e Elenco
CREATE OR REPLACE FUNCTION public.rpc_switch_account_crest(
  p_club_team_id uuid,
  p_new_club_name varchar,
  p_new_acronym varchar DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_account public.club_teams%ROWTYPE;
  v_clean_name varchar;
  v_clean_acronym varchar;
  v_conflict_owner varchar;
  v_old_name varchar;
BEGIN
  v_clean_name := trim(COALESCE(p_new_club_name, ''));
  IF v_clean_name = '' THEN
    RAISE EXCEPTION 'Selecione um escudo válido do catálogo oficial.';
  END IF;

  SELECT * INTO v_account
  FROM public.club_teams
  WHERE id = p_club_team_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conta de treinador não encontrada.';
  END IF;

  v_old_name := v_account.name;

  -- Verificar se outro treinador já está utilizando este escudo
  SELECT COALESCE(p.nickname, 'Outro Treinador')
    INTO v_conflict_owner
  FROM public.club_teams ct
  LEFT JOIN public.profiles p ON p.id = ct.user_id
  WHERE lower(trim(ct.name)) = lower(v_clean_name)
    AND ct.id <> v_account.id
  LIMIT 1;

  IF FOUND THEN
    RAISE EXCEPTION 'O escudo "%" já está sendo utilizado pela conta de %. Escolha um escudo livre!',
      v_clean_name, v_conflict_owner;
  END IF;

  v_clean_acronym := upper(left(regexp_replace(COALESCE(NULLIF(trim(p_new_acronym), ''), v_clean_name), '[^a-zA-Z0-9]', '', 'g'), 3));
  IF length(v_clean_acronym) < 2 THEN
    v_clean_acronym := 'CLB';
  END IF;

  -- Atualizar apenas o Escudo/Uniforme (Nome, Sigla e Brasão), preservando Saldo Global e Jogadores
  UPDATE public.club_teams
  SET name = v_clean_name,
      acronym = v_clean_acronym,
      badge_url = v_clean_name
  WHERE id = v_account.id;

  RETURN jsonb_build_object(
    'ok', true,
    'clubTeamId', v_account.id,
    'oldClubName', v_old_name,
    'newClubName', v_clean_name,
    'newAcronym', v_clean_acronym,
    'balance', v_account.balance
  );
END;
$$;

-- 2. RPC: Garantir que toda Conta de Usuário possua sua Carteira Global + Escudo
CREATE OR REPLACE FUNCTION public.rpc_ensure_user_account_club(
  p_user_id uuid,
  p_nickname varchar DEFAULT 'Treinador',
  p_preferred_crest varchar DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing public.club_teams%ROWTYPE;
  v_candidates text[] := ARRAY[
    'Liverpool', 'Boca Juniors', 'Parma', 'Arsenal', 'Chelsea',
    'Paris Saint-Germain', 'Inter de Milão', 'AC Milan', 'Flamengo',
    'Palmeiras', 'Corinthians', 'São Paulo', 'River Plate',
    'Borussia Dortmund', 'Atlético de Madrid', 'SSC Napoli', 'Juventus'
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
  ) RETURNING id INTO v_new_id;

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

GRANT EXECUTE ON FUNCTION public.rpc_switch_account_crest(uuid, varchar, varchar) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_ensure_user_account_club(uuid, varchar, varchar) TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
