import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import {
  db,
  profiles,
  tournaments,
  tournamentGroups,
  participants,
  standings,
  matches,
} from "./index";
import {
  MOCK_PROFILES,
  MOCK_TOURNAMENTS,
  MOCK_GROUPS,
  MOCK_PARTICIPANTS,
  MOCK_STANDINGS,
  MOCK_MATCHES,
} from "./mock-data";

async function seed() {
  console.log("⚡ [Strike Arena] Iniciando seed no PostgreSQL (deathstar-server:5433)...");

  // 1. Profiles (incluindo Super-Admin SPOOKY + 8 jogadores)
  for (const profile of MOCK_PROFILES) {
    await db
      .insert(profiles)
      .values({
        id: profile.id,
        nickname: profile.nickname,
        email: profile.email,
        role: profile.role,
        psnId: profile.psnId,
        xboxGamertag: profile.xboxGamertag,
        eaId: profile.eaId,
        konamiId: profile.konamiId,
        discordHandle: profile.discordHandle,
        avatarUrl: profile.avatarUrl,
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          nickname: profile.nickname,
          role: profile.role,
          psnId: profile.psnId,
          xboxGamertag: profile.xboxGamertag,
          eaId: profile.eaId,
        },
      });
  }
  console.log(`✔ ${MOCK_PROFILES.length} perfis inseridos/atualizados.`);

  // 2. Tournaments
  for (const t of MOCK_TOURNAMENTS) {
    await db
      .insert(tournaments)
      .values({
        id: t.id,
        name: t.name,
        slug: t.slug,
        organizerId: t.organizerId,
        format: t.format,
        game: t.game,
        platform: t.platform,
        status: t.status,
        maxParticipants: t.maxParticipants,
        entryFeeBrl: t.entryFeeBrl,
        prizePoolBrl: t.prizePoolBrl,
        bannerUrl: t.bannerUrl,
        rulesMarkdown: t.rulesMarkdown,
        startsAt: new Date(t.startsAt),
      })
      .onConflictDoUpdate({
        target: tournaments.id,
        set: {
          name: t.name,
          status: t.status,
          prizePoolBrl: t.prizePoolBrl,
        },
      });
  }
  console.log(`✔ ${MOCK_TOURNAMENTS.length} torneios inseridos/atualizados.`);

  // 3. Groups (Grupo A e Grupo B)
  for (const g of MOCK_GROUPS) {
    await db
      .insert(tournamentGroups)
      .values({
        id: g.id,
        tournamentId: g.tournamentId,
        name: g.name,
        code: g.code,
        displayOrder: g.displayOrder,
      })
      .onConflictDoNothing();
  }
  console.log(`✔ ${MOCK_GROUPS.length} grupos inseridos.`);

  // 4. Participants (8 jogadores)
  for (const p of MOCK_PARTICIPANTS) {
    await db
      .insert(participants)
      .values({
        id: p.id,
        tournamentId: p.tournamentId,
        userId: p.userId,
        groupId: p.groupId,
        seed: p.seed,
        clubName: p.clubName,
        checkinStatus: p.checkinStatus,
        checkedInAt:
          p.checkinStatus === "checked_in" ? new Date() : null,
      })
      .onConflictDoUpdate({
        target: participants.id,
        set: {
          clubName: p.clubName,
          checkinStatus: p.checkinStatus,
        },
      });
  }
  console.log(`✔ ${MOCK_PARTICIPANTS.length} participantes inseridos.`);

  // 5. Standings
  for (const s of MOCK_STANDINGS) {
    await db
      .insert(standings)
      .values({
        id: s.id,
        tournamentId: s.tournamentId,
        groupId: s.groupId,
        participantId: s.participantId,
        points: s.points,
        matchesPlayed: s.matchesPlayed,
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDifference: s.goalDifference,
      })
      .onConflictDoUpdate({
        target: standings.id,
        set: {
          points: s.points,
          matchesPlayed: s.matchesPlayed,
          wins: s.wins,
          draws: s.draws,
          losses: s.losses,
          goalsFor: s.goalsFor,
          goalsAgainst: s.goalsAgainst,
          goalDifference: s.goalDifference,
        },
      });
  }
  console.log(`✔ ${MOCK_STANDINGS.length} registros de classificação inseridos.`);

  // 6. Matches
  for (const m of MOCK_MATCHES) {
    await db
      .insert(matches)
      .values({
        id: m.id,
        tournamentId: m.tournamentId,
        groupId: m.groupId,
        stage: m.stage,
        round: m.round,
        bracketPosition: m.bracketPosition,
        label: m.label,
        homeParticipantId: m.homeParticipantId,
        awayParticipantId: m.awayParticipantId,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        winnerParticipantId: m.winnerParticipantId,
        proofUrl: m.proofUrl,
        reportedById: MOCK_PROFILES[0].id,
        notes: m.notes,
        status: m.status,
        scheduledAt: new Date(m.scheduledAt),
        playedAt: m.playedAt ? new Date(m.playedAt) : null,
      })
      .onConflictDoUpdate({
        target: matches.id,
        set: {
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          status: m.status,
          proofUrl: m.proofUrl,
          notes: m.notes,
        },
      });
  }
  console.log(`✔ ${MOCK_MATCHES.length} partidas inseridas.`);

  console.log("🏆 Seed concluído com sucesso no Strike Arena!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Erro ao executar seed:", err);
  process.exit(1);
});
