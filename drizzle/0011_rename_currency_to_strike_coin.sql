-- ============================================================================
-- MIGRATION 0011: RENOMEAR MOEDA OFICIAL DE "ESCUDOS" PARA "STRIKE COIN"
-- ============================================================================

UPDATE public.escudo_packages
SET name = regexp_replace(name, 'Escudos?', 'Strike Coin', 'gi')
WHERE name ~* 'Escudos?';

UPDATE public.financial_transactions
SET description = regexp_replace(description, 'Escudos?', 'Strike Coin', 'gi')
WHERE description ~* 'Escudos?';
