-- Promote Ynui and Sart to super_admin alongside SPOOKY and grant lifetime ADMIN_GRANTED League Pass
UPDATE profiles
SET role = 'super_admin'
WHERE id IN (
  '80193776-6790-457c-906d-ed45ea16df9f', -- SPOOKY
  '2363559b-2a96-4e2c-96e3-5e4c3701fee8', -- Sart
  'c964fddf-af1d-429e-b19a-ea0cc1bafcf3'  -- Ynui
)
OR LOWER(nickname) IN ('spooky', 'sart', 'ynui');

UPDATE club_teams
SET
  league_pass_expires_at = '2099-12-31T23:59:59.000Z',
  league_pass_mode = 'ADMIN_GRANTED',
  is_delinquent = FALSE
WHERE user_id IN (
  SELECT id FROM profiles WHERE role IN ('super_admin', 'organizer')
);
