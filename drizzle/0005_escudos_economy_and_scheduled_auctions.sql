-- ============================================================================
-- MIGRATION 0005: ECONOMIA FECHADA EM ESCUDOS, LOJA DE PACOTES,
-- LEILÕES AGENDADOS (UPCOMING -> ACTIVE -> ENCERRADO) E VITRINE BOLA PRETA
-- ============================================================================

-- 1. Expandir ENUMS com novos tipos transacionais e status AGENDADO
ALTER TYPE financial_tx_type ADD VALUE IF NOT EXISTS 'RECARGA_ESCUDOS';
ALTER TYPE financial_tx_type ADD VALUE IF NOT EXISTS 'BLOQUEIO_LANCE';
ALTER TYPE financial_tx_type ADD VALUE IF NOT EXISTS 'ESTORNO_LANCE';
ALTER TYPE financial_tx_type ADD VALUE IF NOT EXISTS 'ARREMATE_LEILAO';

ALTER TYPE auction_status ADD VALUE IF NOT EXISTS 'AGENDADO';

-- 2. Adicionar categoria de raridade (ball_type) em athletes
ALTER TABLE athletes
  ADD COLUMN IF NOT EXISTS ball_type varchar(24) NOT NULL DEFAULT 'BOLA_PRETA';

-- 3. Adicionar colunas de configuração de lance mínimo e incremento em auctions
ALTER TABLE auctions
  ADD COLUMN IF NOT EXISTS starting_bid integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS min_increment integer NOT NULL DEFAULT 5;

