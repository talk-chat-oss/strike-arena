import { supabaseAdmin } from "@/lib/supabase";
import { resolveTie, type LegResult } from "@/lib/tournament-engine";

/**
 * Resolve o confronto (1 ou 2 pernas) a que `stage`/`slot` pertence e, se decidido,
 * leva o vencedor para o confronto seguinte (e o perdedor da semi para a disputa de 3º).
 * Uso exclusivo no servidor (não é uma Server Action).
 */
export async function advanceKnockoutTie(
  tournamentId: string,
  stage: string,
  slot: number | null
): Promise<{
  state: "pending" | "needs_penalties" | "advanced" | "completed";
  winner?: string | null;
}> {
  if (stage === "group" || slot === null) return { state: "pending" };

  const { data: legs } = await supabaseAdmin
    .from("matches")
    .select("*")
    .eq("tournament_id", tournamentId)
    .eq("stage", stage)
    .eq("bracket_position", slot)
    .order("leg", { ascending: true });

  if (!legs || legs.length === 0) return { state: "pending" };

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

  const res = resolveTie(legResults);
  if (res.pending) return { state: "pending" };
  if (res.needsPenalties || !res.winner) return { state: "needs_penalties" };

  const lastLeg = legs[legs.length - 1];
  await supabaseAdmin
    .from("matches")
    .update({ winner_participant_id: res.winner })
    .eq("id", lastLeg.id);

  if (stage === "final") {
    await supabaseAdmin
      .from("tournaments")
      .update({ status: "completed" })
      .eq("id", tournamentId);
    return { state: "completed", winner: res.winner };
  }
  if (stage === "third_place") return { state: "advanced", winner: res.winner };

  const { data: tournament } = await supabaseAdmin
    .from("tournaments")
    .select("third_place_match")
    .eq("id", tournamentId)
    .single();

  const currentRound = legs[0].round as number;
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
          ? { home_participant_id: res.winner }
          : { away_participant_id: res.winner }
      )
      .eq("id", nl.id);
  }

  if (stage === "semifinal" && tournament?.third_place_match && res.loser) {
    await supabaseAdmin
      .from("matches")
      .update(
        slot === 1
          ? { home_participant_id: res.loser }
          : { away_participant_id: res.loser }
      )
      .eq("tournament_id", tournamentId)
      .eq("stage", "third_place");
  }

  return { state: "advanced", winner: res.winner };
}
