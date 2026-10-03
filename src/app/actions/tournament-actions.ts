"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { SUPER_ADMIN_ID, isSuperAdmin } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import {
  submitMatchScoreSchema,
  resolveMatchDisputeSchema,
  createTournamentSchema,
} from "@/lib/validations/tournament";

/**
 * Recalcula automaticamente a tabela de classificação (standings) do torneio
 * na instância isolada do Strike Arena (strike-arena-db).
 */
async function recalculateGroupStandings(tournamentId: string) {
  const [{ data: allParticipants }, { data: allMatches }] = await Promise.all([
    supabaseAdmin
      .from("participants")
      .select("id, group_id")
      .eq("tournament_id", tournamentId),
    supabaseAdmin
      .from("matches")
      .select("*")
      .eq("tournament_id", tournamentId),
  ]);

  if (!allParticipants || !allMatches) return;

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
      groupId: p.group_id,
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
      m.home_score === null ||
      m.away_score === null ||
      !m.home_participant_id ||
      !m.away_participant_id
    ) {
      continue;
    }

    const home = statsMap.get(m.home_participant_id);
    const away = statsMap.get(m.away_participant_id);
    if (!home || !away) continue;

    home.matchesPlayed += 1;
    away.matchesPlayed += 1;
    home.goalsFor += m.home_score;
    home.goalsAgainst += m.away_score;
    away.goalsFor += m.away_score;
    away.goalsAgainst += m.home_score;

    if (m.home_score > m.away_score) {
      home.wins += 1;
      home.points += 3;
      away.losses += 1;
    } else if (m.home_score < m.away_score) {
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
    await supabaseAdmin
      .from("standings")
      .update({
        points: st.points,
        matches_played: st.matchesPlayed,
        wins: st.wins,
        draws: st.draws,
        losses: st.losses,
        goals_for: st.goalsFor,
        goals_against: st.goalsAgainst,
        goal_difference: st.goalDifference,
        updated_at: new Date().toISOString(),
      })
      .eq("participant_id", participantId);
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
    const sessionUser = await getCurrentUser();
    const actorId = sessionUser?.id ?? rawInput.actorUserId;

    const { data: existingMatch, error: findErr } = await supabaseAdmin
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .maybeSingle();

    if (findErr || !existingMatch) {
      return { ok: false, error: "Partida não encontrada." };
    }

    const winnerId =
      homeScore > awayScore
        ? existingMatch.home_participant_id
        : awayScore > homeScore
        ? existingMatch.away_participant_id
        : null;

    // Super-Admin SPOOKY tem aprovação imediata se desejar
    const newStatus = requestWalkover
      ? "disputed"
      : isSuperAdmin(actorId) || sessionUser?.role === "organizer"
      ? "completed"
      : "awaiting_confirmation";

    const reporterLabel = sessionUser
      ? `[Reportado por ${sessionUser.nickname}] `
      : "";

    const { error: updErr } = await supabaseAdmin
      .from("matches")
      .update({
        home_score: homeScore,
        away_score: awayScore,
        winner_participant_id: winnerId,
        proof_url: proofUrl,
        notes: `${reporterLabel}${notes || "Placar reportado via Match Hub."}`,
        status: newStatus,
        played_at: new Date().toISOString(),
        reported_by_id: actorId ?? SUPER_ADMIN_ID,
      })
      .eq("id", matchId);

    if (updErr) throw new Error(updErr.message);

    if (newStatus === "completed") {
      await recalculateGroupStandings(existingMatch.tournament_id);
    }

    revalidatePath(`/tournaments/${tournamentSlug}`);
    revalidatePath("/organizer");
    revalidatePath("/");

    return {
      ok: true,
      status: newStatus,
      message:
        newStatus === "completed"
          ? "Placar homologado imediatamente e tabela de classificação atualizada!"
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
          : "Erro ao salvar resultado da partida.",
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
    const { data: existingMatch, error: findErr } = await supabaseAdmin
      .from("matches")
      .select("*")
      .eq("id", parsed.data.matchId)
      .maybeSingle();

    if (findErr || !existingMatch) {
      return { ok: false, error: "Partida não encontrada." };
    }

    let homeScore = existingMatch.home_score ?? 0;
    let awayScore = existingMatch.away_score ?? 0;
    let status: "completed" | "walkover" | "disputed" = "completed";
    let notes = existingMatch.notes ?? "";

    if (parsed.data.action === "walkover_home") {
      homeScore = 3;
      awayScore = 0;
      status = "walkover";
      notes = "W.O. (3×0 Mandante) homologado pela Diretoria da Liga.";
    } else if (parsed.data.action === "walkover_away") {
      homeScore = 0;
      awayScore = 3;
      status = "walkover";
      notes = "W.O. (0×3 Visitante) homologado pela Diretoria da Liga.";
    } else if (parsed.data.action === "dispute") {
      status = "disputed";
      notes = "Partida marcada sob contestação para auditoria de print.";
    } else {
      status = "completed";
      notes = "Placar homologado pela Diretoria da Liga.";
    }

    const winnerId =
      homeScore > awayScore
        ? existingMatch.home_participant_id
        : awayScore > homeScore
        ? existingMatch.away_participant_id
        : null;

    const { error: updErr } = await supabaseAdmin
      .from("matches")
      .update({
        home_score: homeScore,
        away_score: awayScore,
        winner_participant_id: winnerId,
        status,
        notes,
        played_at: new Date().toISOString(),
      })
      .eq("id", existingMatch.id);

    if (updErr) throw new Error(updErr.message);

    await recalculateGroupStandings(existingMatch.tournament_id);

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
      error:
        parsed.error.issues[0]?.message ?? "Verifique os campos do torneio.",
    };
  }

  try {
    const sessionUser = await getCurrentUser();
    const organizerId = sessionUser?.id ?? SUPER_ADMIN_ID;

    const { data: inserted, error } = await supabaseAdmin
      .from("tournaments")
      .insert({
        name: parsed.data.name,
        slug: parsed.data.slug,
        organizer_id: organizerId,
        game: parsed.data.game,
        platform: parsed.data.platform,
        format: parsed.data.format,
        status: "open",
        max_participants: parsed.data.maxParticipants,
        entry_fee_brl: parsed.data.entryFeeBrl,
        prize_pool_brl: parsed.data.prizePoolBrl,
        rules_markdown: parsed.data.rulesMarkdown,
        starts_at: new Date(Date.now() + 86400000).toISOString(),
      })
      .select()
      .single();

    if (error || !inserted) {
      throw new Error(error?.message ?? "Erro ao inserir torneio.");
    }

    // Criar Grupos A e B automaticamente
    await supabaseAdmin.from("tournament_groups").insert([
      {
        tournament_id: inserted.id,
        name: "Grupo A",
        code: "A",
        display_order: 1,
      },
      {
        tournament_id: inserted.id,
        name: "Grupo B",
        code: "B",
        display_order: 2,
      },
    ]);

    revalidatePath("/");
    revalidatePath("/organizer");

    return {
      ok: true,
      slug: inserted.slug,
      message: `Torneio "${inserted.name}" publicado com Grupos A & B prontos para inscrição!`,
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

/**
 * Inscreve o jogador logado no torneio, aloca automaticamente no Grupo A ou B
 * e cria seu registro na tabela de classificação (standings).
 */
export async function joinTournamentAction(input: {
  tournamentId: string;
  tournamentSlug: string;
  clubName: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      requireAuth: true,
      error: "Faça login ou crie sua conta para se inscrever neste torneio.",
    };
  }

  const club = input.clubName.trim();
  if (club.length < 2) {
    return { ok: false, error: "Informe o nome do seu Clube/Time." };
  }

  try {
    // Verificar se já está inscrito
    const { data: existing } = await supabaseAdmin
      .from("participants")
      .select("id")
      .eq("tournament_id", input.tournamentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      return {
        ok: false,
        error: `Você (${user.nickname}) já está inscrito neste torneio!`,
      };
    }

    // Buscar grupos do torneio (ou criar Grupo A e B se não existirem)
    let { data: groups } = await supabaseAdmin
      .from("tournament_groups")
      .select("*")
      .eq("tournament_id", input.tournamentId)
      .order("display_order", { ascending: true });

    if (!groups || groups.length === 0) {
      const { data: createdGroups } = await supabaseAdmin
        .from("tournament_groups")
        .insert([
          {
            tournament_id: input.tournamentId,
            name: "Grupo A",
            code: "A",
            display_order: 1,
          },
          {
            tournament_id: input.tournamentId,
            name: "Grupo B",
            code: "B",
            display_order: 2,
          },
        ])
        .select();
      groups = createdGroups ?? [];
    }

    // Contar participantes atuais para balancear entre Grupo A e Grupo B
    const { data: currentParts } = await supabaseAdmin
      .from("participants")
      .select("id, group_id")
      .eq("tournament_id", input.tournamentId);

    const totalCount = currentParts?.length ?? 0;
    const targetGroup =
      groups && groups.length > 0
        ? groups[totalCount % groups.length]
        : null;

    const { data: newParticipant, error: partErr } = await supabaseAdmin
      .from("participants")
      .insert({
        tournament_id: input.tournamentId,
        user_id: user.id,
        group_id: targetGroup?.id ?? null,
        seed: totalCount + 1,
        club_name: club,
        checkin_status: "checked_in",
        checked_in_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (partErr || !newParticipant) {
      throw new Error(partErr?.message ?? "Falha ao registrar inscrição.");
    }

    // Criar linha inicial na tabela de classificação (standings)
    await supabaseAdmin.from("standings").insert({
      tournament_id: input.tournamentId,
      group_id: targetGroup?.id ?? null,
      participant_id: newParticipant.id,
      points: 0,
      matches_played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
    });

    // Garantir que o jogador receba +500 Striker Coins no ato da inscrição
    const { data: existingClub } = await supabaseAdmin
      .from("club_teams")
      .select("id, balance")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existingClub) {
      const acronym =
        club
          .replace(/[^a-zA-Z0-9]/g, "")
          .slice(0, 3)
          .toUpperCase() || "CLB";

      const { data: createdClub } = await supabaseAdmin
        .from("club_teams")
        .insert({
          league_id: input.tournamentId,
          user_id: user.id,
          name: club,
          acronym,
          badge_url: club,
          balance: 500,
          is_delinquent: false,
        })
        .select("id")
        .single();

      if (createdClub?.id) {
        await supabaseAdmin.from("financial_transactions").insert({
          club_team_id: createdClub.id,
          type: "PREMIO_VITORIA",
          amount: 500,
          description:
            "Bônus de Inscrição Oficial: +500 Striker Coins creditadas no ato da inscrição.",
        });
      }
    } else {
      await supabaseAdmin
        .from("club_teams")
        .update({
          league_id: input.tournamentId,
          name: club,
          badge_url: club,
          balance: Number(existingClub.balance || 0) + 500,
        })
        .eq("id", existingClub.id);

      await supabaseAdmin.from("financial_transactions").insert({
        club_team_id: existingClub.id,
        type: "PREMIO_VITORIA",
        amount: 500,
        description:
          "Bônus de Inscrição Oficial: +500 Striker Coins creditadas no ato da inscrição.",
      });
    }

    revalidatePath(`/tournaments/${input.tournamentSlug}`);
    revalidatePath("/dashboard");
    revalidatePath("/market");
    revalidatePath("/auctions");
    revalidatePath("/");

    return {
      ok: true,
      message: `Inscrição confirmada! ${user.nickname} (${club}) alocado no ${
        targetGroup?.name ?? "Torneio"
      } e premiado com +500 Striker Coins!`,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Erro ao processar inscrição.",
    };
  }
}

export async function toggleCheckinAction(input: {
  participantId: string;
  tournamentSlug: string;
  currentStatus: string;
}) {
  try {
    const nextStatus =
      input.currentStatus === "checked_in" ? "pending" : "checked_in";

    const { error } = await supabaseAdmin
      .from("participants")
      .update({
        checkin_status: nextStatus,
        checked_in_at:
          nextStatus === "checked_in" ? new Date().toISOString() : null,
      })
      .eq("id", input.participantId);

    if (error) throw new Error(error.message);

    revalidatePath(`/tournaments/${input.tournamentSlug}`);
    return {
      ok: true,
      nextStatus,
      message:
        nextStatus === "checked_in"
          ? "Check-in pré-jogo confirmado!"
          : "Status alterado para Pendente.",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao atualizar check-in.",
    };
  }
}

export async function getMatchMessagesAction(matchId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("match_messages")
      .select("id, match_id, sender_id, content, created_at, sender:profiles!sender_id(nickname, role)")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];

    return data.map((row) => {
      const s = Array.isArray(row.sender) ? row.sender[0] : row.sender;
      return {
        id: row.id,
        matchId: row.match_id,
        senderNickname: s?.nickname ?? "Jogador",
        senderRole: s?.role ?? "player",
        content: row.content,
        createdAt: row.created_at,
      };
    });
  } catch {
    return [];
  }
}

export async function sendMatchMessageAction(input: {
  matchId: string;
  tournamentSlug: string;
  content: string;
}) {
  const user = await getCurrentUser();
  const senderId = user?.id ?? SUPER_ADMIN_ID;
  const text = input.content.trim();

  if (!text) {
    return { ok: false, error: "Digite uma mensagem." };
  }

  try {
    const { error } = await supabaseAdmin.from("match_messages").insert({
      match_id: input.matchId,
      sender_id: senderId,
      content: text,
    });

    if (error) throw new Error(error.message);

    revalidatePath(`/tournaments/${input.tournamentSlug}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao enviar mensagem.",
    };
  }
}
