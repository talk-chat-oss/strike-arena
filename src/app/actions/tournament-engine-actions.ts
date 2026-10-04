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
} from "@/lib/tournament-engine";

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
          .select("id, stage, status")
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
      const ranked = gList.map((g) =>
        (standings ?? [])
          .filter((s) => s.group_id === g.id)
          .sort(
            (a, b) =>
              b.points - a.points ||
              b.goal_difference - a.goal_difference ||
              b.goals_for - a.goals_for ||
              b.wins - a.wins
          )
          .map((s) => s.participant_id as string)
      );
      const k = Math.max(1, t.qualified_per_group || 2);
      const seeds = crossGroupSeeds(ranked, k);
      await insertKnockout(t, seeds);
      message = `Mata-mata gerado com ${seeds.length} classificados.`;
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
