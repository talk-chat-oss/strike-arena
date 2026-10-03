"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { getStripeServer } from "@/lib/stripe";
import {
  getMasterLeagueOverviewData,
  computeHeadToHeadBetweenClubs,
  formatEscudos,
  type MasterGoalScorerDTO,
} from "@/lib/master-league-data";

function revalidateMasterLeaguePaths() {
  revalidatePath("/", "layout");
  revalidatePath("/market");
  revalidatePath("/auctions");
  revalidatePath("/transfers");
  revalidatePath("/dashboard");
  revalidatePath("/players");
  revalidatePath("/store/escudos");
}

/**
 * 0. TROCAR ESCUDO / UNIFORME DA CONTA (PRESERVANDO SALDO GLOBAL E ELENCO)
 */
export async function switchAccountCrestAction(input: {
  clubTeamId: string;
  newClubName: string;
  newAcronym?: string;
}) {
  if (!input.clubTeamId || !input.newClubName?.trim()) {
    return {
      ok: false,
      error: "Selecione um escudo válido do catálogo oficial.",
    };
  }

  try {
    const { data, error } = await supabaseAdmin.rpc(
      "rpc_switch_account_crest",
      {
        p_club_team_id: input.clubTeamId,
        p_new_club_name: input.newClubName.trim(),
        p_new_acronym: input.newAcronym?.trim() || null,
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    revalidateMasterLeaguePaths();

    const res = data as {
      oldClubName: string;
      newClubName: string;
      newAcronym: string;
      balance: number;
    };

    return {
      ok: true,
      message: `🛡️ Escudo da sua conta alterado de ${res.oldClubName} para ${res.newClubName} (${res.newAcronym})! Seu Saldo Global (${formatEscudos(
        res.balance
      )}) e todo o seu elenco de jogadores continuam 100% intactos!`,
      data: res,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Erro ao alterar o escudo da conta.",
    };
  }
}

/**
 * 1. MULTA RESCISÓRIA & TRANSFERÊNCIA IMEDIATA EM ESCUDOS
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
      message: `⚡ MULTA RESCISÓRIA PAGA! Transferência imediata confirmada: ${formatEscudos(
        res.buyoutPaid
      )} pagos à vista ao ${res.sellerName}. ${
        res.athleteName
      } saiu do ${res.sellerName} e agora faz parte exclusiva do seu elenco!`,
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
 * 1.1. CONTRATAR JOGADOR LIVRE (SEM CLUBE / BANCO DA FEDERAÇÃO) COM EXCLUSIVIDADE
 */
export async function signFreeAgentAction(input: {
  athleteId: string;
  buyerClubId: string;
}) {
  if (!input.athleteId || !input.buyerClubId) {
    return {
      ok: false,
      error: "Selecione o atleta e o seu clube para concluir a contratação.",
    };
  }

  try {
    const { data, error } = await supabaseAdmin.rpc("rpc_sign_free_agent", {
      p_athlete_id: input.athleteId,
      p_buyer_club_id: input.buyerClubId,
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidateMasterLeaguePaths();

    const res = data as {
      athleteName: string;
      clubName: string;
      signingFee: number;
      salary: number;
      buyoutClause: number;
      newBalance: number;
    };

    return {
      ok: true,
      message: `✍️ CONTRATAÇÃO OFICIAL CONFIRMADA! ${res.athleteName} assinou contrato exclusivo com o ${
        res.clubName
      } (Passe: ${formatEscudos(res.signingFee)} • Salário: ${formatEscudos(
        res.salary,
        false
      )} • Multa Rescisória fixada em ${formatEscudos(res.buyoutClause)}).`,
      data: res,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Erro ao contratar atleta livre.",
    };
  }
}

/**
 * 1.2. CONFIGURAR CALENDÁRIO DE ABERTURA E FECHAMENTO DA JANELA DE TRANSFERÊNCIAS
 */
export async function updateTransferWindowSettingsAction(input: {
  windowName?: string;
  forceStatus: "AUTO" | "OPEN" | "CLOSED";
  opensAtIso: string;
  closesAtIso: string;
  buyoutEnabled: boolean;
  tradesEnabled: boolean;
  freeAgencyEnabled: boolean;
}) {
  const opensMs = new Date(input.opensAtIso).getTime();
  const closesMs = new Date(input.closesAtIso).getTime();

  if (isNaN(opensMs) || isNaN(closesMs) || closesMs <= opensMs) {
    return {
      ok: false,
      error:
        "A data/hora de fechamento da Janela de Transferências deve ser posterior à data de abertura.",
    };
  }

  try {
    const { error } = await supabaseAdmin
      .from("transfer_window_settings")
      .upsert(
        {
          id: 1,
          window_name:
            input.windowName?.trim() ||
            "Janela Oficial de Transferências & Multas",
          force_status: input.forceStatus,
          opens_at: new Date(opensMs).toISOString(),
          closes_at: new Date(closesMs).toISOString(),
          buyout_enabled: input.buyoutEnabled,
          trades_enabled: input.tradesEnabled,
          free_agency_enabled: input.freeAgencyEnabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) throw new Error(error.message);

    revalidateMasterLeaguePaths();

    const statusLabel =
      input.forceStatus === "OPEN"
        ? "ABERTA IMEDIATAMENTE"
        : input.forceStatus === "CLOSED"
        ? "FECHADA (Elencos Travados)"
        : "AGENDADA PELO CALENDÁRIO";

    return {
      ok: true,
      message: `📅 Calendário da Janela de Transferências atualizado com sucesso! Status: ${statusLabel}.`,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Erro ao atualizar calendário da janela de transferências.",
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
    // Impedir leilão duplicado ou de jogador que já pertence a um clube (quando não listado pelo próprio clube)
    const { data: existingContract } = await supabaseAdmin
      .from("contracts")
      .select("id, club_team_id, club:club_teams!club_team_id(name)")
      .eq("athlete_id", input.athleteId)
      .maybeSingle();

    if (
      existingContract &&
      (!input.sellerClubId ||
        existingContract.club_team_id !== input.sellerClubId)
    ) {
      const clb = Array.isArray(existingContract.club)
        ? existingContract.club[0]
        : existingContract.club;
      return {
        ok: false,
        error: `Este atleta já possui contrato exclusivo com ${
          clb?.name ?? "outro clube"
        } e não pode ser colocado em leilão livre da Federação.`,
      };
    }

    const { data: existingAuction } = await supabaseAdmin
      .from("auctions")
      .select("id")
      .eq("athlete_id", input.athleteId)
      .in("status", ["ATIVO", "AGENDADO"])
      .maybeSingle();

    if (existingAuction) {
      return {
        ok: false,
        error: "Este atleta já possui um leilão ativo ou agendado.",
      };
    }

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
 * 4. COMPRA / RECARGA DE PACOTE DE ESCUDOS VIA STRIPE (MEIO DE PAGAMENTO ÚNICO E OFICIAL)
 */
export async function createStripeCheckoutSessionAction(input: {
  clubTeamId: string;
  packageId: string;
  originUrl?: string;
}) {
  if (!input.clubTeamId || !input.packageId) {
    return {
      ok: false,
      error: "Selecione o clube destinatário e o pacote de Escudos.",
    };
  }

  try {
    const [{ data: club }, { data: pkg }] = await Promise.all([
      supabaseAdmin
        .from("club_teams")
        .select("id, name, acronym")
        .eq("id", input.clubTeamId)
        .maybeSingle(),
      supabaseAdmin
        .from("escudo_packages")
        .select("*")
        .eq("id", input.packageId)
        .eq("active", true)
        .maybeSingle(),
    ]);

    if (!club) {
      return { ok: false, error: "Clube destinatário não encontrado." };
    }
    if (!pkg) {
      return {
        ok: false,
        error: "Pacote promocional de Escudos não encontrado.",
      };
    }

    const baseUrl = (
      input.originUrl ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://strike-arena-gg.vercel.app"
    ).replace(/\/$/, "");

    const stripe = getStripeServer();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "brl",
      line_items: [
        {
          price_data: {
            currency: "brl",
            unit_amount: Number(pkg.price_brl_cents),
            product_data: {
              name: `${pkg.name} (+${pkg.escudos_amount} Escudos)`,
              description: `Recarga oficial de +${pkg.escudos_amount} Escudos para o clube ${club.name} (${club.acronym}) na Strike Arena.`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        clubTeamId: String(club.id),
        packageId: String(pkg.id),
        escudosAmount: String(pkg.escudos_amount),
        clubName: String(club.name),
      },
      success_url: `${baseUrl}/store/escudos?stripe_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/store/escudos?canceled=1`,
    });

    if (!session.url) {
      throw new Error("A Stripe não retornou uma URL válida de checkout.");
    }

    return {
      ok: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Erro ao iniciar sessão de pagamento na Stripe.",
    };
  }
}

/**
 * 4.1. VERIFICAÇÃO E CRÉDITO IDEMPOTENTE DE SESSÃO STRIPE PAGA
 */
export async function verifyStripeCheckoutSessionAction(sessionId: string) {
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return { ok: false, error: "Sessão Stripe inválida." };
  }

  try {
    const stripe = getStripeServer();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return {
        ok: false,
        error: "O pagamento desta sessão Stripe ainda não consta como pago.",
      };
    }

    const clubTeamId = session.metadata?.clubTeamId;
    const packageId = session.metadata?.packageId;

    if (!clubTeamId || !packageId) {
      return {
        ok: false,
        error: "Metadados do clube/pacote ausentes na sessão da Stripe.",
      };
    }

    const { data, error } = await supabaseAdmin.rpc(
      "rpc_purchase_escudos_package",
      {
        p_club_team_id: clubTeamId,
        p_package_id: packageId,
        p_payment_method: "STRIPE",
        p_external_ref: session.id,
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
      message: `🛡️ PAGAMENTO STRIPE CONFIRMADO! +${formatEscudos(
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
          : "Erro ao validar pagamento junto à Stripe.",
    };
  }
}

export async function purchaseEscudosPackageAction(input: {
  clubTeamId: string;
  packageId: string;
  paymentMethod?: "STRIPE";
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
        p_payment_method: "STRIPE",
        p_external_ref: `STRIPE-${Date.now().toString(36).toUpperCase()}`,
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
      message: `🛡️ PAGAMENTO STRIPE CONFIRMADO! +${formatEscudos(
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
          : "Erro ao processar recarga de Escudos via Stripe.",
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
      const { data: isOpen } = await supabaseAdmin.rpc(
        "fn_is_transfer_window_open"
      );
      if (isOpen === false) {
        return {
          ok: false,
          error:
            "🔒 A Janela de Transferências está FECHADA no momento. Os jogadores estão travados em seus clubes até a reabertura da janela.",
        };
      }

      const { data: winCfg } = await supabaseAdmin
        .from("transfer_window_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (winCfg && winCfg.trades_enabled === false) {
        return {
          ok: false,
          error:
            "As trocas e negociações entre clubes estão temporariamente bloqueadas nesta janela.",
        };
      }

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

      const offeredIds: string[] = Array.isArray(proposal.offered_athlete_ids)
        ? proposal.offered_athlete_ids
        : [];
      const requestedIds: string[] = Array.isArray(
        proposal.requested_athlete_ids
      )
        ? proposal.requested_athlete_ids
        : [];

      // Verificar se os atletas ainda pertencem aos respectivos clubes antes de mover
      if (offeredIds.length > 0) {
        const { data: offContracts } = await supabaseAdmin
          .from("contracts")
          .select("id, club_team_id")
          .in("athlete_id", offeredIds);
        if (
          !offContracts ||
          offContracts.length !== offeredIds.length ||
          offContracts.some((c) => c.club_team_id !== fromClub.id)
        ) {
          return {
            ok: false,
            error: `O atleta oferecido não pertence mais ao elenco do ${fromClub.name}.`,
          };
        }
      }

      if (requestedIds.length > 0) {
        const { data: reqContracts } = await supabaseAdmin
          .from("contracts")
          .select("id, club_team_id")
          .in("athlete_id", requestedIds);
        if (
          !reqContracts ||
          reqContracts.length !== requestedIds.length ||
          reqContracts.some((c) => c.club_team_id !== toClub.id)
        ) {
          return {
            ok: false,
            error: `O atleta solicitado não pertence mais ao elenco do ${toClub.name}.`,
          };
        }
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
            description: `Compensação em Escudos paga em transferência com ${toClub.name}`,
          },
          {
            club_team_id: toClub.id,
            type: "TRANSFERENCIA",
            amount: proposal.cash_amount,
            description: `Compensação em Escudos recebida em transferência com ${fromClub.name}`,
          },
        ]);
      }

      // O atleta sai de um time e vai para o outro (mantendo UNIQUE athlete_id)
      if (offeredIds.length > 0) {
        await supabaseAdmin
          .from("contracts")
          .update({
            club_team_id: toClub.id,
            acquired_at: new Date().toISOString(),
          })
          .in("athlete_id", offeredIds)
          .eq("club_team_id", fromClub.id);
      }

      if (requestedIds.length > 0) {
        await supabaseAdmin
          .from("contracts")
          .update({
            club_team_id: fromClub.id,
            acquired_at: new Date().toISOString(),
          })
          .in("athlete_id", requestedIds)
          .eq("club_team_id", toClub.id);
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
          ? "🤝 Transferência concluída! Os atletas saíram de seus clubes anteriores e já estão integrados aos novos elencos."
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
    const { data: isOpen } = await supabaseAdmin.rpc(
      "fn_is_transfer_window_open"
    );
    if (isOpen === false) {
      return {
        ok: false,
        error:
          "🔒 A Janela de Transferências está FECHADA no momento. Novas propostas só podem ser enviadas quando a janela abrir.",
      };
    }

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
      message: "Proposta de transferência enviada ao treinador adversário!",
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
