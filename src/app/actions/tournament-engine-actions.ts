"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { isSuperAdmin } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import {
  STAGE_LABELS,
  buildBracket,
  crossGroupSeeds,
  isBye,
  roundRobin,
  shuffle,
  sortStandingsWithTiebreakers,
} from "@/lib/tournament-engine";
import { propagateKnockoutWinner } from "@/lib/tournament-advance";

interface TournamentRow {
  id: string;
  slug: string;
  format: "round_robin" | "single_elimination" | "double_elimination" | "groups_playoffs";
  organizer_id: string;
  legs_per_round: number;
  final_two_legs: boolean;
  third_place_match: boolean;
  group_turns: number;
  qualified_per_group: number;
}

async function insertKnockout(t: TournamentRow, seeds: string[]) {
  const ties = buildBracket(seeds);
  const totalRounds = Math.max(...ties.map((x) => x.round));
  const rows: Record<string, unknown>[] = [];

  for (const tie of ties) {
    if (isBye(tie)) continue;
    const legsCount =
      tie.stage === "final"
        ? t.final_two_legs
          ? 2
          : 1
        : t.legs_per_round === 2
        ? 2
        : 1;
    const tiesInRound = ties.filter((x) => x.round === tie.round).length;
    for (let leg = 1; leg <= legsCount; leg++) {
      const base = STAGE_LABELS[tie.stage];
      const label =
        `${base}${tiesInRound > 1 ? ` ${tie.slot}` : ""}` +
        (legsCount > 1 ? ` · ${leg === 1 ? "Ida" : "Volta"}` : "");
      rows.push({
        tournament_id: t.id,
        stage: tie.stage,
        round: tie.round,
        bracket_position: tie.slot,
        leg,
        label,
        home_participant_id: leg === 1 ? tie.home : tie.away,
        away_participant_id: leg === 1 ? tie.away : tie.home,
        status: "scheduled",
      });
    }
  }

  if (t.third_place_match && totalRounds >= 2) {
    rows.push({
      tournament_id: t.id,
      stage: "third_place",
      round: totalRounds,
      bracket_position: 1,
      leg: 1,
      label: STAGE_LABELS.third_place,
      status: "scheduled",
    });
  }

  const { error } = await supabaseAdmin.from("matches").insert(rows);
  if (error) throw new Error(error.message);
}

/**
 * Gera os jogos do torneio conforme o formato e a fase atual:
 * - Liga / Grupos: gera as rodadas (algoritmo do círculo).
 * - Mata-mata: sorteia/ordena seeds e gera a chave completa (ida e volta conforme config).
 * - Grupos + Playoffs: após encerrar os grupos, chama novamente para gerar a chave.
 */
