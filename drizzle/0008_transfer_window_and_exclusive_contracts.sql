-- ============================================================================
-- STRIKE ARENA — MIGRATION 0008:
-- 1. EXCLUSIVIDADE ABSOLUTA DE ATLETA POR CLUBE (UNIQUE athlete_id EM contracts)
-- 2. CALENDÁRIO DA JANELA DE TRANSFERÊNCIAS (ABERTURA / FECHAMENTO / TRAVA)
-- 3. PAGAMENTO DE MULTA RESCISÓRIA + CONTRATAÇÃO DE AGENTE LIVRE + TROCA ATÔMICA
-- ============================================================================
SET client_encoding = 'UTF8';

-- 1. Garantir que nenhum jogador jamais possa estar em dois clubes ao mesmo tempo
DELETE FROM public.contracts a
USING public.contracts b
WHERE a.id < b.id AND a.athlete_id = b.athlete_id;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contracts_athlete_id_unique'
  ) THEN
    ALTER TABLE public.contracts
      ADD CONSTRAINT contracts_athlete_id_unique UNIQUE (athlete_id);
  END IF;
END $$;

-- 2. Tabela de Configuração & Calendário da Janela de Transferências
CREATE TABLE IF NOT EXISTS public.transfer_window_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  window_name varchar(120) NOT NULL DEFAULT '1ª Janela Oficial de Transferências & Multas',
  force_status varchar(16) NOT NULL DEFAULT 'AUTO', -- 'AUTO' | 'OPEN' | 'CLOSED'
  opens_at timestamptz NOT NULL DEFAULT (now() - interval '1 hour'),
  closes_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  buyout_enabled boolean NOT NULL DEFAULT true,
  trades_enabled boolean NOT NULL DEFAULT true,
  free_agency_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.transfer_window_settings TO anon;
GRANT ALL PRIVILEGES ON public.transfer_window_settings TO service_role;

