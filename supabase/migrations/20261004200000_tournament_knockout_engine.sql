-- Tournament engine: knockout (single leg / two legs), penalties and tournament configs.
-- A "tie" (confronto) = all matches sharing (tournament_id, stage, bracket_position); legs are ordered by `leg`.

ALTER TYPE match_stage ADD VALUE IF NOT EXISTS 'round_of_32' BEFORE 'round_of_16';

ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS legs_per_round INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS final_two_legs BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS third_place_match BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS group_turns INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS qualified_per_group INTEGER NOT NULL DEFAULT 2;

ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS leg INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS home_penalties INTEGER,
  ADD COLUMN IF NOT EXISTS away_penalties INTEGER;

CREATE INDEX IF NOT EXISTS matches_tie_idx
  ON matches (tournament_id, stage, bracket_position, leg);
