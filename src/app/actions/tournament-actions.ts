"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import {
  db,
  matches,
  standings,
  participants,
  tournaments,
  SUPER_ADMIN_ID,
  isSuperAdmin,
} from "@/db";
import {
  submitMatchScoreSchema,
  resolveMatchDisputeSchema,
  createTournamentSchema,
} from "@/lib/validations/tournament";

/**
 * Recalcula automaticamente a tabela de classificação (standings) do torneio
 * com base nas partidas de fase de grupos concluídas ou decididas por W.O.
 */
async function recalculateGroupStandings(tournamentId: string) {
  const allParticipants = await db
    .select()
    .from(participants)
    .where(eq(participants.tournamentId, tournamentId));

  const allMatches = await db
    .select()
    .from(matches)
    .where(eq(matches.tournamentId, tournamentId));

  const statsMap = new Map<
    string,
    {
      groupId: string | null;
      points: number;
      matchesPlayed: number;
      wins: number;
      draws: number;
      losses: number;
      goalsFor: number;
      goalsAgainst: number;
      goalDifference: number;
    }
  >();

  for (const p of allParticipants) {
    statsMap.set(p.id, {
      groupId: p.groupId,
      points: 0,
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
    });
  }

  for (const m of allMatches) {
    if (
      m.stage !== "group" ||
      (m.status !== "completed" && m.status !== "walkover") ||
      m.homeScore === null ||
      m.awayScore === null ||
      !m.homeParticipantId ||
      !m.awayParticipantId
    ) {
      continue;
    }

    const home = statsMap.get(m.homeParticipantId);
    const away = statsMap.get(m.awayParticipantId);
    if (!home || !away) continue;

    home.matchesPlayed += 1;
    away.matchesPlayed += 1;
    home.goalsFor += m.homeScore;
    home.goalsAgainst += m.awayScore;
    away.goalsFor += m.awayScore;
    away.goalsAgainst += m.homeScore;

    if (m.homeScore > m.awayScore) {
      home.wins += 1;
      home.points += 3;
      away.losses += 1;
    } else if (m.homeScore < m.awayScore) {
      away.wins += 1;
      away.points += 3;
      home.losses += 1;
    } else {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    }

    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;
  }

  for (const [participantId, st] of statsMap.entries()) {
    await db
      .update(standings)
      .set({
        points: st.points,
        matchesPlayed: st.matchesPlayed,
        wins: st.wins,
        draws: st.draws,
        losses: st.losses,
        goalsFor: st.goalsFor,
        goalsAgainst: st.goalsAgainst,
        goalDifference: st.goalDifference,
        updatedAt: new Date(),
      })
      .where(eq(standings.participantId, participantId));
  }
}

export async function submitMatchScoreAction(rawInput: {
  matchId: string;
  tournamentSlug: string;
  homeScore: number;
  awayScore: number;
  proofUrl: string;
  notes?: string;
  requestWalkover?: boolean;
  actorUserId?: string;
}) {
  const parsed = submitMatchScoreSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const {
    matchId,
    tournamentSlug,
    homeScore,
    awayScore,
    proofUrl,
    notes,
    requestWalkover,
  } = parsed.data;

  try {
    const [existingMatch] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, matchId))
      .limit(1);

    if (!existingMatch) {
      return { ok: false, error: "Partida não encontrada no banco de dados." };
    }

    const winnerId =
      homeScore > awayScore
        ? existingMatch.homeParticipantId
        : awayScore > homeScore
        ? existingMatch.awayParticipantId
        : null;

    // Super-Admin SPOOKY tem aprovação imediata se desejar, ou vai para aguardando confirmação/disputa
    const newStatus = requestWalkover
      ? "disputed"
      : isSuperAdmin(rawInput.actorUserId)
      ? "completed"
      : "awaiting_confirmation";

    await db
      .update(matches)
      .set({
        homeScore,
        awayScore,
        winnerParticipantId: winnerId,
        proofUrl,
        notes: notes || "Placar reportado via Match Hub.",
        status: newStatus,
        playedAt: new Date(),
        reportedById: rawInput.actorUserId ?? SUPER_ADMIN_ID,
      })
      .where(eq(matches.id, matchId));

    if (newStatus === "completed") {
      await recalculateGroupStandings(existingMatch.tournamentId);
    }

    revalidatePath(`/tournaments/${tournamentSlug}`);
    revalidatePath("/organizer");
    revalidatePath("/");

    return {
      ok: true,
      status: newStatus,
      message:
        newStatus === "completed"
          ? "Placar homologado imediatamente (Super-Admin SPOOKY) e tabela recalculada!"
          : requestWalkover
          ? "Pedido de W.O. registrado com comprovante e enviado para mediação."
          : "Placar e comprovante enviados! Aguardando confirmação do adversário ou homologação.",
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Erro ao salvar resultado no PostgreSQL.",
    };
  }
}

