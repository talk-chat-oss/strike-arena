-- ============================================================================
-- STRIKE ARENA - MIGRATION 0003: MASTER LIGA ONLINE (MODO CARREIRA COMPETITIVO)
-- Instância isolada: strike-arena-db (porta 5433 no deathstar-server)
-- Super-Admin Imune: 80193776-6790-457c-906d-ed45ea16df9f (SPOOKY)
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE public.financial_tx_type AS ENUM (
    'PREMIO_VITORIA',
    'GOL_MARCADO',
    'META_PATROCINADOR',
    'TITULO',
    'SALARIO_PAGO',
    'TRANSFERENCIA',
    'MULTA_PAGA'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.transfer_proposal_status AS ENUM (
    'PENDENTE',
    'ACEITA',
    'RECUSADA',
    'CANCELADA'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.auction_status AS ENUM (
    'ATIVO',
    'ENCERRADO',
    'CANCELADO'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1. Expandir tabela matches com colunas da Master Liga Online
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS home_team_id uuid,
  ADD COLUMN IF NOT EXISTS away_team_id uuid,
  ADD COLUMN IF NOT EXISTS home_goals_scorers jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS away_goals_scorers jsonb DEFAULT '[]'::jsonb;

-- 2. Athletes (Base Global de Jogadores de Futebol)
CREATE TABLE IF NOT EXISTS public.athletes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(120) NOT NULL,
  overall integer NOT NULL DEFAULT 80,
  position varchar(16) NOT NULL,
  age integer NOT NULL DEFAULT 24,
  photo_url text,
  default_team varchar(100) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS athletes_overall_idx ON public.athletes(overall DESC);
CREATE INDEX IF NOT EXISTS athletes_position_idx ON public.athletes(position);

-- 3. ClubTeams (Times dos Usuários na Liga)
CREATE TABLE IF NOT EXISTS public.club_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid REFERENCES public.tournaments(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name varchar(100) NOT NULL,
  acronym varchar(8) NOT NULL,
  badge_url text,
  balance integer NOT NULL DEFAULT 25000000,
  is_delinquent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS club_teams_user_idx ON public.club_teams(user_id);
CREATE INDEX IF NOT EXISTS club_teams_league_idx ON public.club_teams(league_id);

-- 4. Contracts / Roster (Elenco do Clube)
CREATE TABLE IF NOT EXISTS public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_team_id uuid NOT NULL REFERENCES public.club_teams(id) ON DELETE CASCADE,
  athlete_id uuid NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  salary integer NOT NULL DEFAULT 250000,
  buyout_clause integer NOT NULL DEFAULT 2500000,
  acquired_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS contracts_athlete_unique_idx ON public.contracts(athlete_id);
CREATE INDEX IF NOT EXISTS contracts_club_team_idx ON public.contracts(club_team_id);

-- 5. FinancialTransactions (Fluxo de Caixa)
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_team_id uuid NOT NULL REFERENCES public.club_teams(id) ON DELETE CASCADE,
  type public.financial_tx_type NOT NULL,
  amount integer NOT NULL,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS financial_tx_club_idx ON public.financial_transactions(club_team_id, created_at DESC);

-- 6. TransferProposals (Negociações Diretas e Trocas)
CREATE TABLE IF NOT EXISTS public.transfer_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_club_id uuid NOT NULL REFERENCES public.club_teams(id) ON DELETE CASCADE,
  to_club_id uuid NOT NULL REFERENCES public.club_teams(id) ON DELETE CASCADE,
  cash_amount integer NOT NULL DEFAULT 0,
  offered_athlete_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  requested_athlete_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  status public.transfer_proposal_status NOT NULL DEFAULT 'PENDENTE',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transfer_proposals_from_idx ON public.transfer_proposals(from_club_id);
CREATE INDEX IF NOT EXISTS transfer_proposals_to_idx ON public.transfer_proposals(to_club_id);
CREATE INDEX IF NOT EXISTS transfer_proposals_status_idx ON public.transfer_proposals(status);

-- 7. Auctions & AuctionBids (Leilões Abertos com Anti-Sniper)
CREATE TABLE IF NOT EXISTS public.auctions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  seller_club_id uuid REFERENCES public.club_teams(id) ON DELETE SET NULL,
  current_bid integer NOT NULL DEFAULT 1000000,
  current_winning_club_id uuid REFERENCES public.club_teams(id) ON DELETE SET NULL,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  status public.auction_status NOT NULL DEFAULT 'ATIVO',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auctions_status_ends_idx ON public.auctions(status, ends_at);
CREATE INDEX IF NOT EXISTS auctions_athlete_idx ON public.auctions(athlete_id);

CREATE TABLE IF NOT EXISTS public.auction_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id uuid NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  club_team_id uuid NOT NULL REFERENCES public.club_teams(id) ON DELETE CASCADE,
  bid_amount integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auction_bids_auction_idx ON public.auction_bids(auction_id, created_at DESC);

-- 8. HeadToHeadCache (Base do Freguesômetro)
CREATE TABLE IF NOT EXISTS public.head_to_head_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_a_id uuid NOT NULL REFERENCES public.club_teams(id) ON DELETE CASCADE,
  team_b_id uuid NOT NULL REFERENCES public.club_teams(id) ON DELETE CASCADE,
  wins_a integer NOT NULL DEFAULT 0,
  wins_b integer NOT NULL DEFAULT 0,
  draws integer NOT NULL DEFAULT 0,
  goals_a integer NOT NULL DEFAULT 0,
  goals_b integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS h2h_teams_unique_idx ON public.head_to_head_cache(team_a_id, team_b_id);

-- ============================================================================
-- FUNÇÕES TRANSACIONAIS ATÔMICAS (PL/pgSQL COM ROW-LEVEL LOCK FOR UPDATE)
-- ============================================================================

-- A. Multa Rescisória ("Roubo de Jogador") com Lock Pessimista FOR UPDATE
CREATE OR REPLACE FUNCTION public.rpc_pay_buyout_clause(
  p_contract_id uuid,
  p_buyer_club_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_contract public.contracts%ROWTYPE;
  v_buyer public.club_teams%ROWTYPE;
  v_seller public.club_teams%ROWTYPE;
  v_athlete public.athletes%ROWTYPE;
BEGIN
  -- 1. Lockar contrato do atleta
  SELECT * INTO v_contract
  FROM public.contracts
  WHERE id = p_contract_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contrato não encontrado para pagamento de multa rescisória.';
  END IF;

  IF v_contract.club_team_id = p_buyer_club_id THEN
    RAISE EXCEPTION 'Este atleta já pertence ao seu clube.';
  END IF;

  -- 2. Lockar clube comprador e clube vendedor
  SELECT * INTO v_buyer
  FROM public.club_teams
  WHERE id = p_buyer_club_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Clube comprador não encontrado.';
  END IF;

  SELECT * INTO v_seller
  FROM public.club_teams
  WHERE id = v_contract.club_team_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Clube vendedor não encontrado.';
  END IF;

  SELECT * INTO v_athlete
  FROM public.athletes
  WHERE id = v_contract.athlete_id;

  -- 3. Validar saldo livre do comprador
  IF v_buyer.balance < v_contract.buyout_clause THEN
    RAISE EXCEPTION 'Saldo insuficiente! Necessário: $ %, Disponível: $ %',
      v_contract.buyout_clause, v_buyer.balance;
  END IF;

  -- 4. Debitar comprador e creditar vendedor
  UPDATE public.club_teams
  SET balance = balance - v_contract.buyout_clause
  WHERE id = v_buyer.id;

  UPDATE public.club_teams
  SET balance = balance + v_contract.buyout_clause,
      is_delinquent = (balance + v_contract.buyout_clause) < 0
  WHERE id = v_seller.id;

  -- 5. Transferir titularidade do contrato do atleta
  UPDATE public.contracts
  SET club_team_id = v_buyer.id,
      acquired_at = now()
  WHERE id = v_contract.id;

  -- 6. Registrar transações financeiras nas duas pontas
  INSERT INTO public.financial_transactions (club_team_id, type, amount, description)
  VALUES
    (
      v_buyer.id,
      'MULTA_PAGA',
      -v_contract.buyout_clause,
      format('Pagamento de Multa Rescisória: %s (OVR %s) roubado de %s', v_athlete.name, v_athlete.overall, v_seller.name)
    ),
    (
      v_seller.id,
      'MULTA_PAGA',
      v_contract.buyout_clause,
      format('Indenização de Multa Rescisória recebida por %s (pago por %s)', v_athlete.name, v_buyer.name)
    );

  RETURN jsonb_build_object(
    'ok', true,
    'athleteName', v_athlete.name,
    'buyoutPaid', v_contract.buyout_clause,
    'buyerNewBalance', v_buyer.balance - v_contract.buyout_clause,
    'sellerName', v_seller.name
  );
END;
$$;

-- B. Lance de Leilão com Escrow Atômico e Anti-Sniper (+2 minutos se < 2 min)
CREATE OR REPLACE FUNCTION public.rpc_place_auction_bid(
  p_auction_id uuid,
  p_bidder_club_id uuid,
  p_bid_amount integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auction public.auctions%ROWTYPE;
  v_bidder public.club_teams%ROWTYPE;
  v_athlete public.athletes%ROWTYPE;
  v_required_extra integer;
  v_new_ends_at timestamptz;
  v_anti_sniper_triggered boolean := false;
BEGIN
  -- 1. Lockar o leilão para evitar condição de corrida (race condition)
  SELECT * INTO v_auction
  FROM public.auctions
  WHERE id = p_auction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Leilão não encontrado.';
  END IF;

  IF v_auction.status <> 'ATIVO' OR v_auction.ends_at <= now() THEN
    RAISE EXCEPTION 'Este leilão já foi encerrado ou não está ativo.';
  END IF;

  IF p_bid_amount <= v_auction.current_bid THEN
    RAISE EXCEPTION 'O lance ($ %) deve ser estritamente maior que o lance atual ($ %).',
      p_bid_amount, v_auction.current_bid;
  END IF;

  -- 2. Lockar clube licitante
  SELECT * INTO v_bidder
  FROM public.club_teams
  WHERE id = p_bidder_club_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Clube licitante não encontrado.';
  END IF;

  -- Se o licitante já era o líder atual, só precisa cobrir a diferença; caso contrário, precisa do valor cheio
  IF v_auction.current_winning_club_id = p_bidder_club_id THEN
    v_required_extra := p_bid_amount - v_auction.current_bid;
  ELSE
    v_required_extra := p_bid_amount;
  END IF;

  IF v_bidder.balance < v_required_extra THEN
    RAISE EXCEPTION 'Saldo livre insuficiente para bloquear em Escrow! Necessário: $ %, Disponível: $ %',
      v_required_extra, v_bidder.balance;
  END IF;

  -- 3. Estornar valor bloqueado (escrow) do líder anterior derrotado
  IF v_auction.current_winning_club_id IS NOT NULL AND v_auction.current_winning_club_id <> p_bidder_club_id THEN
    UPDATE public.club_teams
    SET balance = balance + v_auction.current_bid
    WHERE id = v_auction.current_winning_club_id;
  END IF;

  -- 4. Bloquear (escrow) saldo do novo líder
  UPDATE public.club_teams
  SET balance = balance - v_required_extra
  WHERE id = p_bidder_club_id;

  -- 5. Regra Anti-Sniper: se faltam 2 minutos ou menos, estender ends_at em +2 minutos
  v_new_ends_at := v_auction.ends_at;
  IF (v_auction.ends_at - now()) <= interval '2 minutes' THEN
    v_new_ends_at := v_auction.ends_at + interval '2 minutes';
    v_anti_sniper_triggered := true;
  END IF;

  -- 6. Atualizar leilão e registrar histórico de lance
  UPDATE public.auctions
  SET current_bid = p_bid_amount,
      current_winning_club_id = p_bidder_club_id,
      ends_at = v_new_ends_at
  WHERE id = p_auction_id;

  INSERT INTO public.auction_bids (auction_id, club_team_id, bid_amount)
  VALUES (p_auction_id, p_bidder_club_id, p_bid_amount);

  SELECT * INTO v_athlete FROM public.athletes WHERE id = v_auction.athlete_id;

  RETURN jsonb_build_object(
    'ok', true,
    'athleteName', v_athlete.name,
    'newBid', p_bid_amount,
    'endsAt', v_new_ends_at,
    'antiSniperTriggered', v_anti_sniper_triggered,
    'bidderNewBalance', v_bidder.balance - v_required_extra
  );
END;
$$;

-- C. Folha Salarial e Encerramento de Ciclo/Temporada
CREATE OR REPLACE FUNCTION public.rpc_process_season_payroll(
  p_club_team_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r_club RECORD;
  v_total_salary integer;
  v_processed_count integer := 0;
  v_delinquent_count integer := 0;
BEGIN
  FOR r_club IN
    SELECT * FROM public.club_teams
    WHERE (p_club_team_id IS NULL OR id = p_club_team_id)
    FOR UPDATE
  LOOP
    SELECT COALESCE(SUM(salary), 0) INTO v_total_salary
    FROM public.contracts
    WHERE club_team_id = r_club.id;

    IF v_total_salary > 0 THEN
      UPDATE public.club_teams
      SET balance = balance - v_total_salary,
          is_delinquent = (balance - v_total_salary) < 0
      WHERE id = r_club.id;

      INSERT INTO public.financial_transactions (club_team_id, type, amount, description)
      VALUES (
        r_club.id,
        'SALARIO_PAGO',
        -v_total_salary,
        format('Débito de Folha Salarial de Fim de Temporada (%s)', r_club.name)
      );

      v_processed_count := v_processed_count + 1;
      IF (r_club.balance - v_total_salary) < 0 THEN
        v_delinquent_count := v_delinquent_count + 1;
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'ok', true,
    'processedClubs', v_processed_count,
    'delinquentClubs', v_delinquent_count
  );
END;
$$;

-- ============================================================================
-- SEED DATA: MASTER LIGA ONLINE (ATLETAS, CLUBES, ELENCOS, LEILÕES E H2H)
-- ============================================================================

-- Inserir 20 Atletas Globais (EA FC 26 / eFootball 2026)
INSERT INTO public.athletes (id, name, overall, position, age, default_team, photo_url)
VALUES
  ('a0000000-0000-4000-8000-000000000001', 'Kylian Mbappé', 92, 'ATA', 26, 'Real Madrid', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Mbappe'),
  ('a0000000-0000-4000-8000-000000000002', 'Erling Haaland', 91, 'ATA', 25, 'Manchester City', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Haaland'),
  ('a0000000-0000-4000-8000-000000000003', 'Vinícius Jr.', 91, 'PE', 25, 'Real Madrid', 'https://api.dicebear.com/9.x/avataaars/svg?seed=ViniJr'),
  ('a0000000-0000-4000-8000-000000000004', 'Jude Bellingham', 90, 'MEI', 22, 'Real Madrid', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Bellingham'),
  ('a0000000-0000-4000-8000-000000000005', 'Rodri Hernández', 91, 'VOL', 29, 'Manchester City', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rodri'),
  ('a0000000-0000-4000-8000-000000000006', 'Lamine Yamal', 88, 'PD', 18, 'FC Barcelona', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Yamal'),
  ('a0000000-0000-4000-8000-000000000007', 'Harry Kane', 90, 'ATA', 32, 'Bayern München', 'https://api.dicebear.com/9.x/avataaars/svg?seed=HarryKane'),
  ('a0000000-0000-4000-8000-000000000008', 'Mohamed Salah', 89, 'PD', 33, 'Liverpool', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Salah'),
  ('a0000000-0000-4000-8000-000000000009', 'Bukayo Saka', 88, 'PD', 24, 'Arsenal', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Saka'),
  ('a0000000-0000-4000-8000-000000000010', 'Federico Valverde', 89, 'MC', 27, 'Real Madrid', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Valverde'),
  ('a0000000-0000-4000-8000-000000000011', 'Virgil van Dijk', 89, 'ZAG', 34, 'Liverpool', 'https://api.dicebear.com/9.x/avataaars/svg?seed=VanDijk'),
  ('a0000000-0000-4000-8000-000000000012', 'William Saliba', 88, 'ZAG', 24, 'Arsenal', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Saliba'),
  ('a0000000-0000-4000-8000-000000000013', 'Thibaut Courtois', 90, 'GOL', 33, 'Real Madrid', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Courtois'),
  ('a0000000-0000-4000-8000-000000000014', 'Alisson Becker', 89, 'GOL', 32, 'Liverpool', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alisson'),
  ('a0000000-0000-4000-8000-000000000015', 'Pedri González', 88, 'MC', 22, 'FC Barcelona', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Pedri'),
  ('a0000000-0000-4000-8000-000000000016', 'Jamal Musiala', 89, 'MEI', 22, 'Bayern München', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Musiala'),
  ('a0000000-0000-4000-8000-000000000017', 'Cole Palmer', 87, 'MEI', 23, 'Chelsea', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Palmer'),
  ('a0000000-0000-4000-8000-000000000018', 'Pedro Guilherme', 84, 'ATA', 28, 'Flamengo', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Pedro9'),
  ('a0000000-0000-4000-8000-000000000019', 'Estêvão Willian', 83, 'PD', 18, 'Palmeiras', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Estevao'),
  ('a0000000-0000-4000-8000-000000000020', 'Florian Wirtz', 89, 'MEI', 22, 'Bayern München', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Wirtz')
ON CONFLICT (id) DO NOTHING;

-- Inserir 4 Clubes da Master Liga Online vinculados aos treinadores reais
INSERT INTO public.club_teams (id, league_id, user_id, name, acronym, badge_url, balance, is_delinquent)
VALUES
  ('c1000000-0000-4000-8000-000000000001', (SELECT id FROM public.tournaments ORDER BY created_at ASC LIMIT 1), '20000000-0000-4000-8000-000000000001', 'Real Madrid', 'RMA', 'Real Madrid', 34500000, false),
  ('c1000000-0000-4000-8000-000000000002', (SELECT id FROM public.tournaments ORDER BY created_at ASC LIMIT 1), '20000000-0000-4000-8000-000000000002', 'Manchester City', 'MCI', 'Manchester City', 28900000, false),
  ('c1000000-0000-4000-8000-000000000003', (SELECT id FROM public.tournaments ORDER BY created_at ASC LIMIT 1), '20000000-0000-4000-8000-000000000003', 'FC Barcelona', 'BAR', 'FC Barcelona', 21400000, false),
  ('c1000000-0000-4000-8000-000000000004', (SELECT id FROM public.tournaments ORDER BY created_at ASC LIMIT 1), '80193776-6790-457c-906d-ed45ea16df9f', 'Bayern München', 'BAY', 'Bayern München', 48000000, false)
ON CONFLICT (id) DO NOTHING;

-- Inserir Contratos (Elenco de cada Clube com Salário e Multa = 10x Salário)
INSERT INTO public.contracts (id, club_team_id, athlete_id, salary, buyout_clause)
VALUES
  -- Real Madrid (ViniJr_FC)
  ('d1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000003', 950000, 9500000),
  ('d1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000004', 820000, 8200000),
  ('d1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000010', 740000, 7400000),
  ('d1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000013', 700000, 7000000),
  -- Manchester City (LucasPro_10)
  ('d1000000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 920000, 9200000),
  ('d1000000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000005', 850000, 8500000),
  ('d1000000-0000-4000-8000-000000000007', 'c1000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000009', 680000, 6800000),
  ('d1000000-0000-4000-8000-000000000008', 'c1000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000012', 640000, 6400000),
  -- FC Barcelona (PedroGoal_9)
  ('d1000000-0000-4000-8000-000000000009', 'c1000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000006', 780000, 7800000),
  ('d1000000-0000-4000-8000-000000000010', 'c1000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000015', 710000, 7100000),
  ('d1000000-0000-4000-8000-000000000011', 'c1000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000018', 450000, 4500000),
  -- Bayern München (SPOOKY ROOT)
  ('d1000000-0000-4000-8000-000000000012', 'c1000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000007', 890000, 8900000),
  ('d1000000-0000-4000-8000-000000000013', 'c1000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000016', 790000, 7900000),
  ('d1000000-0000-4000-8000-000000000014', 'c1000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000011', 750000, 7500000),
  ('d1000000-0000-4000-8000-000000000015', 'c1000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000014', 690000, 6900000)
ON CONFLICT (id) DO NOTHING;

-- Inserir Leilões Ativos (incluindo 1 nos últimos 90s para testar o Anti-Sniper!)
INSERT INTO public.auctions (id, athlete_id, seller_club_id, current_bid, current_winning_club_id, starts_at, ends_at, status)
VALUES
  (
    'e1000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001', -- Kylian Mbappé (OVR 92)
    NULL,
    8500000,
    'c1000000-0000-4000-8000-000000000001',
    now() - interval '2 hours',
    now() + interval '1 hour 15 minutes',
    'ATIVO'
  ),
  (
    'e1000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000008', -- Mohamed Salah (OVR 89)
    NULL,
    5200000,
    'c1000000-0000-4000-8000-000000000002',
    now() - interval '3 hours',
    now() + interval '42 minutes',
    'ATIVO'
  ),
  (
    'e1000000-0000-4000-8000-000000000003',
    'a0000000-0000-4000-8000-000000000020', -- Florian Wirtz (OVR 89)
    NULL,
    4800000,
    'c1000000-0000-4000-8000-000000000004',
    now() - interval '1 hour',
    now() + interval '18 minutes',
    'ATIVO'
  ),
  (
    'e1000000-0000-4000-8000-000000000004',
    'a0000000-0000-4000-8000-000000000017', -- Cole Palmer (OVR 87)
    NULL,
    3400000,
    'c1000000-0000-4000-8000-000000000003',
    now() - interval '45 minutes',
    now() + interval '95 seconds', -- Pronto para acionar Anti-Sniper!
    'ATIVO'
  )
ON CONFLICT (id) DO NOTHING;

-- Inserir Histórico Inicial de Lances
INSERT INTO public.auction_bids (id, auction_id, club_team_id, bid_amount)
VALUES
  ('eb000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', 7800000),
  ('eb000000-0000-4000-8000-000000000002', 'e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 8500000),
  ('eb000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000002', 5200000),
  ('eb000000-0000-4000-8000-000000000004', 'e1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000004', 4800000)
ON CONFLICT (id) DO NOTHING;

-- Inserir Extrato de Transações Financeiras
INSERT INTO public.financial_transactions (id, club_team_id, type, amount, description)
VALUES
  ('f1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'META_PATROCINADOR', 15000000, 'Cota Master de Patrocínio Adidas Season 1'),
  ('f1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001', 'PREMIO_VITORIA', 1500000, 'Prêmio por Vitória na Rodada 1 (3×1 vs Manchester City)'),
  ('f1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000001', 'GOL_MARCADO', 450000, 'Bônus de Artilharia: 3 gols marcados na Rodada 1 ($150K/gol)'),
  ('f1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000002', 'META_PATROCINADOR', 15000000, 'Cota Master de Patrocínio Etihad Season 1'),
  ('f1000000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000004', 'TITULO', 10000000, 'Premiação Supercopa Strike Arena 2026')
ON CONFLICT (id) DO NOTHING;

-- Inserir Propostas de Troca (TransferProposals)
INSERT INTO public.transfer_proposals (id, from_club_id, to_club_id, cash_amount, offered_athlete_ids, requested_athlete_ids, status)
VALUES
  (
    'fa000000-0000-4000-8000-000000000001',
    'c1000000-0000-4000-8000-000000000002', -- Manchester City propõe ao Real Madrid
    'c1000000-0000-4000-8000-000000000001',
    2500000,
    '["a0000000-0000-4000-8000-000000000009"]'::jsonb, -- Bukayo Saka + $2.5M
    '["a0000000-0000-4000-8000-000000000004"]'::jsonb, -- por Jude Bellingham
    'PENDENTE'
  ),
  (
    'fa000000-0000-4000-8000-000000000002',
    'c1000000-0000-4000-8000-000000000003', -- FC Barcelona propõe ao Real Madrid
    'c1000000-0000-4000-8000-000000000001',
    1200000,
    '["a0000000-0000-4000-8000-000000000015"]'::jsonb, -- Pedri + $1.2M
    '["a0000000-0000-4000-8000-000000000010"]'::jsonb, -- por Federico Valverde
    'PENDENTE'
  )
ON CONFLICT (id) DO NOTHING;

-- Inserir Cache Histórico do Freguesômetro (HeadToHeadCache)
INSERT INTO public.head_to_head_cache (id, team_a_id, team_b_id, wins_a, wins_b, draws, goals_a, goals_b)
VALUES
  ('bb000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', 7, 2, 2, 24, 11),
  ('bb000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000003', 5, 4, 3, 18, 16),
  ('bb000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000001', 6, 3, 1, 21, 13),
  ('bb000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000003', 6, 1, 1, 19, 7)
ON CONFLICT (id) DO NOTHING;

-- Garantir permissões no PostgREST para todas as novas tabelas e funções
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
