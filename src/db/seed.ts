import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { supabaseAdmin } from "../lib/supabase";
import {
  MOCK_PROFILES,
  MOCK_TOURNAMENTS,
  MOCK_GROUPS,
  MOCK_PARTICIPANTS,
  MOCK_STANDINGS,
  MOCK_MATCHES,
} from "./mock-data";

async function seed() {
  console.log(
    "⚡ [Strike Arena] Iniciando seed no Supabase Local (deathstar-server via https://api.staffygo.com.br)..."
  );

  // 1. Profiles (incluindo Super-Admin SPOOKY + 8 jogadores)
  const { error: profErr } = await supabaseAdmin.from("sa_profiles").upsert(
    MOCK_PROFILES.map((p) => ({
      id: p.id,
      nickname: p.nickname,
      email: p.email,
      role: p.role,
      psn_id: p.psnId,
      xbox_gamertag: p.xboxGamertag,
      ea_id: p.eaId,
      konami_id: p.konamiId,
      discord_handle: p.discordHandle,
      avatar_url: p.avatarUrl,
      is_super_admin: p.id === "80193776-6790-457c-906d-ed45ea16df9f",
    })),
    { onConflict: "id" }
  );
  if (profErr) throw new Error(`sa_profiles error: ${profErr.message}`);
  console.log(`✔ ${MOCK_PROFILES.length} perfis inseridos/atualizados.`);

  // 2. Tournaments
  const { error: tournErr } = await supabaseAdmin.from("sa_tournaments").upsert(
    MOCK_TOURNAMENTS.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      organizer_id: t.organizerId,
      format: t.format,
      game: t.game,
      platform: t.platform,
      status: t.status,
      max_participants: t.maxParticipants,
      entry_fee_brl: t.entryFeeBrl,
      prize_pool_brl: t.prizePoolBrl,
      banner_url: t.bannerUrl,
      rules_markdown: t.rulesMarkdown,
      starts_at: t.startsAt,
    })),
    { onConflict: "id" }
  );
  if (tournErr) throw new Error(`sa_tournaments error: ${tournErr.message}`);
  console.log(`✔ ${MOCK_TOURNAMENTS.length} torneios inseridos/atualizados.`);

  // 3. Groups (Grupo A e Grupo B)
  const { error: grpErr } = await supabaseAdmin
    .from("sa_tournament_groups")
    .upsert(
      MOCK_GROUPS.map((g) => ({
        id: g.id,
        tournament_id: g.tournamentId,
        name: g.name,
        code: g.code,
        display_order: g.displayOrder,
      })),
      { onConflict: "id" }
    );
  if (grpErr) throw new Error(`sa_tournament_groups error: ${grpErr.message}`);
  console.log(`✔ ${MOCK_GROUPS.length} grupos inseridos.`);

  // 4. Participants (8 jogadores)
  const { error: partErr } = await supabaseAdmin
    .from("sa_participants")
    .upsert(
      MOCK_PARTICIPANTS.map((p) => ({
        id: p.id,
        tournament_id: p.tournamentId,
        user_id: p.userId,
        group_id: p.groupId,
        seed: p.seed,
        club_name: p.clubName,
        checkin_status: p.checkinStatus,
        checked_in_at:
          p.checkinStatus === "checked_in" ? new Date().toISOString() : null,
      })),
      { onConflict: "id" }
    );
  if (partErr) throw new Error(`sa_participants error: ${partErr.message}`);
  console.log(`✔ ${MOCK_PARTICIPANTS.length} participantes inseridos.`);

  // 5. Standings
  const { error: stdErr } = await supabaseAdmin.from("sa_standings").upsert(
    MOCK_STANDINGS.map((s) => ({
      id: s.id,
      tournament_id: s.tournamentId,
      group_id: s.groupId,
      participant_id: s.participantId,
      points: s.points,
      matches_played: s.matchesPlayed,
      wins: s.wins,
      draws: s.draws,
      losses: s.losses,
      goals_for: s.goalsFor,
      goals_against: s.goalsAgainst,
      goal_difference: s.goalDifference,
    })),
    { onConflict: "id" }
  );
  if (stdErr) throw new Error(`sa_standings error: ${stdErr.message}`);
  console.log(
    `✔ ${MOCK_STANDINGS.length} registros de classificação inseridos.`
  );

  // 6. Matches
  const { error: matchErr } = await supabaseAdmin.from("sa_matches").upsert(
    MOCK_MATCHES.map((m) => ({
      id: m.id,
      tournament_id: m.tournamentId,
      group_id: m.groupId,
      stage: m.stage,
      round: m.round,
      bracket_position: m.bracketPosition,
      label: m.label,
      home_participant_id: m.homeParticipantId,
      away_participant_id: m.awayParticipantId,
      home_score: m.homeScore,
      away_score: m.awayScore,
      winner_participant_id: m.winnerParticipantId,
      proof_url: m.proofUrl,
      reported_by_id: MOCK_PROFILES[0].id,
      notes: m.notes,
      status: m.status,
      scheduled_at: m.scheduledAt,
      played_at: m.playedAt,
    })),
    { onConflict: "id" }
  );
  if (matchErr) throw new Error(`sa_matches error: ${matchErr.message}`);
  console.log(`✔ ${MOCK_MATCHES.length} partidas inseridas.`);

  console.log(
    "🏆 Seed concluído com sucesso no Supabase Local (https://api.staffygo.com.br)!"
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Erro ao executar seed:", err);
  process.exit(1);
});
