import { supabaseAdmin } from "@/lib/supabase";
import {
  STAGE_LABELS,
  resolveTie,
  type KnockoutStage,
  type LegResult,
} from "@/lib/tournament-engine";

export type AdvanceState =
  | "pending"
  | "extra_match_created"
  | "needs_penalties"
  | "advanced"
  | "completed";

/**
 * Propaga um vencedor já definido (`winnerId`) do confronto `(stage, slot)`
 * para a próxima fase da chave (e o perdedor da semifinal para o 3º lugar).
 */
export async function propagateKnockoutWinner(
  tournamentId: string,
  stage: string,
  slot: number,
  currentRound: number,
  winnerId: string,
  loserId: string | null,
  lastLegId: string
): Promise<{ state: "advanced" | "completed"; winner: string }> {
  await supabaseAdmin
    .from("matches")
    .update({ winner_participant_id: winnerId })
    .eq("id", lastLegId);

  if (stage === "final") {
    await supabaseAdmin
      .from("tournaments")
      .update({ status: "completed" })
      .eq("id", tournamentId);
    return { state: "completed", winner: winnerId };
  }
  if (stage === "third_place") {
    return { state: "advanced", winner: winnerId };
  }

  const { data: tournament } = await supabaseAdmin
    .from("tournaments")
    .select("third_place_match")
    .eq("id", tournamentId)
    .single();

  const nextSlot = Math.ceil(slot / 2);
  const winnerIsHomeSide = slot % 2 === 1;

  const { data: nextLegs } = await supabaseAdmin
    .from("matches")
    .select("id, leg, stage")
    .eq("tournament_id", tournamentId)
    .eq("round", currentRound + 1)
    .eq("bracket_position", nextSlot)
    .neq("stage", "third_place");

  for (const nl of nextLegs ?? []) {
    const isFirstLeg = (nl.leg ?? 1) === 1;
    const putAsHome = winnerIsHomeSide ? isFirstLeg : !isFirstLeg;
    await supabaseAdmin
      .from("matches")
      .update(
        putAsHome
          ? { home_participant_id: winnerId }
          : { away_participant_id: winnerId }
      )
      .eq("id", nl.id);
  }

  if (stage === "semifinal" && tournament?.third_place_match && loserId) {
    await supabaseAdmin
      .from("matches")
      .update(
        slot === 1
          ? { home_participant_id: loserId }
          : { away_participant_id: loserId }
      )
      .eq("tournament_id", tournamentId)
      .eq("stage", "third_place");
  }

  return { state: "advanced", winner: winnerId };
}

/**
 * Resolve o confronto (1 ou 2 pernas + eventual 3º jogo extra) a que `stage`/`slot` pertence:
 * - Se Ida + Volta empatarem na soma de gols, cria automaticamente o 3º Jogo Extra
 *   ("Jogo Desempate · Prorrogação + Pênaltis") para os jogadores criarem a sala com prorrogação/pênaltis.
 * - Quando decidido (gols ou pênaltis), avança o vencedor automaticamente para a próxima fase.
 */
export async function advanceKnockoutTie(
  tournamentId: string,
  stage: string,
  slot: number | null
): Promise<{
  state: AdvanceState;
  winner?: string | null;
}> {
  if (stage === "group" || slot === null) return { state: "pending" };

  const [{ data: legs }, { data: tournament }] = await Promise.all([
    supabaseAdmin
      .from("matches")
      .select("*")
      .eq("tournament_id", tournamentId)
      .eq("stage", stage)
      .eq("bracket_position", slot)
      .order("leg", { ascending: true }),
    supabaseAdmin
      .from("tournaments")
      .select("legs_per_round, final_two_legs")
      .eq("id", tournamentId)
      .single(),
  ]);

  if (!legs || legs.length === 0) return { state: "pending" };

  const expectedLegs: 1 | 2 =
    stage === "final" || stage === "third_place"
      ? tournament?.final_two_legs && stage === "final"
        ? 2
        : 1
      : tournament?.legs_per_round === 2
      ? 2
      : 1;

  const legResults: LegResult[] = legs.map((m) => ({
    leg: m.leg ?? 1,
    home: m.home_participant_id,
    away: m.away_participant_id,
    homeScore: m.home_score,
    awayScore: m.away_score,
    homePenalties: m.home_penalties,
    awayPenalties: m.away_penalties,
    done:
      (m.status === "completed" || m.status === "walkover") &&
      m.home_score !== null &&
      m.away_score !== null,
  }));

  const res = resolveTie(legResults, expectedLegs);
  if (res.pending) return { state: "pending" };

  // Empate na soma de gols após Ida e Volta -> gera automaticamente o 3º Jogo Extra (Prorrogação + Pênaltis)
  if (res.needsExtraMatch && !legs.some((l) => (l.leg ?? 1) === 3)) {
    const first = legs[0];
    const stageName =
      STAGE_LABELS[stage as KnockoutStage | "third_place"] ?? "Mata-Mata";
    await supabaseAdmin.from("matches").insert({
      tournament_id: tournamentId,
      stage,
      round: first.round,
      bracket_position: slot,
      leg: 3,
      label: `${stageName} #${slot} · Jogo Extra (Prorrogação + Pênaltis)`,
      home_participant_id: first.home_participant_id,
      away_participant_id: first.away_participant_id,
      notes:
        "Empate na soma de gols (Ida + Volta). Criar sala com Prorrogação + Pênaltis ativados e enviar resultado ao ADM.",
      status: "scheduled",
    });
    return { state: "extra_match_created" };
  }

  if (res.needsPenalties || !res.winner) return { state: "needs_penalties" };

  const lastLeg = legs[legs.length - 1];
  return propagateKnockoutWinner(
    tournamentId,
    stage,
    slot,
    legs[0].round as number,
    res.winner,
    res.loser,
    lastLeg.id
  );
}
