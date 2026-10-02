import { supabase } from "@/lib/supabase";
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
    const { data: rows, error } = await supabase
      .from("sa_tournaments")
      .select("*, organizer:sa_profiles!organizer_id(nickname)")
      .order("created_at", { ascending: false });

    if (error || !rows || rows.length === 0) {
      return { tournaments: MOCK_TOURNAMENTS, source: "mock_fallback" };
    }

    const { data: allParticipants } = await supabase
      .from("sa_participants")
      .select("id, tournament_id");

    const mapped: MockTournament[] = rows.map((r) => {
      const org = Array.isArray(r.organizer) ? r.organizer[0] : r.organizer;
      const count =
        (allParticipants ?? []).filter((p) => p.tournament_id === r.id).length ||
        (r.slug === "strike-cup-eafc26-elite" ? 8 : 12);

      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        organizerId: r.organizer_id,
        organizerNickname: org?.nickname ?? "SPOOKY",
        format: r.format,
        game: r.game,
        platform: r.platform,
        status: r.status,
        maxParticipants: r.max_participants,
        currentParticipants: count,
        entryFeeBrl: r.entry_fee_brl,
        prizePoolBrl: r.prize_pool_brl,
        bannerUrl: r.banner_url ?? "/banners/strike-cup-eafc.jpg",
        rulesMarkdown: r.rules_markdown,
        startsAt: r.starts_at ?? new Date().toISOString(),
      };
    });

    return { tournaments: mapped, source: "postgres" };
  } catch {
    return { tournaments: MOCK_TOURNAMENTS, source: "mock_fallback" };
  }
}

