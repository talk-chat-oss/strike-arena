-- ============================================================================
-- STRIKE ARENA - MIGRATION 0004: FOTOS OFICIAIS REAIS DOS ATLETAS (CUTOUTS PNG)
-- Instância isolada: strike-arena-db (porta 5433 no deathstar-server)
-- ============================================================================

UPDATE public.athletes SET photo_url = '/players/mbappe.png'     WHERE id = 'a0000000-0000-4000-8000-000000000001';
UPDATE public.athletes SET photo_url = '/players/haaland.png'    WHERE id = 'a0000000-0000-4000-8000-000000000002';
UPDATE public.athletes SET photo_url = '/players/vinijr.png'     WHERE id = 'a0000000-0000-4000-8000-000000000003';
UPDATE public.athletes SET photo_url = '/players/bellingham.png' WHERE id = 'a0000000-0000-4000-8000-000000000004';
UPDATE public.athletes SET photo_url = '/players/rodri.png'      WHERE id = 'a0000000-0000-4000-8000-000000000005';
UPDATE public.athletes SET photo_url = '/players/yamal.png'      WHERE id = 'a0000000-0000-4000-8000-000000000006';
UPDATE public.athletes SET photo_url = '/players/kane.png'       WHERE id = 'a0000000-0000-4000-8000-000000000007';
UPDATE public.athletes SET photo_url = '/players/salah.png'      WHERE id = 'a0000000-0000-4000-8000-000000000008';
UPDATE public.athletes SET photo_url = '/players/saka.png'       WHERE id = 'a0000000-0000-4000-8000-000000000009';
UPDATE public.athletes SET photo_url = '/players/valverde.png'   WHERE id = 'a0000000-0000-4000-8000-000000000010';
UPDATE public.athletes SET photo_url = '/players/vandijk.png'    WHERE id = 'a0000000-0000-4000-8000-000000000011';
UPDATE public.athletes SET photo_url = '/players/saliba.png'     WHERE id = 'a0000000-0000-4000-8000-000000000012';
UPDATE public.athletes SET photo_url = '/players/courtois.png'   WHERE id = 'a0000000-0000-4000-8000-000000000013';
UPDATE public.athletes SET photo_url = '/players/alisson.png'    WHERE id = 'a0000000-0000-4000-8000-000000000014';
UPDATE public.athletes SET photo_url = '/players/pedri.png'      WHERE id = 'a0000000-0000-4000-8000-000000000015';
UPDATE public.athletes SET photo_url = '/players/musiala.png'    WHERE id = 'a0000000-0000-4000-8000-000000000016';
UPDATE public.athletes SET photo_url = '/players/palmer.png'     WHERE id = 'a0000000-0000-4000-8000-000000000017';
UPDATE public.athletes SET photo_url = '/players/pedro.png'      WHERE id = 'a0000000-0000-4000-8000-000000000018';
UPDATE public.athletes SET photo_url = '/players/estevao.png'    WHERE id = 'a0000000-0000-4000-8000-000000000019';
UPDATE public.athletes SET photo_url = '/players/wirtz.png'      WHERE id = 'a0000000-0000-4000-8000-000000000020';

NOTIFY pgrst, 'reload schema';