INSERT INTO public.transfer_window_settings (
  id, window_name, force_status, opens_at, closes_at, buyout_enabled, trades_enabled, free_agency_enabled
) VALUES (
  1,
  '1ª Janela Oficial de Transferências & Multas',
  'AUTO',
  now() - interval '1 hour',
  now() + interval '7 days',
  true,
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- Função auxiliar para verificar se a Janela de Transferências está aberta no momento
CREATE OR REPLACE FUNCTION public.fn_is_transfer_window_open()
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_cfg public.transfer_window_settings%ROWTYPE;
BEGIN
  SELECT * INTO v_cfg FROM public.transfer_window_settings WHERE id = 1;
  IF NOT FOUND THEN
    RETURN true;
  END IF;

  IF v_cfg.force_status = 'OPEN' THEN
    RETURN true;
  ELSIF v_cfg.force_status = 'CLOSED' THEN
    RETURN false;
  ELSE
    RETURN (now() >= v_cfg.opens_at AND now() <= v_cfg.closes_at);
  END IF;
END;
$$;

-- 3. Atualizar RPC de Pagamento de Multa Rescisória + Transferência Imediata
--    Respeita a Janela de Transferências e garante que o atleta sai de um time e vai para o outro
CREATE OR REPLACE FUNCTION public.rpc_pay_buyout_clause(
  p_contract_id uuid,
  p_buyer_club_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cfg public.transfer_window_settings%ROWTYPE;
  v_contract public.contracts%ROWTYPE;
  v_buyer public.club_teams%ROWTYPE;
  v_seller public.club_teams%ROWTYPE;
  v_athlete public.athletes%ROWTYPE;
BEGIN
  SELECT * INTO v_cfg FROM public.transfer_window_settings WHERE id = 1;

  IF NOT public.fn_is_transfer_window_open() THEN
    RAISE EXCEPTION 'A Janela de Transferências está FECHADA no momento. Os jogadores estão travados em seus clubes até a reabertura da janela.';
  END IF;

  IF v_cfg.id IS NOT NULL AND NOT v_cfg.buyout_enabled THEN
    RAISE EXCEPTION 'O pagamento de Multa Rescisória está temporariamente bloqueado pelo organizador nesta janela.';
  END IF;

  SELECT * INTO v_contract FROM public.contracts WHERE id = p_contract_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contrato não encontrado.';
  END IF;

  IF v_contract.club_team_id = p_buyer_club_id THEN
    RAISE EXCEPTION 'Este atleta já pertence ao seu clube.';
  END IF;

  SELECT * INTO v_buyer FROM public.club_teams WHERE id = p_buyer_club_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Clube comprador não encontrado.';
  END IF;

  SELECT * INTO v_seller FROM public.club_teams WHERE id = v_contract.club_team_id FOR UPDATE;
  SELECT * INTO v_athlete FROM public.athletes WHERE id = v_contract.athlete_id;

  IF v_buyer.balance < v_contract.buyout_clause THEN
    RAISE EXCEPTION 'Saldo insuficiente em Escudos para pagar a multa rescisória de % (Necessário: % Escudos • Seu saldo: % Escudos).',
      v_athlete.name, v_contract.buyout_clause, v_buyer.balance;
  END IF;

  -- 1. Débito à vista do clube comprador
  UPDATE public.club_teams
  SET balance = balance - v_contract.buyout_clause,
      is_delinquent = (balance - v_contract.buyout_clause) < 0
  WHERE id = v_buyer.id;

  -- 2. Crédito imediato no clube vendedor (indenização integral da multa)
  UPDATE public.club_teams
  SET balance = balance + v_contract.buyout_clause,
      is_delinquent = (balance + v_contract.buyout_clause) < 0
  WHERE id = v_seller.id;

  -- 3. Transferência exclusiva: o atleta SAI do clube antigo e VAI para o clube comprador
  UPDATE public.contracts
  SET club_team_id = v_buyer.id,
      acquired_at = now()
  WHERE id = v_contract.id;

  -- 4. Cancelar eventuais propostas pendentes envolvendo este atleta no clube antigo
  UPDATE public.transfer_proposals
  SET status = 'CANCELADA'
  WHERE status = 'PENDENTE'
    AND (
      offered_athlete_ids @> jsonb_build_array(v_athlete.id::text)
      OR requested_athlete_ids @> jsonb_build_array(v_athlete.id::text)
    );

  -- 5. Registro auditável no livro-razão financeiro
  INSERT INTO public.financial_transactions (club_team_id, type, amount, description)
  VALUES
    (v_buyer.id, 'MULTA_PAGA', -v_contract.buyout_clause,
     format('Multa Rescisória paga por %s (transferido do %s) — -%s Escudos', v_athlete.name, v_seller.name, v_contract.buyout_clause)),
    (v_seller.id, 'TRANSFERENCIA', v_contract.buyout_clause,
     format('Multa Rescisória recebida pela saída de %s (adquirido pelo %s) — +%s Escudos', v_athlete.name, v_buyer.name, v_contract.buyout_clause));

  RETURN jsonb_build_object(
    'ok', true,
    'athleteName', v_athlete.name,
    'buyoutPaid', v_contract.buyout_clause,
    'buyerNewBalance', v_buyer.balance - v_contract.buyout_clause,
    'sellerName', v_seller.name
  );
END;
$$;

-- 4. RPC: Contratar Jogador Livre (Sem Clube) com Exclusividade Absoluta
--    Uma vez contratado, o jogador fica travado no clube e NÃO pode ser adicionado em outro time
--    exceto quando a Janela de Transferências estiver aberta (via Multa Rescisória ou Troca).
CREATE OR REPLACE FUNCTION public.rpc_sign_free_agent(
  p_athlete_id uuid,
  p_buyer_club_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cfg public.transfer_window_settings%ROWTYPE;
  v_athlete public.athletes%ROWTYPE;
  v_buyer public.club_teams%ROWTYPE;
  v_existing_club_name varchar;
  v_signing_fee integer;
  v_salary integer;
  v_buyout integer;
BEGIN
  SELECT * INTO v_cfg FROM public.transfer_window_settings WHERE id = 1;

  IF NOT public.fn_is_transfer_window_open() THEN
    RAISE EXCEPTION 'A Janela de Transferências está FECHADA no momento. Contratações só podem ser realizadas com a janela aberta.';
  END IF;

  IF v_cfg.id IS NOT NULL AND NOT v_cfg.free_agency_enabled THEN
    RAISE EXCEPTION 'A contratação direta de atletas livres está desabilitada nesta janela (utilize os Leilões).';
  END IF;

  SELECT * INTO v_athlete FROM public.athletes WHERE id = p_athlete_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Atleta não encontrado no catálogo.';
  END IF;

  -- Verificar se o atleta já pertence a algum clube (Regra: 1 jogador nunca pode estar em 2 times)
  SELECT c.name INTO v_existing_club_name
  FROM public.contracts ct
  JOIN public.club_teams c ON c.id = ct.club_team_id
  WHERE ct.athlete_id = p_athlete_id;

  IF FOUND THEN
    RAISE EXCEPTION 'O atleta % já possui contrato ativo com %! Um jogador não pode estar em dois times. Para contratá-lo na Janela de Transferências, pague a Multa Rescisória ou envie uma Proposta de Transferência.',
      v_athlete.name, v_existing_club_name;
  END IF;

  -- Verificar se o atleta está em leilão ativo/agendado
  IF EXISTS (
    SELECT 1 FROM public.auctions
    WHERE athlete_id = p_athlete_id AND status IN ('ATIVO', 'AGENDADO')
  ) THEN
    RAISE EXCEPTION 'O atleta % está escalado em um Leilão Oficial. Dê seu lance na Central de Leilões!', v_athlete.name;
  END IF;

  SELECT * INTO v_buyer FROM public.club_teams WHERE id = p_buyer_club_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Selecione um clube válido para contratar o atleta.';
  END IF;

  -- Cálculo de passe base e salário proporcional ao Overall em Escudos
  IF v_athlete.overall >= 90 THEN
    v_signing_fee := 220;
    v_salary := 50;
  ELSIF v_athlete.overall >= 87 THEN
    v_signing_fee := 160;
    v_salary := 40;
  ELSIF v_athlete.overall >= 85 THEN
    v_signing_fee := 120;
    v_salary := 32;
  ELSIF v_athlete.overall >= 82 THEN
    v_signing_fee := 85;
    v_salary := 24;
  ELSIF v_athlete.overall >= 80 THEN
    v_signing_fee := 65;
    v_salary := 18;
  ELSE
    v_signing_fee := 45;
    v_salary := 12;
  END IF;

  v_buyout := v_salary * 10;

  IF v_buyer.balance < v_signing_fee THEN
    RAISE EXCEPTION 'Saldo insuficiente em Escudos para contratar % (Passe: % Escudos • Seu saldo: % Escudos).',
      v_athlete.name, v_signing_fee, v_buyer.balance;
  END IF;

  -- Debitar taxa de contratação do clube
  UPDATE public.club_teams
  SET balance = balance - v_signing_fee,
      is_delinquent = (balance - v_signing_fee) < 0
  WHERE id = v_buyer.id;

  -- Criar contrato exclusivo (UNIQUE athlete_id)
  INSERT INTO public.contracts (club_team_id, athlete_id, salary, buyout_clause, acquired_at)
  VALUES (v_buyer.id, v_athlete.id, v_salary, v_buyout, now());

  -- Registrar transação financeira
  INSERT INTO public.financial_transactions (club_team_id, type, amount, description)
  VALUES (
    v_buyer.id,
    'TRANSFERENCIA',
    -v_signing_fee,
    format('Contratação de %s (OVR %s) junto ao Banco da Liga — Passe: -%s Escudos (Multa fixada em %s Escudos)',
      v_athlete.name, v_athlete.overall, v_signing_fee, v_buyout)
  );

  RETURN jsonb_build_object(
    'ok', true,
    'athleteName', v_athlete.name,
    'clubName', v_buyer.name,
    'signingFee', v_signing_fee,
    'salary', v_salary,
    'buyoutClause', v_buyout,
    'newBalance', v_buyer.balance - v_signing_fee
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_is_transfer_window_open() TO anon, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_pay_buyout_clause(uuid, uuid) TO anon, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_sign_free_agent(uuid, uuid) TO anon, service_role;

NOTIFY pgrst, 'reload schema';