export async function generateTournamentFixturesAction(input: {
  tournamentSlug: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Faça login para gerar os jogos." };

    const { data: tRow } = await supabaseAdmin
      .from("tournaments")
      .select("*")
      .eq("slug", input.tournamentSlug)
      .maybeSingle();
    if (!tRow) return { ok: false, error: "Torneio não encontrado." };
    const t = tRow as TournamentRow;

    if (
      !isSuperAdmin(user.id) &&
      user.id !== t.organizer_id &&
      user.role !== "organizer"
    ) {
      return { ok: false, error: "Apenas o organizador pode gerar os jogos." };
    }

    const [{ data: participants }, { data: groups }, { data: existing }] =
      await Promise.all([
        supabaseAdmin
          .from("participants")
          .select("id, group_id, seed")
          .eq("tournament_id", t.id),
        supabaseAdmin
          .from("tournament_groups")
          .select("id, display_order")
          .eq("tournament_id", t.id)
          .order("display_order", { ascending: true }),
        supabaseAdmin
          .from("matches")
          .select("id, stage, status, home_participant_id, away_participant_id, home_score, away_score")
          .eq("tournament_id", t.id),
      ]);

    const pList = participants ?? [];
    const gList = groups ?? [];
    const mList = existing ?? [];
    const hasGroupMatches = mList.some((m) => m.stage === "group");
    const hasKnockout = mList.some((m) => m.stage !== "group");
    const turns = t.group_turns === 2 ? 2 : 1;

    if (t.format === "double_elimination") {
      return {
        ok: false,
        error: "Eliminação dupla ainda não está disponível. Use Mata-Mata ou Grupos + Playoffs.",
      };
    }

    let message = "";

    if (t.format === "round_robin") {
      if (mList.length > 0) return { ok: false, error: "Os jogos já foram gerados." };
      if (pList.length < 2) return { ok: false, error: "Mínimo de 2 participantes." };
      const groupId = gList[0]?.id ?? null;
      if (groupId) {
        await supabaseAdmin
          .from("participants")
          .update({ group_id: groupId })
          .eq("tournament_id", t.id);
        await supabaseAdmin
          .from("standings")
          .update({ group_id: groupId })
          .eq("tournament_id", t.id);
      }
      const fixtures = roundRobin(
        shuffle(pList.map((p) => p.id)),
        turns as 1 | 2
      );
      const { error } = await supabaseAdmin.from("matches").insert(
        fixtures.map((f) => ({
          tournament_id: t.id,
          group_id: groupId,
          stage: "group",
          round: f.round,
          label: `Rodada ${f.round}`,
          home_participant_id: f.home,
          away_participant_id: f.away,
          status: "scheduled",
        }))
      );
      if (error) throw new Error(error.message);
      message = `Liga gerada: ${fixtures.length} jogos em ${
        Math.max(...fixtures.map((f) => f.round))
      } rodadas.`;
    } else if (t.format === "groups_playoffs" && !hasGroupMatches) {
      if (gList.length < 2) return { ok: false, error: "O torneio precisa de ao menos 2 grupos." };
      if (pList.length < gList.length * 2) {
        return { ok: false, error: `Mínimo de ${gList.length * 2} participantes para ${gList.length} grupos.` };
      }
      // Distribui quem ainda não tem grupo, equilibrando os tamanhos
      const counts = new Map(gList.map((g) => [g.id, 0]));
      for (const p of pList) {
        if (p.group_id && counts.has(p.group_id)) {
          counts.set(p.group_id, (counts.get(p.group_id) ?? 0) + 1);
        }
      }
      for (const p of shuffle(pList.filter((x) => !x.group_id || !counts.has(x.group_id)))) {
        const [target] = [...counts.entries()].sort((a, b) => a[1] - b[1])[0];
        counts.set(target, (counts.get(target) ?? 0) + 1);
        p.group_id = target;
        await supabaseAdmin.from("participants").update({ group_id: target }).eq("id", p.id);
        await supabaseAdmin.from("standings").update({ group_id: target }).eq("participant_id", p.id);
      }
      const rows: Record<string, unknown>[] = [];
      for (const g of gList) {
        const ids = shuffle(pList.filter((p) => p.group_id === g.id).map((p) => p.id));
        for (const f of roundRobin(ids, turns as 1 | 2)) {
          rows.push({
            tournament_id: t.id,
            group_id: g.id,
            stage: "group",
            round: f.round,
            label: `Rodada ${f.round}`,
            home_participant_id: f.home,
            away_participant_id: f.away,
            status: "scheduled",
          });
        }
      }
      const { error } = await supabaseAdmin.from("matches").insert(rows);
      if (error) throw new Error(error.message);
      message = `Fase de grupos gerada: ${rows.length} jogos.`;
    } else if (t.format === "groups_playoffs" && !hasKnockout) {
      const pendingGroup = mList.filter(
        (m) =>
          m.stage === "group" &&
          m.status !== "completed" &&
          m.status !== "walkover"
      );
      if (pendingGroup.length > 0) {
        return {
          ok: false,
          error: `Ainda há ${pendingGroup.length} jogo(s) da fase de grupos sem resultado homologado.`,
        };
      }
      const { data: standings } = await supabaseAdmin
        .from("standings")
        .select("participant_id, group_id, points, goal_difference, goals_for, wins")
        .eq("tournament_id", t.id);

      const directEntries = mList.map((m) => ({
        homeParticipantId: m.home_participant_id ?? "",
        awayParticipantId: m.away_participant_id ?? "",
        homeScore: m.home_score ?? null,
        awayScore: m.away_score ?? null,
        status: m.status,
        stage: m.stage,
      }));

      const ranked = gList.map((g) => {
        const groupRows = (standings ?? [])
          .filter((s) => s.group_id === g.id)
          .map((s) => ({
            participantId: s.participant_id as string,
            points: s.points as number,
            wins: s.wins as number,
            goalDifference: s.goal_difference as number,
            goalsFor: s.goals_for as number,
          }));
        return sortStandingsWithTiebreakers(groupRows, directEntries).map(
          (s) => s.participantId
        );
      });
      const k = Math.max(1, t.qualified_per_group || 2);
      const seeds = crossGroupSeeds(ranked, k);
      await insertKnockout(t, seeds);
      message = `Mata-mata gerado com ${seeds.length} classificados (Pontos → Vitórias → Saldo → Gols Feitos → Confronto Direto).`;
    } else if (t.format === "single_elimination" && mList.length === 0) {
      if (pList.length < 2) return { ok: false, error: "Mínimo de 2 participantes." };
      const allSeeded = pList.every((p) => p.seed !== null && p.seed !== undefined);
      const ordered = allSeeded
        ? [...pList].sort((a, b) => (a.seed as number) - (b.seed as number))
        : shuffle(pList);
      await insertKnockout(t, ordered.map((p) => p.id));
      message = `Chave gerada com ${pList.length} participantes${
        t.legs_per_round === 2 ? " (ida e volta)" : ""
      }.`;
    } else {
      return { ok: false, error: "Os jogos desta fase já foram gerados." };
    }

    await supabaseAdmin
      .from("tournaments")
      .update({ status: "in_progress" })
      .eq("id", t.id);

    revalidatePath(`/tournaments/${t.slug}`);
    revalidatePath("/organizer");
    return { ok: true, message };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao gerar jogos.",
    };
  }
}

