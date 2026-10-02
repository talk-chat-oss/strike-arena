import { eq, asc, desc } from "drizzle-orm";
import {
  db,
  tournaments,
  tournamentGroups,
  participants,
  standings,
  matches,
  profiles,
} from "@/db";
import {
  MOCK_TOURNAMENTS,
  MOCK_GROUPS,
  MOCK_PARTICIPANTS,
  MOCK_STANDINGS,
  MOCK_MATCHES,
  type MockTournament,
  type MockGroup,
  type MockParticipant,
  type MockStanding,
  type MockMatch,
} from "@/db/mock-data";

export interface TournamentHubData {
  tournament: MockTournament;
  groups: MockGroup[];
  participants: MockParticipant[];
  standings: MockStanding[];
  matches: MockMatch[];
  source: "postgres" | "mock_fallback";
}

export async function getAllTournaments(): Promise<{
  tournaments: MockTournament[];
  source: "postgres" | "mock_fallback";
}> {
  try {
    const rows = await db
      .select({
        id: tournaments.id,
        name: tournaments.name,
        slug: tournaments.slug,
        organizerId: tournaments.organizerId,
        organizerNickname: profiles.nickname,
        format: tournaments.format,
        game: tournaments.game,
        platform: tournaments.platform,
        status: tournaments.status,
        maxParticipants: tournaments.maxParticipants,
        entryFeeBrl: tournaments.entryFeeBrl,
        prizePoolBrl: tournaments.prizePoolBrl,
        bannerUrl: tournaments.bannerUrl,
        rulesMarkdown: tournaments.rulesMarkdown,
        startsAt: tournaments.startsAt,
      })
      .from(tournaments)
      .leftJoin(profiles, eq(tournaments.organizerId, profiles.id))
      .orderBy(desc(tournaments.createdAt));

    if (!rows.length) {
      return { tournaments: MOCK_TOURNAMENTS, source: "mock_fallback" };
    }

    const allParticipants = await db.select().from(participants);

    const mapped: MockTournament[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      organizerId: r.organizerId,
      organizerNickname: r.organizerNickname ?? "SPOOKY",
      format: r.format,
      game: r.game,
      platform: r.platform,
      status: r.status,
      maxParticipants: r.maxParticipants,
      currentParticipants:
        allParticipants.filter((p) => p.tournamentId === r.id).length ||
        (r.slug === "strike-cup-eafc26-elite" ? 8 : 12),
      entryFeeBrl: r.entryFeeBrl,
      prizePoolBrl: r.prizePoolBrl,
      bannerUrl: r.bannerUrl ?? "/banners/strike-cup-eafc.jpg",
      rulesMarkdown: r.rulesMarkdown,
      startsAt: r.startsAt
        ? r.startsAt.toISOString()
        : new Date().toISOString(),
    }));

    return { tournaments: mapped, source: "postgres" };
  } catch {
    return { tournaments: MOCK_TOURNAMENTS, source: "mock_fallback" };
  }
}