export async function getTournamentBySlug(
  slug: string
): Promise<TournamentHubData | null> {
  try {
    const { data: tRow, error: tErr } = await supabase
      .from("sa_tournaments")
      .select("*, organizer:sa_profiles!organizer_id(nickname)")
      .eq("slug", slug)
      .maybeSingle();

    if (tErr || !tRow) {
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

    const org = Array.isArray(tRow.organizer)
      ? tRow.organizer[0]
      : tRow.organizer;

    const [
      { data: groupRows },
      { data: participantRows },
      { data: standingRows },
      { data: matchRows },
    ] = await Promise.all([
      supabase
        .from("sa_tournament_groups")
        .select("*")
        .eq("tournament_id", tRow.id)
        .order("display_order", { ascending: true }),
      supabase
        .from("sa_participants")
        .select(
          "*, profile:sa_profiles!user_id(nickname, psn_id, xbox_gamertag, ea_id)"
        )
        .eq("tournament_id", tRow.id)
        .order("seed", { ascending: true }),
      supabase
        .from("sa_standings")
        .select("*")
        .eq("tournament_id", tRow.id)
        .order("points", { ascending: false })
        .order("goal_difference", { ascending: false })
        .order("goals_for", { ascending: false }),
      supabase
        .from("sa_matches")
        .select("*")
        .eq("tournament_id", tRow.id)
        .order("round", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

    if (
      (!participantRows || participantRows.length === 0) &&
      tRow.slug !== "strike-cup-eafc26-elite"
    ) {
      return {
        tournament: {
          id: tRow.id,
          name: tRow.name,
          slug: tRow.slug,
          organizerId: tRow.organizer_id,
          organizerNickname: org?.nickname ?? "SPOOKY",
          format: tRow.format,
          game: tRow.game,
          platform: tRow.platform,
          status: tRow.status,
          maxParticipants: tRow.max_participants,
          currentParticipants: 12,
          entryFeeBrl: tRow.entry_fee_brl,
          prizePoolBrl: tRow.prize_pool_brl,
          bannerUrl: tRow.banner_url ?? "",
          rulesMarkdown: tRow.rules_markdown,
          startsAt: tRow.starts_at ?? new Date().toISOString(),
        },
        groups: MOCK_GROUPS,
        participants: MOCK_PARTICIPANTS,
        standings: MOCK_STANDINGS,
        matches: MOCK_MATCHES,
        source: "postgres",
      };
    }

    const gList = groupRows ?? [];
    const pList = participantRows ?? [];
    const sList = standingRows ?? [];
    const mList = matchRows ?? [];

    const groupMap = new Map(gList.map((g) => [g.id, g]));
    const participantMap = new Map(
      pList.map((p) => {
        const prof = Array.isArray(p.profile) ? p.profile[0] : p.profile;
        return [
          p.id,
          {
            ...p,
            nickname: prof?.nickname ?? "Jogador",
            psnId: prof?.psn_id ?? null,
            xboxGamertag: prof?.xbox_gamertag ?? null,
            eaId: prof?.ea_id ?? null,
          },
        ];
      })
    );

    const mappedGroups: MockGroup[] = gList.map((g) => ({
      id: g.id,
      tournamentId: g.tournament_id,
      name: g.name,
      code: (g.code as "A" | "B") || "A",
      displayOrder: g.display_order,
    }));

    const mappedParticipants: MockParticipant[] = Array.from(
      participantMap.values()
    ).map((p) => {
      const grp = p.group_id ? groupMap.get(p.group_id) : undefined;
      const handle = p.psnId
        ? `PSN: ${p.psnId}`
        : p.xboxGamertag
        ? `XBOX: ${p.xboxGamertag}`
        : `EA: ${p.eaId ?? p.nickname}`;
      return {
        id: p.id,
        tournamentId: p.tournament_id,
        userId: p.user_id,
        groupId: p.group_id ?? "",
        groupCode: (grp?.code as "A" | "B") ?? "A",
        seed: p.seed ?? 1,
        nickname: p.nickname,
        platformHandle: handle,
        clubName: p.club_name,
        checkinStatus: p.checkin_status,
      };
    });

    const mappedStandings: MockStanding[] = sList.map((s) => {
      const part = participantMap.get(s.participant_id);
      const grp = s.group_id ? groupMap.get(s.group_id) : undefined;
      const handle = part?.psnId
        ? `PSN: ${part.psnId}`
        : part?.xboxGamertag
        ? `XBOX: ${part.xboxGamertag}`
        : `EA: ${part?.eaId ?? part?.nickname ?? "Player"}`;
      return {
        id: s.id,
        tournamentId: s.tournament_id,
        groupId: s.group_id ?? "",
        groupCode: (grp?.code as "A" | "B") ?? "A",
        participantId: s.participant_id,
        nickname: part?.nickname ?? "Jogador",
        clubName: part?.club_name ?? "Clube",
        platformHandle: handle,
        points: s.points,
        matchesPlayed: s.matches_played,
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
        goalsFor: s.goals_for,
        goalsAgainst: s.goals_against,
        goalDifference: s.goal_difference,
      };
    });

    const mappedMatches: MockMatch[] = mList.map((m) => {
      const home = m.home_participant_id
        ? participantMap.get(m.home_participant_id)
        : undefined;
      const away = m.away_participant_id
        ? participantMap.get(m.away_participant_id)
        : undefined;
      const grp = m.group_id ? groupMap.get(m.group_id) : undefined;
      return {
        id: m.id,
        tournamentId: m.tournament_id,
        groupId: m.group_id,
        groupCode: grp ? (grp.code as "A" | "B") : null,
        stage: m.stage as MockMatch["stage"],
        round: m.round,
        bracketPosition: m.bracket_position,
        label: m.label ?? `Rodada ${m.round}`,
        homeParticipantId: m.home_participant_id ?? "",
        awayParticipantId: m.away_participant_id ?? "",
        homeNickname:
          m.stage === "final" && m.status === "scheduled"
            ? "Vencedor SF1 (Vini/Gui)"
            : home?.nickname ?? "A Definir",
        homeClub:
          m.stage === "final" && m.status === "scheduled"
            ? "A Definir (SF1)"
            : home?.club_name ?? "TBD",
        awayNickname: away?.nickname ?? "A Definir",
        awayClub: away?.club_name ?? "TBD",
        homeScore: m.home_score,
        awayScore: m.away_score,
        winnerParticipantId: m.winner_participant_id,
        proofUrl: m.proof_url,
        notes: m.notes,
        status: m.status,
        scheduledAt: m.scheduled_at ?? new Date().toISOString(),
        playedAt: m.played_at ?? null,
      };
    });

    return {
      tournament: {
        id: tRow.id,
        name: tRow.name,
        slug: tRow.slug,
        organizerId: tRow.organizer_id,
        organizerNickname: org?.nickname ?? "SPOOKY",
        format: tRow.format,
        game: tRow.game,
        platform: tRow.platform,
        status: tRow.status,
        maxParticipants: tRow.max_participants,
        currentParticipants: mappedParticipants.length,
        entryFeeBrl: tRow.entry_fee_brl,
        prizePoolBrl: tRow.prize_pool_brl,
        bannerUrl: tRow.banner_url ?? "",
        rulesMarkdown: tRow.rules_markdown,
        startsAt: tRow.starts_at ?? new Date().toISOString(),
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