/**
 * Permite que o ADM/Organizador passe quem ganhou no confronto (ex: após o 3º jogo extra com
 * Prorrogação + Pênaltis enviado ao ADM) e avance o vencedor automaticamente na chave.
 */
export async function adminAdvanceTieWinnerAction(input: {
  tournamentSlug: string;
  stage: string;
  slot: number;
  winnerParticipantId: string;
}) {
  try {
    const user = await getCurrentUser();
    const { data: tRow } = await supabaseAdmin
      .from("tournaments")
      .select("id, organizer_id, slug")
      .eq("slug", input.tournamentSlug)
      .maybeSingle();

    if (!tRow) return { ok: false, error: "Torneio não encontrado." };

    if (
      user &&
      !isSuperAdmin(user.id) &&
      user.id !== tRow.organizer_id &&
      user.role !== "organizer"
    ) {
      return {
        ok: false,
        error: "Apenas a Diretoria/ADM pode avançar manualmente um classificado.",
      };
    }

    const { data: legs } = await supabaseAdmin
      .from("matches")
      .select("*")
      .eq("tournament_id", tRow.id)
      .eq("stage", input.stage)
      .eq("bracket_position", input.slot)
      .order("leg", { ascending: true });

    if (!legs || legs.length === 0) {
      return { ok: false, error: "Confronto não encontrado." };
    }

    const first = legs[0];
    const last = legs[legs.length - 1];
    const loserId =
      first.home_participant_id === input.winnerParticipantId
        ? first.away_participant_id
        : first.home_participant_id;

    await supabaseAdmin
      .from("matches")
      .update({
        status: "completed",
        winner_participant_id: input.winnerParticipantId,
        notes:
          "Classificado homologado pela ADM após desempate (Prorrogação + Pênaltis).",
        played_at: new Date().toISOString(),
      })
      .eq("id", last.id);

    const res = await propagateKnockoutWinner(
      tRow.id,
      input.stage,
      input.slot,
      first.round as number,
      input.winnerParticipantId,
      loserId,
      last.id
    );

    revalidatePath(`/tournaments/${tRow.slug}`);
    revalidatePath("/organizer");
    revalidatePath("/");

    return {
      ok: true,
      message:
        res.state === "completed"
          ? "Campeão da Grande Final consagrado pela ADM!"
          : "Classificado avançado automaticamente para a próxima fase pela ADM!",
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Erro ao avançar classificado.",
    };
  }
}

