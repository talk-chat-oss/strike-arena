"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import {
  getMasterLeagueOverviewData,
  computeHeadToHeadBetweenClubs,
  formatEscudos,
  type MasterGoalScorerDTO,
} from "@/lib/master-league-data";

function revalidateMasterLeaguePaths() {
  revalidatePath("/market");
  revalidatePath("/auctions");
  revalidatePath("/transfers");
  revalidatePath("/dashboard");
  revalidatePath("/players");
  revalidatePath("/store/escudos");
}

/**
 * 1. MULTA RESCISÓRIA ("ROUBO DE JOGADOR") EM ESCUDOS
 */
export async function payBuyoutClauseAction(input: {
  contractId: string;
  buyerClubId: string;
}) {
  if (!input.contractId || !input.buyerClubId) {
    return {
      ok: false,
      error: "Selecione o contrato do atleta e o seu clube comprador.",
    };
  }

  try {
    const { data, error } = await supabaseAdmin.rpc("rpc_pay_buyout_clause", {
      p_contract_id: input.contractId,
      p_buyer_club_id: input.buyerClubId,
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidateMasterLeaguePaths();

    const res = data as {
      athleteName: string;
      buyoutPaid: number;
      buyerNewBalance: number;
      sellerName: string;
    };

    return {
      ok: true,
      message: `🚨 ROUBO DE ELENCO CONFIRMADO! Multa rescisória de ${formatEscudos(
        res.buyoutPaid
      )} paga à vista ao ${res.sellerName}. ${
        res.athleteName
      } agora faz parte do seu elenco!`,
      data: res,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Erro ao executar pagamento de multa rescisória.",
    };
  }
}

/**
 * 2. SISTEMA DE LEILÃO COM INCREMENTO DE 5 EM 5 ESCUDOS, ESCROW E ANTI-SNIPER (+2 MINUTOS)
 */
export async function placeAuctionBidAction(input: {
  auctionId: string;
  bidderClubId: string;
  bidAmount: number;
}) {
  if (!input.auctionId || !input.bidderClubId || input.bidAmount <= 0) {
    return { ok: false, error: "Informe um valor de lance válido em Escudos." };
  }

  try {
    const { data, error } = await supabaseAdmin.rpc("rpc_place_auction_bid", {
      p_auction_id: input.auctionId,
      p_bidder_club_id: input.bidderClubId,
      p_bid_amount: Math.round(input.bidAmount),
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidateMasterLeaguePaths();

    const res = data as {
      athleteName: string;
      newBid: number;
      endsAt: string;
      antiSniperTriggered: boolean;
      bidderNewBalance: number;
    };

    return {
      ok: true,
      antiSniperTriggered: res.antiSniperTriggered,
      endsAt: res.endsAt,
      message: res.antiSniperTriggered
        ? `⚡ LANCE REGISTRADO + ANTI-SNIPER ATIVADO! Lance de ${formatEscudos(
            res.newBid
          )} em ${
            res.athleteName
          } nos últimos 2 minutos prorrogou o término em +02:00!`
        : `✅ Lance de ${formatEscudos(res.newBid)} registrado em ${
            res.athleteName
          }! Escudos reservados em Custódia (Escrow) e competidor anterior estornado.`,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Não foi possível registrar o lance no leilão.",
    };
  }
}

/**
 * 3. AGENDAMENTO PRÉVIO DE LEILÃO PELO ORGANIZADOR (DATA E HORA MARCADAS)
 */
export async function scheduleAuctionAction(input: {
  athleteId: string;
  startingBid: number;
  minIncrement?: number;
  startsAtIso: string;
  endsAtIso: string;
  sellerClubId?: string | null;
}) {
  if (!input.athleteId) {
    return { ok: false, error: "Selecione um atleta para o leilão." };
  }

  const startsMs = new Date(input.startsAtIso).getTime();
  const endsMs = new Date(input.endsAtIso).getTime();

  if (isNaN(startsMs) || isNaN(endsMs) || endsMs <= startsMs) {
    return {
      ok: false,
      error: "A data/hora de término deve ser posterior ao início do leilão.",
    };
  }

  const startingBid = Math.max(10, Math.round(input.startingBid || 100));
  const minIncrement = Math.max(5, Math.round(input.minIncrement || 5));
  const isUpcoming = startsMs > Date.now() + 15000;

  try {
    const { data: ath } = await supabaseAdmin
      .from("athletes")
      .select("name")
      .eq("id", input.athleteId)
      .maybeSingle();

    const { error } = await supabaseAdmin.from("auctions").insert({
      athlete_id: input.athleteId,
      seller_club_id: input.sellerClubId ?? null,
      starting_bid: startingBid,
      current_bid: startingBid,
      min_increment: minIncrement,
      current_winning_club_id: null,
      starts_at: new Date(startsMs).toISOString(),
      ends_at: new Date(endsMs).toISOString(),
      status: isUpcoming ? "AGENDADO" : "ATIVO",
    });

    if (error) throw new Error(error.message);

    revalidateMasterLeaguePaths();

    return {
      ok: true,
      message: isUpcoming
        ? `📅 Leilão agendado com sucesso para ${
            ath?.name ?? "Atleta"
          }! Lance mínimo: ${formatEscudos(
            startingBid
          )} (incremento de ${minIncrement} em ${minIncrement} Escudos).`
        : `🔥 Leilão de ${
            ath?.name ?? "Atleta"
          } iniciado imediatamente com lance mínimo de ${formatEscudos(
            startingBid
          )}!`,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Erro ao agendar evento de leilão.",
    };
  }
}

/**
 * 4. COMPRA / RECARGA DE PACOTE DE ESCUDOS (CONFIRMAÇÃO INSTANTÂNEA AUDITÁVEL)
 */
export async function purchaseEscudosPackageAction(input: {
  clubTeamId: string;
  packageId: string;
  paymentMethod?: "PIX" | "CARTAO";
}) {
  if (!input.clubTeamId || !input.packageId) {
    return {
      ok: false,
      error: "Selecione o clube destinatário e o pacote de Escudos.",
    };
  }

  try {
    const { data, error } = await supabaseAdmin.rpc(
      "rpc_purchase_escudos_package",
      {
        p_club_team_id: input.clubTeamId,
        p_package_id: input.packageId,
        p_payment_method: input.paymentMethod ?? "PIX",
        p_external_ref: `STRIKE-${Date.now().toString(36).toUpperCase()}`,
      }
    );

    if (error) throw new Error(error.message);

    revalidateMasterLeaguePaths();

    const res = data as {
      clubName: string;
      packageName: string;
      escudosCredited: number;
      newBalance: number;
    };

    return {
      ok: true,
      message: `🛡️ PAGAMENTO CONFIRMADO! +${formatEscudos(
        res.escudosCredited
      )} creditados instantaneamente na carteira do ${
        res.clubName
      }. Novo saldo: ${formatEscudos(res.newBalance)}!`,
      data: res,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Erro ao processar recarga de Escudos.",
    };
  }
}

/**
 * 5. FOLHA SALARIAL E ENCERRAMENTO DE TEMPORADA EM ESCUDOS
 */
export async function processSeasonPayrollAction(input?: {
  clubTeamId?: string;
}) {
  try {
    const { data, error } = await supabaseAdmin.rpc(
      "rpc_process_season_payroll",
      {
        p_club_team_id: input?.clubTeamId ?? null,
      }
    );

    if (error) throw new Error(error.message);

    revalidateMasterLeaguePaths();

    const res = data as {
      processedClubs: number;
      delinquentClubs: number;
    };

    return {
      ok: true,
      message:
        res.delinquentClubs > 0
          ? `Folha salarial debitada em ${res.processedClubs} clube(s). ⚠️ ${res.delinquentClubs} clube(s) entraram em INADIMPLÊNCIA (saldo negativo em Escudos)!`
          : `Folha salarial de fim de temporada processada em Escudos para ${res.processedClubs} clube(s)! Todos os clubes estão regulares.`,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Erro ao processar folha salarial da temporada.",
    };
  }
}

/**
 * 6. AJUSTAR SALÁRIO E MULTA RESCISÓRIA PROPORCIONAL (10x SALÁRIO) EM ESCUDOS
 */
export async function updateContractSalaryAction(input: {
  contractId: string;
  newSalary: number;
}) {
  if (!input.contractId || input.newSalary < 10) {
    return {
      ok: false,
      error: "O salário mínimo permitido na Master Liga é de 10 Escudos.",
    };
  }

  const salary = Math.round(input.newSalary);
  const buyoutClause = salary * 10;

  try {
    const { error } = await supabaseAdmin
      .from("contracts")
      .update({
        salary,
        buyout_clause: buyoutClause,
      })
      .eq("id", input.contractId);

    if (error) throw new Error(error.message);

    revalidateMasterLeaguePaths();

    return {
      ok: true,
      message: `Salário atualizado para ${formatEscudos(
        salary
      )} e Multa Rescisória recalculada para ${formatEscudos(buyoutClause)}!`,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Erro ao ajustar salário do atleta.",
    };
  }
}

/**
 * 7. LISTAR JOGADOR DO ELENCO NO LEILÃO ABERTO (EM ESCUDOS)
 */
export async function listAthleteOnAuctionAction(input: {
  contractId: string;
  startingBid: number;
  durationMinutes?: number;
}) {
  try {
    const { data: contract, error: findErr } = await supabaseAdmin
      .from("contracts")
      .select("*, athlete:athletes!athlete_id(name)")
      .eq("id", input.contractId)
      .maybeSingle();

    if (findErr || !contract) {
      return { ok: false, error: "Contrato não encontrado no elenco." };
    }

    const mins = input.durationMinutes ?? 30;
    const endsAt = new Date(Date.now() + mins * 60 * 1000).toISOString();
    const minBid = Math.max(50, Math.round(input.startingBid));

    const { error: insErr } = await supabaseAdmin.from("auctions").insert({
      athlete_id: contract.athlete_id,
      seller_club_id: contract.club_team_id,
      starting_bid: minBid,
      current_bid: minBid,
      min_increment: 5,
      current_winning_club_id: null,
      starts_at: new Date().toISOString(),
      ends_at: endsAt,
      status: "ATIVO",
    });

    if (insErr) throw new Error(insErr.message);

    revalidateMasterLeaguePaths();

    const ath = Array.isArray(contract.athlete)
      ? contract.athlete[0]
      : contract.athlete;

    return {
      ok: true,
      message: `${
        ath?.name ?? "Atleta"
      } listado na Central de Leilões com lance inicial de ${formatEscudos(
        minBid
      )} (incremento de 5 em 5 Escudos)!`,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Erro ao listar atleta no leilão.",
    };
  }
}

/**
 * 8. RESPONDER OU CRIAR PROPOSTA DE TROCA / NEGOCIAÇÃO DIRETA EM ESCUDOS
 */
export async function respondTransferProposalAction(input: {
  proposalId: string;
  decision: "ACEITA" | "RECUSADA" | "CANCELADA";
}) {
  try {
    const { data: proposal, error: findErr } = await supabaseAdmin
      .from("transfer_proposals")
      .select("*")
      .eq("id", input.proposalId)
      .maybeSingle();

    if (findErr || !proposal) {
      return { ok: false, error: "Proposta não encontrada." };
    }

    if (proposal.status !== "PENDENTE") {
      return { ok: false, error: "Esta proposta já foi processada." };
    }

    if (input.decision === "ACEITA") {
      const { data: fromClub } = await supabaseAdmin
        .from("club_teams")
        .select("*")
        .eq("id", proposal.from_club_id)
        .single();
      const { data: toClub } = await supabaseAdmin
        .from("club_teams")
        .select("*")
        .eq("id", proposal.to_club_id)
        .single();

      if (!fromClub || !toClub) {
        return { ok: false, error: "Clubes da negociação não encontrados." };
      }

      if (proposal.cash_amount > 0 && fromClub.balance < proposal.cash_amount) {
        return {
          ok: false,
          error: `O clube proponente (${fromClub.name}) não possui Escudos suficientes para a volta financeira.`,
        };
      }

      if (proposal.cash_amount > 0) {
        await supabaseAdmin
          .from("club_teams")
          .update({ balance: fromClub.balance - proposal.cash_amount })
          .eq("id", fromClub.id);

        await supabaseAdmin
          .from("club_teams")
          .update({ balance: toClub.balance + proposal.cash_amount })
          .eq("id", toClub.id);

        await supabaseAdmin.from("financial_transactions").insert([
          {
            club_team_id: fromClub.id,
            type: "TRANSFERENCIA",
            amount: -proposal.cash_amount,
            description: `Volta financeira em Escudos paga em troca de atletas com ${toClub.name}`,
          },
          {
            club_team_id: toClub.id,
            type: "TRANSFERENCIA",
            amount: proposal.cash_amount,
            description: `Volta financeira em Escudos recebida em troca de atletas com ${fromClub.name}`,
          },
        ]);
      }

      const offeredIds: string[] = Array.isArray(proposal.offered_athlete_ids)
        ? proposal.offered_athlete_ids
        : [];
      const requestedIds: string[] = Array.isArray(
        proposal.requested_athlete_ids
      )
        ? proposal.requested_athlete_ids
        : [];

      if (offeredIds.length > 0) {
        await supabaseAdmin
          .from("contracts")
          .update({
            club_team_id: toClub.id,
            acquired_at: new Date().toISOString(),
          })
          .in("athlete_id", offeredIds);
      }

      if (requestedIds.length > 0) {
        await supabaseAdmin
          .from("contracts")
          .update({
            club_team_id: fromClub.id,
            acquired_at: new Date().toISOString(),
          })
          .in("athlete_id", requestedIds);
      }
    }

    const { error: updErr } = await supabaseAdmin
      .from("transfer_proposals")
      .update({ status: input.decision })
      .eq("id", proposal.id);

    if (updErr) throw new Error(updErr.message);

    revalidateMasterLeaguePaths();

    return {
      ok: true,
      message:
        input.decision === "ACEITA"
          ? "🤝 Troca de atletas e compensação em Escudos concluídas com sucesso!"
          : `Proposta marcada como ${input.decision}.`,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Erro ao responder proposta.",
    };
  }
}

export async function createTransferProposalAction(input: {
  fromClubId: string;
  toClubId: string;
  offeredAthleteId: string;
  requestedAthleteId: string;
  cashAmount: number;
}) {
  if (input.fromClubId === input.toClubId) {
    return {
      ok: false,
      error: "Selecione um clube adversário diferente do seu.",
    };
  }

  try {
    const { error } = await supabaseAdmin.from("transfer_proposals").insert({
      from_club_id: input.fromClubId,
      to_club_id: input.toClubId,
      cash_amount: Math.max(0, Math.round(input.cashAmount)),
      offered_athlete_ids: input.offeredAthleteId
        ? [input.offeredAthleteId]
        : [],
      requested_athlete_ids: input.requestedAthleteId
        ? [input.requestedAthleteId]
        : [],
      status: "PENDENTE",
    });

    if (error) throw new Error(error.message);

    revalidateMasterLeaguePaths();
    return {
      ok: true,
      message: "Proposta de negociação enviada ao treinador adversário!",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao criar proposta.",
    };
  }
}

/**
 * 9. DISTRIBUIÇÃO DE ESCUDOS POR DESEMPENHO EM PARTIDA + ATUALIZAÇÃO DO FREGUESÔMETRO
 * - Vitória: +40 Escudos (PREMIO_VITORIA)
 * - Empate: +15 Escudos para cada clube (PREMIO_VITORIA)
 * - Gols marcados: +5 Escudos por gol na súmula (GOL_MARCADO)
 */
export async function submitMasterMatchWithRewardsAction(input: {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  homeScorers: MasterGoalScorerDTO[];
  awayScorers: MasterGoalScorerDTO[];
  proofUrl: string;
  winReward?: number;
  drawReward?: number;
  goalReward?: number;
}) {
  if (input.homeTeamId === input.awayTeamId) {
    return {
      ok: false,
      error: "Mandante e Visitante devem ser clubes diferentes.",
    };
  }

  const winReward = input.winReward ?? 40;
  const drawReward = input.drawReward ?? 15;
  const goalReward = input.goalReward ?? 5;

  try {
    const [{ data: homeClub }, { data: awayClub }] = await Promise.all([
      supabaseAdmin
        .from("club_teams")
        .select("*")
        .eq("id", input.homeTeamId)
        .single(),
      supabaseAdmin
        .from("club_teams")
        .select("*")
        .eq("id", input.awayTeamId)
        .single(),
    ]);

    if (!homeClub || !awayClub) {
      return { ok: false, error: "Clubes da partida não encontrados." };
    }

    let homePrize = 0;
    let awayPrize = 0;
    const txsToInsert: {
      club_team_id: string;
      type: "PREMIO_VITORIA" | "GOL_MARCADO";
      amount: number;
      description: string;
    }[] = [];

    if (input.homeScore > input.awayScore) {
      homePrize += winReward;
      txsToInsert.push({
        club_team_id: homeClub.id,
        type: "PREMIO_VITORIA",
        amount: winReward,
        description: `Prêmio por Vitória (${input.homeScore}×${input.awayScore} vs ${awayClub.name})`,
      });
    } else if (input.awayScore > input.homeScore) {
      awayPrize += winReward;
      txsToInsert.push({
        club_team_id: awayClub.id,
        type: "PREMIO_VITORIA",
        amount: winReward,
        description: `Prêmio por Vitória (${input.awayScore}×${input.homeScore} vs ${homeClub.name})`,
      });
    } else {
      homePrize += drawReward;
      awayPrize += drawReward;
      txsToInsert.push(
        {
          club_team_id: homeClub.id,
          type: "PREMIO_VITORIA",
          amount: drawReward,
          description: `Prêmio por Empate (${input.homeScore}×${input.awayScore} vs ${awayClub.name})`,
        },
        {
          club_team_id: awayClub.id,
          type: "PREMIO_VITORIA",
          amount: drawReward,
          description: `Prêmio por Empate (${input.awayScore}×${input.homeScore} vs ${homeClub.name})`,
        }
      );
    }

    if (input.homeScore > 0) {
      const homeGoalBonus = input.homeScore * goalReward;
      homePrize += homeGoalBonus;
      const scorersNames = input.homeScorers
        .map((s) => `${s.athleteName} (${s.goals}x)`)
        .join(", ");
      txsToInsert.push({
        club_team_id: homeClub.id,
        type: "GOL_MARCADO",
        amount: homeGoalBonus,
        description: `Bônus por ${input.homeScore} gol(s) marcado(s) vs ${awayClub.name}${
          scorersNames ? ` [${scorersNames}]` : ""
        }`,
      });
    }

    if (input.awayScore > 0) {
      const awayGoalBonus = input.awayScore * goalReward;
      awayPrize += awayGoalBonus;
      const scorersNames = input.awayScorers
        .map((s) => `${s.athleteName} (${s.goals}x)`)
        .join(", ");
      txsToInsert.push({
        club_team_id: awayClub.id,
        type: "GOL_MARCADO",
        amount: awayGoalBonus,
        description: `Bônus por ${input.awayScore} gol(s) marcado(s) vs ${homeClub.name}${
          scorersNames ? ` [${scorersNames}]` : ""
        }`,
      });
    }

    await Promise.all([
      supabaseAdmin
        .from("club_teams")
        .update({
          balance: homeClub.balance + homePrize,
          is_delinquent: homeClub.balance + homePrize < 0,
        })
        .eq("id", homeClub.id),
      supabaseAdmin
        .from("club_teams")
        .update({
          balance: awayClub.balance + awayPrize,
          is_delinquent: awayClub.balance + awayPrize < 0,
        })
        .eq("id", awayClub.id),
      supabaseAdmin.from("financial_transactions").insert(txsToInsert),
    ]);

    const { data: existingH2H } = await supabaseAdmin
      .from("head_to_head_cache")
      .select("*")
      .or(
        `and(team_a_id.eq.${homeClub.id},team_b_id.eq.${awayClub.id}),and(team_a_id.eq.${awayClub.id},team_b_id.eq.${homeClub.id})`
      )
      .maybeSingle();

    if (existingH2H) {
      const isHomeA = existingH2H.team_a_id === homeClub.id;
      const winsA =
        existingH2H.wins_a +
        (isHomeA
          ? input.homeScore > input.awayScore
            ? 1
            : 0
          : input.awayScore > input.homeScore
          ? 1
          : 0);
      const winsB =
        existingH2H.wins_b +
        (isHomeA
          ? input.awayScore > input.homeScore
            ? 1
            : 0
          : input.homeScore > input.awayScore
          ? 1
          : 0);
      const draws =
        existingH2H.draws + (input.homeScore === input.awayScore ? 1 : 0);
      const goalsA =
        existingH2H.goals_a + (isHomeA ? input.homeScore : input.awayScore);
      const goalsB =
        existingH2H.goals_b + (isHomeA ? input.awayScore : input.homeScore);

      await supabaseAdmin
        .from("head_to_head_cache")
        .update({
          wins_a: winsA,
          wins_b: winsB,
          draws,
          goals_a: goalsA,
          goals_b: goalsB,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingH2H.id);
    } else {
      await supabaseAdmin.from("head_to_head_cache").insert({
        team_a_id: homeClub.id,
        team_b_id: awayClub.id,
        wins_a: input.homeScore > input.awayScore ? 1 : 0,
        wins_b: input.awayScore > input.homeScore ? 1 : 0,
        draws: input.homeScore === input.awayScore ? 1 : 0,
        goals_a: input.homeScore,
        goals_b: input.awayScore,
      });
    }

    revalidatePath("/matches");
    revalidatePath("/freguesometro");
    revalidatePath("/dashboard");

    return {
      ok: true,
      homePrize,
      awayPrize,
      message: `Partida homologada (${homeClub.name} ${input.homeScore}×${
        input.awayScore
      } ${awayClub.name})! Premiações creditadas: ${
        homeClub.acronym
      } +${formatEscudos(homePrize)} | ${awayClub.acronym} +${formatEscudos(
        awayPrize
      )}. Freguesômetro atualizado!`,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Erro ao homologar partida e distribuir premiação.",
    };
  }
}

/**
 * 10. MOTOR DO FREGUESÔMETRO (ENDPOINT / SERVER ACTION)
 */
export async function getHeadToHeadStatsAction(input: {
  teamAId: string;
  teamBId: string;
}) {
  const data = await getMasterLeagueOverviewData();
  const teamA =
    data.clubs.find(
      (c) => c.id === input.teamAId || c.userId === input.teamAId
    ) ?? data.clubs[0];
  const teamB =
    data.clubs.find(
      (c) => c.id === input.teamBId || c.userId === input.teamBId
    ) ?? data.clubs[1];

  return computeHeadToHeadBetweenClubs(teamA, teamB, data.h2hRecords);
}