-- 4. Criar tabelas da Loja de Escudos (escudo_packages e escudo_purchases)
CREATE TABLE IF NOT EXISTS escudo_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  escudos_amount integer NOT NULL,
  price_brl_cents integer NOT NULL,
  badge_label varchar(64),
  is_featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS escudo_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_team_id uuid NOT NULL REFERENCES club_teams(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES escudo_packages(id) ON DELETE RESTRICT,
  escudos_credited integer NOT NULL,
  amount_paid_brl_cents integer NOT NULL,
  payment_method varchar(32) NOT NULL DEFAULT 'PIX',
  payment_status varchar(32) NOT NULL DEFAULT 'CONFIRMED',
  external_reference varchar(120),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS escudo_purchases_club_idx ON escudo_purchases(club_team_id);

GRANT SELECT ON escudo_packages, escudo_purchases TO anon;
GRANT ALL PRIVILEGES ON escudo_packages, escudo_purchases TO service_role;

-- 5. Inserir Pacotes Oficiais de Escudos (200 por R$ 20, 500 por R$ 30, 1000 por R$ 50)
INSERT INTO escudo_packages (id, name, escudos_amount, price_brl_cents, badge_label, is_featured, active)
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

-- 6. Inserir Craques "Bola Preta" adicionais (Messi, Cristiano Ronaldo, Lewandowski, Raphinha) com fotos oficiais
INSERT INTO athletes (id, name, overall, position, age, photo_url, default_team, ball_type)
VALUES
  ('a0000000-0000-4000-8000-000000000021', 'Lionel Messi', 90, 'ATA', 38, '/players/messi.png', 'Inter Miami', 'BOLA_PRETA'),
  ('a0000000-0000-4000-8000-000000000022', 'Cristiano Ronaldo', 89, 'ATA', 40, '/players/ronaldo.png', 'Al-Nassr', 'BOLA_PRETA'),
  ('a0000000-0000-4000-8000-000000000023', 'Robert Lewandowski', 89, 'ATA', 37, '/players/lewandowski.png', 'FC Barcelona', 'BOLA_PRETA'),
  ('a0000000-0000-4000-8000-000000000024', 'Raphinha', 87, 'PE', 28, '/players/raphinha.png', 'FC Barcelona', 'BOLA_PRETA')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  overall = EXCLUDED.overall,
  position = EXCLUDED.position,
  age = EXCLUDED.age,
  photo_url = EXCLUDED.photo_url,
  default_team = EXCLUDED.default_team,
  ball_type = EXCLUDED.ball_type;

-- Atualizar classificação de Bola Preta (OVR >= 85) vs Bola Ouro (OVR < 85)
UPDATE athletes SET ball_type = CASE WHEN overall >= 85 THEN 'BOLA_PRETA' ELSE 'BOLA_OURO' END;

-- 7. Padronizar Saldos dos Clubes, Contratos, Leilões e Transações para a Moeda Oficial ESCUDOS
UPDATE club_teams SET balance = 1250, is_delinquent = false WHERE id = 'c1000000-0000-4000-8000-000000000001';
UPDATE club_teams SET balance = 980,  is_delinquent = false WHERE id = 'c1000000-0000-4000-8000-000000000002';
UPDATE club_teams SET balance = 760,  is_delinquent = false WHERE id = 'c1000000-0000-4000-8000-000000000003';
UPDATE club_teams SET balance = 2400, is_delinquent = false WHERE id = 'c1000000-0000-4000-8000-000000000004';

-- Atualizar salários e multas rescisórias (10x salário) em Escudos por athlete_id
UPDATE contracts SET salary = 55, buyout_clause = 550 WHERE athlete_id = 'a0000000-0000-4000-8000-000000000001'; -- Mbappé
UPDATE contracts SET salary = 50, buyout_clause = 500 WHERE athlete_id = 'a0000000-0000-4000-8000-000000000003'; -- Vinícius Jr.
UPDATE contracts SET salary = 42, buyout_clause = 420 WHERE athlete_id = 'a0000000-0000-4000-8000-000000000010'; -- Valverde
UPDATE contracts SET salary = 38, buyout_clause = 380 WHERE athlete_id = 'a0000000-0000-4000-8000-000000000013'; -- Courtois
UPDATE contracts SET salary = 52, buyout_clause = 520 WHERE athlete_id = 'a0000000-0000-4000-8000-000000000002'; -- Haaland
UPDATE contracts SET salary = 48, buyout_clause = 480 WHERE athlete_id = 'a0000000-0000-4000-8000-000000000005'; -- Rodri
UPDATE contracts SET salary = 36, buyout_clause = 360 WHERE athlete_id = 'a0000000-0000-4000-8000-000000000009'; -- Saka
UPDATE contracts SET salary = 34, buyout_clause = 340 WHERE athlete_id = 'a0000000-0000-4000-8000-000000000012'; -- Saliba
UPDATE contracts SET salary = 45, buyout_clause = 450 WHERE athlete_id = 'a0000000-0000-4000-8000-000000000004'; -- Bellingham
UPDATE contracts SET salary = 35, buyout_clause = 350 WHERE athlete_id = 'a0000000-0000-4000-8000-000000000015'; -- Pedri
UPDATE contracts SET salary = 35, buyout_clause = 350 WHERE athlete_id = 'a0000000-0000-4000-8000-000000000014'; -- Alisson
UPDATE contracts SET salary = 44, buyout_clause = 440 WHERE athlete_id = 'a0000000-0000-4000-8000-000000000007'; -- Kane
UPDATE contracts SET salary = 40, buyout_clause = 400 WHERE athlete_id = 'a0000000-0000-4000-8000-000000000016'; -- Musiala
UPDATE contracts SET salary = 42, buyout_clause = 420 WHERE athlete_id = 'a0000000-0000-4000-8000-000000000011'; -- Van Dijk
UPDATE contracts SET salary = 32, buyout_clause = 320 WHERE athlete_id = 'a0000000-0000-4000-8000-000000000017'; -- Cole Palmer

-- Garantir que qualquer outro contrato fora da escala seja normalizado para Escudos
UPDATE contracts SET salary = 30, buyout_clause = 300 WHERE salary > 1000;

-- Atualizar propostas de transferência para Escudos
UPDATE transfer_proposals SET cash_amount = 45 WHERE cash_amount > 1000;

-- Recriar histórico de transações financeiras em Escudos
TRUNCATE TABLE financial_transactions;
INSERT INTO financial_transactions (club_team_id, type, amount, description, created_at) VALUES
  ('c1000000-0000-4000-8000-000000000001', 'RECARGA_ESCUDOS', 500, 'Recarga confirmada via Loja Oficial: Pacote Craque (+500 Escudos)', now() - interval '4 days'),
  ('c1000000-0000-4000-8000-000000000001', 'PREMIO_VITORIA', 40, 'Vitória na Rodada 1 da Master Liga (3x1 vs Manchester City)', now() - interval '3 days'),
  ('c1000000-0000-4000-8000-000000000001', 'GOL_MARCADO', 15, 'Bônus de Artilharia: 3 gols marcados (Mbappé 2x, Vinícius Jr. 1x)', now() - interval '3 days'),
  ('c1000000-0000-4000-8000-000000000001', 'SALARIO_PAGO', -185, 'Pagamento da Folha Salarial da Semana 1 (4 atletas)', now() - interval '1 day'),
  ('c1000000-0000-4000-8000-000000000002', 'META_PATROCINADOR', 300, 'Bônus de Patrocinador Master de Abertura de Temporada', now() - interval '4 days'),
  ('c1000000-0000-4000-8000-000000000002', 'GOL_MARCADO', 5, 'Bônus de Artilharia: 1 gol marcado (Haaland)', now() - interval '3 days'),
  ('c1000000-0000-4000-8000-000000000003', 'RECARGA_ESCUDOS', 200, 'Recarga confirmada via Loja Oficial: Pacote Tático (+200 Escudos)', now() - interval '2 days'),
  ('c1000000-0000-4000-8000-000000000004', 'RECARGA_ESCUDOS', 1000, 'Recarga confirmada via Loja Oficial: Cofre Galáctico (+1000 Escudos)', now() - interval '2 days');

-- 8. Recriar Leilões com as 3 Abas:
--    - PRÓXIMOS LEILÕES (AGENDADO): Messi, Cristiano Ronaldo, Lewandowski
--    - EM ANDAMENTO (ATIVO): Lamine Yamal (Anti-Sniper), Raphinha, Mohamed Salah
--    - FINALIZADOS (ENCERRADO): Florian Wirtz, Estêvão Willian
TRUNCATE TABLE auction_bids CASCADE;
TRUNCATE TABLE auctions CASCADE;

INSERT INTO auctions (
  id,
  athlete_id,
  seller_club_id,
  starting_bid,
  current_bid,
  min_increment,
  current_winning_club_id,
  starts_at,
  ends_at,
  status
) VALUES
  -- EM ANDAMENTO (ATIVO)
  (
    'b2000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000006', -- Lamine Yamal (OVR 88, Bola Preta)
    NULL,
    100,
    115,
    5,
    'c1000000-0000-4000-8000-000000000003',
    now() - interval '30 minutes',
    now() + interval '1 minute 45 seconds', -- Janela Anti-Sniper ativa
    'ATIVO'
  ),
  (
    'b2000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000024', -- Raphinha (OVR 87, Bola Preta)
    NULL,
    100,
    110,
    5,
    'c1000000-0000-4000-8000-000000000001',
    now() - interval '20 minutes',
    now() + interval '32 minutes',
    'ATIVO'
  ),
  (
    'b2000000-0000-4000-8000-000000000003',
    'a0000000-0000-4000-8000-000000000008', -- Mohamed Salah (OVR 89, Bola Preta)
    NULL,
    100,
    125,
    5,
    'c1000000-0000-4000-8000-000000000004',
    now() - interval '15 minutes',
    now() + interval '54 minutes',
    'ATIVO'
  ),

  -- PRÓXIMOS LEILÕES AGENDADOS (AGENDADO / UPCOMING) - VITRINE BOLA PRETA
  (
    'b2000000-0000-4000-8000-000000000004',
    'a0000000-0000-4000-8000-000000000021', -- Lionel Messi (OVR 90, Bola Preta)
    NULL,
    150,
    150,
    5,
    NULL,
    now() + interval '2 hours',
    now() + interval '4 hours',
    'AGENDADO'
  ),
  (
    'b2000000-0000-4000-8000-000000000005',
    'a0000000-0000-4000-8000-000000000022', -- Cristiano Ronaldo (OVR 89, Bola Preta)
    NULL,
    140,
    140,
    5,
    NULL,
    now() + interval '5 hours',
    now() + interval '7 hours',
    'AGENDADO'
  ),
  (
    'b2000000-0000-4000-8000-000000000006',
    'a0000000-0000-4000-8000-000000000023', -- Robert Lewandowski (OVR 89, Bola Preta)
    NULL,
    120,
    120,
    5,
    NULL,
    now() + interval '1 day',
    now() + interval '1 day 2 hours',
    'AGENDADO'
  ),

  -- FINALIZADOS (ENCERRADO) - HISTÓRICO DE ARREMATES
  (
    'b2000000-0000-4000-8000-000000000007',
    'a0000000-0000-4000-8000-000000000020', -- Florian Wirtz (OVR 89, Bola Preta)
    NULL,
    100,
    165,
    5,
    'c1000000-0000-4000-8000-000000000004',
    now() - interval '1 day 3 hours',
    now() - interval '1 day',
    'ENCERRADO'
  ),
  (
    'b2000000-0000-4000-8000-000000000008',
    'a0000000-0000-4000-8000-000000000018', -- Pedro Guilherme (OVR 84, Bola Ouro)
    NULL,
    80,
    110,
    5,
    'c1000000-0000-4000-8000-000000000002',
    now() - interval '2 days 2 hours',
    now() - interval '2 days',
    'ENCERRADO'
  );

-- Histórico de Lances (de 5 em 5 Escudos)
INSERT INTO auction_bids (auction_id, club_team_id, bid_amount, created_at) VALUES
  ('b2000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 105, now() - interval '20 minutes'),
  ('b2000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', 110, now() - interval '10 minutes'),
  ('b2000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000003', 115, now() - interval '3 minutes'),
  ('b2000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000003', 105, now() - interval '15 minutes'),
  ('b2000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001', 110, now() - interval '8 minutes'),
  ('b2000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000001', 110, now() - interval '12 minutes'),
  ('b2000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000002', 120, now() - interval '6 minutes'),
  ('b2000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000004', 125, now() - interval '2 minutes'),
  ('b2000000-0000-4000-8000-000000000007', 'c1000000-0000-4000-8000-000000000001', 150, now() - interval '1 day 20 minutes'),
  ('b2000000-0000-4000-8000-000000000007', 'c1000000-0000-4000-8000-000000000004', 165, now() - interval '1 day 5 minutes'),
  ('b2000000-0000-4000-8000-000000000008', 'c1000000-0000-4000-8000-000000000002', 110, now() - interval '2 days 10 minutes');

-- ============================================================================
-- 9. STORED PROCEDURES ATÔMICAS EM ESCUDOS
-- ============================================================================

-- 9.1. RPC: Transição Automática de Leilões (AGENDADO -> ATIVO e ATIVO -> ENCERRADO)
CREATE OR REPLACE FUNCTION rpc_sync_auction_statuses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auc RECORD;
BEGIN
  -- 1. Ativar leilões agendados cujo horário de início já chegou
  UPDATE auctions
  SET status = 'ATIVO'
  WHERE status = 'AGENDADO' AND starts_at <= now();

  -- 2. Encerrar leilões ativos cujo tempo esgotou e transferir atleta ao vencedor
  FOR v_auc IN
    SELECT * FROM auctions
    WHERE status = 'ATIVO' AND ends_at <= now()
    FOR UPDATE
  LOOP
    UPDATE auctions SET status = 'ENCERRADO' WHERE id = v_auc.id;

    IF v_auc.current_winning_club_id IS NOT NULL THEN
      -- Se o atleta já possui contrato, transfere; senão cria contrato novo (salário base = 10% do lance)
      IF EXISTS (SELECT 1 FROM contracts WHERE athlete_id = v_auc.athlete_id) THEN
        UPDATE contracts
        SET club_team_id = v_auc.current_winning_club_id,
            acquired_at = now()
        WHERE athlete_id = v_auc.athlete_id;
      ELSE
        INSERT INTO contracts (club_team_id, athlete_id, salary, buyout_clause, acquired_at)
        VALUES (
          v_auc.current_winning_club_id,
          v_auc.athlete_id,
          GREATEST(15, ROUND(v_auc.current_bid * 0.15)),
          GREATEST(150, ROUND(v_auc.current_bid * 0.15) * 10),
          now()
        );
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- 9.2. RPC: Multa Rescisória ("Roubo de Jogador") em Escudos
CREATE OR REPLACE FUNCTION rpc_pay_buyout_clause(
  p_contract_id uuid,
  p_buyer_club_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_contract contracts%ROWTYPE;
  v_buyer club_teams%ROWTYPE;
  v_seller club_teams%ROWTYPE;
  v_athlete athletes%ROWTYPE;
BEGIN
  SELECT * INTO v_contract FROM contracts WHERE id = p_contract_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contrato não encontrado.';
  END IF;

  IF v_contract.club_team_id = p_buyer_club_id THEN
    RAISE EXCEPTION 'Este atleta já pertence ao seu clube.';
  END IF;

  SELECT * INTO v_buyer FROM club_teams WHERE id = p_buyer_club_id FOR UPDATE;
  SELECT * INTO v_seller FROM club_teams WHERE id = v_contract.club_team_id FOR UPDATE;
  SELECT * INTO v_athlete FROM athletes WHERE id = v_contract.athlete_id;

  IF v_buyer.balance < v_contract.buyout_clause THEN
    RAISE EXCEPTION 'Saldo insuficiente em Escudos para pagar a multa rescisória de % (Necessário: % Escudos).', v_athlete.name, v_contract.buyout_clause;
  END IF;

  -- Débito à vista do comprador
  UPDATE club_teams
  SET balance = balance - v_contract.buyout_clause,
      is_delinquent = (balance - v_contract.buyout_clause) < 0
  WHERE id = v_buyer.id;

  -- Crédito imediato no vendedor
  UPDATE club_teams
  SET balance = balance + v_contract.buyout_clause,
      is_delinquent = (balance + v_contract.buyout_clause) < 0
  WHERE id = v_seller.id;

  -- Transferência imediata do contrato do atleta
  UPDATE contracts
  SET club_team_id = v_buyer.id,
      acquired_at = now()
  WHERE id = v_contract.id;

  -- Registro auditável nas transações financeiras
  INSERT INTO financial_transactions (club_team_id, type, amount, description)
  VALUES
    (v_buyer.id, 'MULTA_PAGA', -v_contract.buyout_clause,
     format('Multa Rescisória paga à vista por %s (ex-%s) — %s Escudos', v_athlete.name, v_seller.name, v_contract.buyout_clause)),
    (v_seller.id, 'TRANSFERENCIA', v_contract.buyout_clause,
     format('Indenização de Multa Rescisória recebida por %s (comprado por %s) — +%s Escudos', v_athlete.name, v_buyer.name, v_contract.buyout_clause));

  RETURN jsonb_build_object(
    'ok', true,
    'athleteName', v_athlete.name,
    'buyoutPaid', v_contract.buyout_clause,
    'buyerNewBalance', v_buyer.balance - v_contract.buyout_clause,
    'sellerName', v_seller.name
  );
END;
$$;

-- 9.3. RPC: Lance em Leilão com Incremento de 5 em 5 Escudos, Custódia (Escrow) e Anti-Sniper (+2 min)
CREATE OR REPLACE FUNCTION rpc_place_auction_bid(
  p_auction_id uuid,
  p_bidder_club_id uuid,
  p_bid_amount integer
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auction auctions%ROWTYPE;
  v_bidder club_teams%ROWTYPE;
  v_athlete athletes%ROWTYPE;
  v_new_ends_at timestamptz;
  v_anti_sniper_triggered boolean := false;
  v_min_required integer;
BEGIN
  -- Sincronizar status de leilões agendados antes de validar
  PERFORM rpc_sync_auction_statuses();

  SELECT * INTO v_auction FROM auctions WHERE id = p_auction_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Leilão não encontrado.';
  END IF;

  IF v_auction.status = 'AGENDADO' AND v_auction.starts_at > now() THEN
    RAISE EXCEPTION 'Este leilão ainda está agendado e abrirá em breve.';
  END IF;

  IF v_auction.status <> 'ATIVO' OR v_auction.ends_at <= now() THEN
    RAISE EXCEPTION 'Este leilão já foi encerrado.';
  END IF;

  -- Cálculo do lance mínimo obrigatório (se ainda não teve lances, aceita starting_bid; senão exige + min_increment)
  IF v_auction.current_winning_club_id IS NULL THEN
    v_min_required := v_auction.starting_bid;
  ELSE
    v_min_required := v_auction.current_bid + v_auction.min_increment;
  END IF;

  IF p_bid_amount < v_min_required THEN
    RAISE EXCEPTION 'O lance deve ser de no mínimo % Escudos (incremento mínimo de % em % Escudos).',
      v_min_required, v_auction.min_increment, v_auction.min_increment;
  END IF;

  SELECT * INTO v_athlete FROM athletes WHERE id = v_auction.athlete_id;

  -- Estornar imediatamente o valor bloqueado (Escrow) do líder anterior superado
  IF v_auction.current_winning_club_id IS NOT NULL THEN
    UPDATE club_teams
    SET balance = balance + v_auction.current_bid,
        is_delinquent = (balance + v_auction.current_bid) < 0
    WHERE id = v_auction.current_winning_club_id;

    IF v_auction.current_winning_club_id <> p_bidder_club_id THEN
      INSERT INTO financial_transactions (club_team_id, type, amount, description)
      VALUES (
        v_auction.current_winning_club_id,
        'ESTORNO_LANCE',
        v_auction.current_bid,
        format('Estorno imediato de custódia (Escrow): lance superado no leilão de %s (+%s Escudos)', v_athlete.name, v_auction.current_bid)
      );
    END IF;
  END IF;

  -- Recarregar saldo atualizado do licitante e validar fundos em Escudos
  SELECT * INTO v_bidder FROM club_teams WHERE id = p_bidder_club_id FOR UPDATE;
  IF v_bidder.balance < p_bid_amount THEN
    RAISE EXCEPTION 'Saldo livre insuficiente para o lance de % Escudos (Seu saldo: % Escudos).', p_bid_amount, v_bidder.balance;
  END IF;

  -- Bloquear (Escrow) os Escudos do novo líder
  UPDATE club_teams
  SET balance = balance - p_bid_amount
  WHERE id = v_bidder.id;

  INSERT INTO financial_transactions (club_team_id, type, amount, description)
  VALUES (
    v_bidder.id,
    'BLOQUEIO_LANCE',
    -p_bid_amount,
    format('Custódia de lance (Escrow) bloqueada no leilão de %s (-%s Escudos)', v_athlete.name, p_bid_amount)
  );

  -- Regra Anti-Sniper: Se restarem <= 2 minutos, prorrogar o término em +2 minutos
  v_new_ends_at := v_auction.ends_at;
  IF (v_auction.ends_at - now()) <= interval '2 minutes' THEN
    v_new_ends_at := v_auction.ends_at + interval '2 minutes';
    v_anti_sniper_triggered := true;
  END IF;

  UPDATE auctions
  SET current_bid = p_bid_amount,
      current_winning_club_id = v_bidder.id,
      ends_at = v_new_ends_at
  WHERE id = v_auction.id;

  INSERT INTO auction_bids (auction_id, club_team_id, bid_amount)
  VALUES (v_auction.id, v_bidder.id, p_bid_amount);

  RETURN jsonb_build_object(
    'ok', true,
    'athleteName', v_athlete.name,
    'newBid', p_bid_amount,
    'endsAt', v_new_ends_at,
    'antiSniperTriggered', v_anti_sniper_triggered,
    'bidderNewBalance', v_bidder.balance - p_bid_amount
  );
END;
$$;

-- 9.4. RPC: Folha Salarial em Escudos
CREATE OR REPLACE FUNCTION rpc_process_season_payroll(
  p_club_team_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_club RECORD;
  v_total_salary integer;
  v_processed_count integer := 0;
  v_delinquent_count integer := 0;
BEGIN
  FOR v_club IN
    SELECT * FROM club_teams
    WHERE (p_club_team_id IS NULL OR id = p_club_team_id)
    FOR UPDATE
  LOOP
    SELECT COALESCE(SUM(salary), 0) INTO v_total_salary
    FROM contracts
    WHERE club_team_id = v_club.id;

    IF v_total_salary > 0 THEN
      UPDATE club_teams
      SET balance = balance - v_total_salary,
          is_delinquent = (balance - v_total_salary) < 0
      WHERE id = v_club.id;

      INSERT INTO financial_transactions (club_team_id, type, amount, description)
      VALUES (
        v_club.id,
        'SALARIO_PAGO',
        -v_total_salary,
        format('Fechamento de Folha Salarial do Elenco (-%s Escudos)', v_total_salary)
      );

      v_processed_count := v_processed_count + 1;
      IF (v_club.balance - v_total_salary) < 0 THEN
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

-- 9.5. RPC: Confirmação de Compra de Pacote de Escudos (Webhook / Checkout)
CREATE OR REPLACE FUNCTION rpc_purchase_escudos_package(
  p_club_team_id uuid,
  p_package_id uuid,
  p_payment_method varchar DEFAULT 'PIX',
  p_external_ref varchar DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_club club_teams%ROWTYPE;
  v_pkg escudo_packages%ROWTYPE;
  v_purchase_id uuid;
BEGIN
  SELECT * INTO v_club FROM club_teams WHERE id = p_club_team_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Clube não encontrado para crédito de Escudos.';
  END IF;

  SELECT * INTO v_pkg FROM escudo_packages WHERE id = p_package_id AND active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pacote promocional de Escudos não encontrado.';
  END IF;

  -- Creditar Escudos instantaneamente na carteira do clube
  UPDATE club_teams
  SET balance = balance + v_pkg.escudos_amount,
      is_delinquent = (balance + v_pkg.escudos_amount) < 0
  WHERE id = v_club.id;

  -- Registrar compra auditável
  INSERT INTO escudo_purchases (
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
    COALESCE(p_payment_method, 'PIX'),
    'CONFIRMED',
    COALESCE(p_external_ref, 'PIX-' || substr(md5(random()::text), 1, 10))
  ) RETURNING id INTO v_purchase_id;

  -- Registrar no fluxo de caixa do clube
  INSERT INTO financial_transactions (club_team_id, type, amount, description)
  VALUES (
    v_club.id,
    'RECARGA_ESCUDOS',
    v_pkg.escudos_amount,
    format('Recarga confirmada (%s): +%s Escudos creditados via %s (R$ %s)',
      v_pkg.name,
      v_pkg.escudos_amount,
      COALESCE(p_payment_method, 'PIX'),
      to_char(v_pkg.price_brl_cents / 100.0, 'FM999G990D00')
    )
  );

  RETURN jsonb_build_object(
    'ok', true,
    'purchaseId', v_purchase_id,
    'clubName', v_club.name,
    'packageName', v_pkg.name,
    'escudosCredited', v_pkg.escudos_amount,
    'newBalance', v_club.balance + v_pkg.escudos_amount
  );
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_sync_auction_statuses() TO anon, service_role;
GRANT EXECUTE ON FUNCTION rpc_pay_buyout_clause(uuid, uuid) TO anon, service_role;
GRANT EXECUTE ON FUNCTION rpc_place_auction_bid(uuid, uuid, integer) TO anon, service_role;
GRANT EXECUTE ON FUNCTION rpc_process_season_payroll(uuid) TO anon, service_role;
GRANT EXECUTE ON FUNCTION rpc_purchase_escudos_package(uuid, uuid, varchar, varchar) TO anon, service_role;

NOTIFY pgrst, 'reload schema';