export interface UserRoleItem {
  id: string;
  nickname: string;
  email: string;
  role: "player" | "organizer" | "super_admin";
}

export async function listUsersWithRolesAction(): Promise<UserRoleItem[]> {
  try {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("id, nickname, email, role")
      .order("created_at", { ascending: true });

    return (data ?? []).map((u) => ({
      id: u.id as string,
      nickname: (u.nickname as string) ?? "Jogador",
      email: (u.email as string) ?? "",
      role: (u.role as UserRoleItem["role"]) ?? "player",
    }));
  } catch {
    return [];
  }
}

export async function updateUserRoleAction(input: {
  targetUserId: string;
  newRole: "player" | "organizer" | "super_admin";
}) {
  try {
    const actor = await getCurrentUser();
    if (
      actor &&
      !actor.isSuperAdmin &&
      actor.role !== "super_admin" &&
      actor.role !== "organizer"
    ) {
      return {
        ok: false,
        error: "Apenas ADMs podem alterar cargos de usuários.",
      };
    }

    if (
      isSuperAdmin(input.targetUserId) &&
      input.newRole !== "super_admin"
    ) {
      return {
        ok: false,
        error: "O Super-Admin principal (SPOOKY) possui imunidade permanente.",
      };
    }

    const { data: updated, error } = await supabaseAdmin
      .from("profiles")
      .update({ role: input.newRole })
      .eq("id", input.targetUserId)
      .select("id, nickname, role")
      .single();

    if (error || !updated) {
      throw new Error(error?.message ?? "Usuário não encontrado.");
    }

    if (input.newRole === "super_admin" || input.newRole === "organizer") {
      await supabaseAdmin
        .from("club_teams")
        .update({
          league_pass_expires_at: "2099-12-31T23:59:59.000Z",
          league_pass_mode: "ADMIN_GRANTED",
          is_delinquent: false,
        })
        .eq("user_id", input.targetUserId);
    }

    revalidatePath("/organizer");
    revalidatePath("/dashboard");
    revalidatePath("/");

    const roleLabel =
      input.newRole === "super_admin"
        ? "ADM Geral (Super-Admin)"
        : input.newRole === "organizer"
        ? "Organizador / Arbitragem"
        : "Jogador";

    return {
      ok: true,
      message: `Cargo de ${updated.nickname} atualizado para ${roleLabel}!`,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Erro ao atualizar cargo.",
    };
  }
}

export interface UserWithClubItem {
  id: string;
  nickname: string;
  email: string;
  role: "player" | "organizer" | "super_admin";
  clubName: string;
}

export async function listAllUsersWithClubsAction(): Promise<UserWithClubItem[]> {
  try {
    const [{ data: profiles }, { data: clubs }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, nickname, email, role")
        .order("nickname", { ascending: true }),
      supabaseAdmin
        .from("club_teams")
        .select("user_id, name, badge_url"),
    ]);

    const clubMap = new Map<string, string>();
    for (const c of clubs ?? []) {
      if (c.user_id) {
        clubMap.set(
          String(c.user_id),
          String(c.badge_url || c.name || "Real Madrid")
        );
      }
    }

    return (profiles ?? []).map((u) => ({
      id: String(u.id),
      nickname: String(u.nickname ?? "Jogador"),
      email: String(u.email ?? ""),
      role: (u.role as UserWithClubItem["role"]) ?? "player",
      clubName: clubMap.get(String(u.id)) ?? "Real Madrid",
    }));
  } catch {
    return [];
  }
}