export async function mediateMatchAction(rawInput: {
  matchId: string;
  tournamentSlug: string;
  action: "approve" | "walkover_home" | "walkover_away" | "dispute";
  actorUserId?: string;
}) {
  const parsed = resolveMatchDisputeSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "Parâmetros de mediação inválidos." };
  }

  try {
    const [existingMatch] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, parsed.data.matchId))
      .limit(1);

    if (!existingMatch) {
      return { ok: false, error: "Partida não encontrada." };
    }

    let homeScore = existingMatch.homeScore ?? 0;
    let awayScore = existingMatch.awayScore ?? 0;
    let status: "completed" | "walkover" | "disputed" = "completed";
    let notes = existingMatch.notes ?? "";

    if (parsed.data.action === "walkover_home") {
      homeScore = 3;
      awayScore = 0;
      status = "walkover";
      notes = "W.O. (3×0 Mandante) aplicado pela Organização / Super-Admin SPOOKY.";
    } else if (parsed.data.action === "walkover_away") {
      homeScore = 0;
      awayScore = 3;
      status = "walkover";
      notes = "W.O. (0×3 Visitante) aplicado pela Organização / Super-Admin SPOOKY.";
    } else if (parsed.data.action === "dispute") {
      status = "disputed";
      notes = "Partida marcada sob contestação para auditoria de print.";
    } else {
      status = "completed";
      notes = "Placar homologado pela Organização / Super-Admin SPOOKY.";
    }

    const winnerId =
      homeScore > awayScore
        ? existingMatch.homeParticipantId
        : awayScore > homeScore
        ? existingMatch.awayParticipantId
        : null;

    await db
      .update(matches)
      .set({
        homeScore,
        awayScore,
        winnerParticipantId: winnerId,
        status,
        notes,
        playedAt: new Date(),
      })
      .where(eq(matches.id, existingMatch.id));

    await recalculateGroupStandings(existingMatch.tournamentId);

    revalidatePath(`/tournaments/${rawInput.tournamentSlug}`);
    revalidatePath("/organizer");
    revalidatePath("/");

    return {
      ok: true,
      message: `Partida atualizada (${status.toUpperCase()}) e classificação recalculada!`,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Falha na mediação.",
    };
  }
}

export async function createTournamentAction(rawInput: {
  name: string;
  slug: string;
  game: "ea_fc" | "efootball";
  platform: "ps5" | "xbox" | "pc" | "crossplay";
  format:
    | "round_robin"
    | "single_elimination"
    | "double_elimination"
    | "groups_playoffs";
  maxParticipants: number;
  entryFeeBrl: number;
  prizePoolBrl: number;
  rulesMarkdown: string;
}) {
  const parsed = createTournamentSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Verifique os campos do torneio.",
    };
  }

  try {
    const [inserted] = await db
      .insert(tournaments)
      .values({
        name: parsed.data.name,
        slug: parsed.data.slug,
        organizerId: SUPER_ADMIN_ID,
        game: parsed.data.game,
        platform: parsed.data.platform,
        format: parsed.data.format,
        status: "open",
        maxParticipants: parsed.data.maxParticipants,
        entryFeeBrl: parsed.data.entryFeeBrl,
        prizePoolBrl: parsed.data.prizePoolBrl,
        rulesMarkdown: parsed.data.rulesMarkdown,
        startsAt: new Date(Date.now() + 86400000),
      })
      .returning();

    revalidatePath("/");
    revalidatePath("/organizer");

    return {
      ok: true,
      slug: inserted.slug,
      message: `Torneio "${inserted.name}" publicado com sucesso!`,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Erro ao criar torneio (verifique se o slug já existe).",
    };
  }
}