export async function getTournamentBySlug(
  slug: string
): Promise<TournamentHubData | null> {
  try {
    const [tRow] = await db
      .select({
        id: tournaments.id,
        name: tournaments.name,
        slug: tournaments.slug,
        organizerId: tournaments.organizerId,
        organizerNickname: profiles.nickname,
        format: tournaments.format,
        game: tournaments.game,
        platform: tournaments.platform,
        status: tournaments.status,
        maxParticipants: tournaments.maxParticipants,
        entryFeeBrl: tournaments.entryFeeBrl,
        prizePoolBrl: tournaments.prizePoolBrl,
        bannerUrl: tournaments.bannerUrl,
        rulesMarkdown: tournaments.rulesMarkdown,
        startsAt: tournaments.startsAt,
      })
      .from(tournaments)
      .leftJoin(profiles, eq(tournaments.organizerId, profiles.id))
      .where(eq(tournaments.slug, slug))
      .limit(1);

    if (!tRow) {
      const mockT =
        MOCK_TOURNAMENTS.find((t) => t.slug === slug) ?? MOCK_TOURNAMENTS[0];
      return {
        tournament: mockT,
        groups: MOCK_GROUPS,
        participants: MOCK_PARTICIPANTS,
        standings: MOCK_STANDINGS,
        matches: MOCK_MATCHES,
        source: "mock_fallback",
      };
    }

    const groupRows = await db
      .select()
      .from(tournamentGroups)
      .where(eq(tournamentGroups.tournamentId, tRow.id))
      .orderBy(asc(tournamentGroups.displayOrder));

    const participantRows = await db
      .select({
        id: participants.id,
        tournamentId: participants.tournamentId,
        userId: participants.userId,
        groupId: participants.groupId,
        seed: participants.seed,
        clubName: participants.clubName,
        checkinStatus: participants.checkinStatus,
        nickname: profiles.nickname,
        psnId: profiles.psnId,
        xboxGamertag: profiles.xboxGamertag,
        eaId: profiles.eaId,
      })
      .from(participants)
      .innerJoin(profiles, eq(participants.userId, profiles.id))
      .where(eq(participants.tournamentId, tRow.id))
      .orderBy(asc(participants.seed));

    // If this tournament has no seeded participants yet (e.g. secondary showcase tournament), fallback to main groups/participants for preview or empty
    if (participantRows.length === 0 && tRow.slug !== "strike-cup-eafc26-elite") {
      return {
        tournament: {
          id: tRow.id,
          name: tRow.name,
          slug: tRow.slug,
          organizerId: tRow.organizerId,
          organizerNickname: tRow.organizerNickname ?? "SPOOKY",
          format: tRow.format,
          game: tRow.game,
          platform: tRow.platform,
          status: tRow.status,
          maxParticipants: tRow.maxParticipants,
          currentParticipants: 12,
          entryFeeBrl: tRow.entryFeeBrl,
          prizePoolBrl: tRow.prizePoolBrl,
          bannerUrl: tRow.bannerUrl ?? "",
          rulesMarkdown: tRow.rulesMarkdown,
          startsAt: tRow.startsAt?.toISOString() ?? new Date().toISOString(),
        },
        groups: MOCK_GROUPS,
        participants: MOCK_PARTICIPANTS,
        standings: MOCK_STANDINGS,
        matches: MOCK_MATCHES,
        source: "postgres",
      };
    }

    const groupMap = new Map(groupRows.map((g) => [g.id, g]));
    const participantMap = new Map(participantRows.map((p) => [p.id, p]));

    const standingRows = await db
      .select()
      .from(standings)
      .where(eq(standings.tournamentId, tRow.id))
      .orderBy(
        desc(standings.points),
        desc(standings.goalDifference),
        desc(standings.goalsFor)
      );

    const matchRows = await db
      .select()
      .from(matches)
      .where(eq(matches.tournamentId, tRow.id))
      .orderBy(asc(matches.round), asc(matches.createdAt));

    const mappedGroups: MockGroup[] = groupRows.map((g) => ({
      id: g.id,
      tournamentId: g.tournamentId,
      name: g.name,
      code: (g.code as "A" | "B") || "A",
      displayOrder: g.displayOrder,
    }));

    const mappedParticipants: MockParticipant[] = participantRows.map((p) => {
      const grp = p.groupId ? groupMap.get(p.groupId) : undefined;
      const handle = p.psnId
        ? `PSN: ${p.psnId}`
        : p.xboxGamertag
        ? `XBOX: ${p.xboxGamertag}`
        : `EA: ${p.eaId ?? p.nickname}`;
      return {
        id: p.id,
        tournamentId: p.tournamentId,
        userId: p.userId,
        groupId: p.groupId ?? "",
        groupCode: ((grp?.code as "A" | "B") ?? "A"),
        seed: p.seed ?? 1,
        nickname: p.nickname,
        platformHandle: handle,
        clubName: p.clubName,
        checkinStatus: p.checkinStatus,
      };
    });

    const mappedStandings: MockStanding[] = standingRows.map((s) => {
      const part = participantMap.get(s.participantId);
      const grp = s.groupId ? groupMap.get(s.groupId) : undefined;
      const handle = part?.psnId
        ? `PSN: ${part.psnId}`
        : part?.xboxGamertag
        ? `XBOX: ${part.xboxGamertag}`
        : `EA: ${part?.eaId ?? part?.nickname ?? "Player"}`;
      return {
        id: s.id,
        tournamentId: s.tournamentId,
        groupId: s.groupId ?? "",
        groupCode: ((grp?.code as "A" | "B") ?? "A"),
        participantId: s.participantId,
        nickname: part?.nickname ?? "Jogador",
        clubName: part?.clubName ?? "Clube",
        platformHandle: handle,
        points: s.points,
        matchesPlayed: s.matchesPlayed,
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDifference: s.goalDifference,
      };
    });

    const mappedMatches: MockMatch[] = matchRows.map((m) => {
      const home = m.homeParticipantId
        ? participantMap.get(m.homeParticipantId)
        : undefined;
      const away = m.awayParticipantId
        ? participantMap.get(m.awayParticipantId)
        : undefined;
      const grp = m.groupId ? groupMap.get(m.groupId) : undefined;
      return {
        id: m.id,
        tournamentId: m.tournamentId,
        groupId: m.groupId,
        groupCode: grp ? (grp.code as "A" | "B") : null,
        stage: m.stage as MockMatch["stage"],
        round: m.round,
        bracketPosition: m.bracketPosition,
        label: m.label ?? `Rodada ${m.round}`,
        homeParticipantId: m.homeParticipantId ?? "",
        awayParticipantId: m.awayParticipantId ?? "",
        homeNickname:
          m.stage === "final" && m.status === "scheduled"
            ? "Vencedor SF1 (Vini/Gui)"
            : home?.nickname ?? "A Definir",
        homeClub:
          m.stage === "final" && m.status === "scheduled"
            ? "A Definir (SF1)"
            : home?.clubName ?? "TBD",
        awayNickname: away?.nickname ?? "A Definir",
        awayClub: away?.clubName ?? "TBD",
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        winnerParticipantId: m.winnerParticipantId,
        proofUrl: m.proofUrl,
        notes: m.notes,
        status: m.status,
        scheduledAt: m.scheduledAt
          ? m.scheduledAt.toISOString()
          : new Date().toISOString(),
        playedAt: m.playedAt ? m.playedAt.toISOString() : null,
      };
    });

    return {
      tournament: {
        id: tRow.id,
        name: tRow.name,
        slug: tRow.slug,
        organizerId: tRow.organizerId,
        organizerNickname: tRow.organizerNickname ?? "SPOOKY",
        format: tRow.format,
        game: tRow.game,
        platform: tRow.platform,
        status: tRow.status,
        maxParticipants: tRow.maxParticipants,
        currentParticipants: mappedParticipants.length,
        entryFeeBrl: tRow.entryFeeBrl,
        prizePoolBrl: tRow.prizePoolBrl,
        bannerUrl: tRow.bannerUrl ?? "",
        rulesMarkdown: tRow.rulesMarkdown,
        startsAt: tRow.startsAt
          ? tRow.startsAt.toISOString()
          : new Date().toISOString(),
      },
      groups: mappedGroups,
      participants: mappedParticipants,
      standings: mappedStandings,
      matches: mappedMatches,
      source: "postgres",
    };
  } catch {
    const mockT =
      MOCK_TOURNAMENTS.find((t) => t.slug === slug) ?? MOCK_TOURNAMENTS[0];
    return {
      tournament: mockT,
      groups: MOCK_GROUPS,
      participants: MOCK_PARTICIPANTS,
      standings: MOCK_STANDINGS,
      matches: MOCK_MATCHES,
      source: "mock_fallback",
    };
  }
}