export async function adminAddParticipantAction(input: {
  tournamentId: string;
  tournamentSlug: string;
  targetUserId: string;
  clubName?: string;
  groupCode?: "AUTO" | "A" | "B";
}) {
  try {
    const actor = await getCurrentUser();
    if (
      actor &&
      !actor.isSuperAdmin &&
      actor.role !== "super_admin" &&
      actor.role !== "organizer"
    ) {
      return {
        ok: false,
        error: "Apenas ADMs e Organizadores podem escalar jogadores nos torneios.",
      };
    }

    const { data: targetUser } = await supabaseAdmin
      .from("profiles")
      .select("id, nickname, email")
      .eq("id", input.targetUserId)
      .maybeSingle();

    if (!targetUser) {
      return { ok: false, error: "Jogador selecionado não encontrado." };
    }

    const { data: existing } = await supabaseAdmin
      .from("participants")
      .select("id")
      .eq("tournament_id", input.tournamentId)
      .eq("user_id", targetUser.id)
      .maybeSingle();

    if (existing) {
      return {
        ok: false,
        error: `O jogador ${targetUser.nickname} já está escalado neste torneio!`,
      };
    }

    const { data: userClub } = await supabaseAdmin
      .from("club_teams")
      .select("id, name, badge_url")
      .eq("user_id", targetUser.id)
      .maybeSingle();

    const chosenClub =
      input.clubName?.trim() ||
      userClub?.badge_url ||
      userClub?.name ||
      `${targetUser.nickname} FC`;

    if (!userClub) {
      const acronym =
        chosenClub
          .replace(/[^a-zA-Z0-9]/g, "")
          .slice(0, 3)
          .toUpperCase() || "CLB";

      await supabaseAdmin.from("club_teams").insert({
        league_id: input.tournamentId,
        user_id: targetUser.id,
        name: chosenClub,
        acronym,
        badge_url: chosenClub,
        balance: 500,
        is_delinquent: false,
        league_pass_expires_at: "2099-12-31T23:59:59.000Z",
        league_pass_mode: "ADMIN_GRANTED",
      });
    } else {
      await supabaseAdmin
        .from("club_teams")
        .update({
          league_pass_expires_at: "2099-12-31T23:59:59.000Z",
          league_pass_mode: "ADMIN_GRANTED",
          is_delinquent: false,
        })
        .eq("id", userClub.id);
    }

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

    const { data: currentParts } = await supabaseAdmin
      .from("participants")
      .select("id, group_id")
      .eq("tournament_id", input.tournamentId);

    const totalCount = currentParts?.length ?? 0;

    let targetGroup =
      groups && groups.length > 0
        ? groups[totalCount % groups.length]
        : null;

    if (input.groupCode && input.groupCode !== "AUTO" && groups) {
      const found = groups.find((g) => g.code === input.groupCode);
      if (found) targetGroup = found;
    }

    const { data: newParticipant, error: partErr } = await supabaseAdmin
      .from("participants")
      .insert({
        tournament_id: input.tournamentId,
        user_id: targetUser.id,
        group_id: targetGroup?.id ?? null,
        seed: totalCount + 1,
        club_name: chosenClub,
        checkin_status: "checked_in",
        checked_in_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (partErr || !newParticipant) {
      throw new Error(partErr?.message ?? "Falha ao adicionar participante.");
    }

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

    revalidatePath(`/tournaments/${input.tournamentSlug}`);
    revalidatePath("/organizer");
    revalidatePath("/");

    return {
      ok: true,
      message: `Jogador ${targetUser.nickname} (${chosenClub}) escalado pela ADM no ${
        targetGroup?.name ?? "Torneio"
      }!`,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Erro ao adicionar participante.",
    };
  }
}

export async function adminRemoveParticipantAction(input: {
  participantId: string;
  tournamentSlug: string;
}) {
  try {
    const actor = await getCurrentUser();
    if (
      actor &&
      !actor.isSuperAdmin &&
      actor.role !== "super_admin" &&
      actor.role !== "organizer"
    ) {
      return {
        ok: false,
        error: "Apenas ADMs podem remover jogadores do torneio.",
      };
    }

    await supabaseAdmin
      .from("standings")
      .delete()
      .eq("participant_id", input.participantId);

    const { error } = await supabaseAdmin
      .from("participants")
      .delete()
      .eq("id", input.participantId);

    if (error) throw new Error(error.message);

    revalidatePath(`/tournaments/${input.tournamentSlug}`);
    revalidatePath("/organizer");
    revalidatePath("/");

    return {
      ok: true,
      message: "Participante removido do torneio pela ADM.",
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Erro ao remover participante.",
    };
  }
}


