"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Gavel,
  Flame,
  ArrowLeftRight,
  Clock,
  ShieldAlert,
  Search,
  Wallet,
  Check,
  X,
  Send,
  Zap,
  Calendar,
  Sparkles,
  Trophy,
  PlusCircle,
  Shield,
  Lock,
  Unlock,
  Settings2,
  UserPlus,
} from "lucide-react";
import type {
  AthleteDTO,
  ClubTeamDTO,
  ContractRosterItemDTO,
  AuctionDTO,
  TransferProposalDTO,
  TransferWindowSettingsDTO,
} from "@/lib/master-league-data";
import {
  formatEscudos,
  getFreeAgentSigningCost,
} from "@/lib/master-league-data";
import {
  payBuyoutClauseAction,
  placeAuctionBidAction,
  scheduleAuctionAction,
  respondTransferProposalAction,
  createTransferProposalAction,
  updateTransferWindowSettingsAction,
  signFreeAgentAction,
} from "@/app/actions/master-league-actions";
import { ClubCrest } from "@/lib/club-crests";

interface MarketClientProps {
  athletes: AthleteDTO[];
  clubs: ClubTeamDTO[];
  contracts: ContractRosterItemDTO[];
  auctions: AuctionDTO[];
  proposals: TransferProposalDTO[];
  transferWindow: TransferWindowSettingsDTO;
  initialClubId: string;
  defaultSection?: "auctions" | "buyout" | "proposals";
  canManage?: boolean;
}

function formatCountdown(targetIso: string, nowMs: number) {
  const diffSec = Math.max(
    0,
    Math.floor((new Date(targetIso).getTime() - nowMs) / 1000)
  );
  const days = Math.floor(diffSec / 86400);
  const hrs = Math.floor((diffSec % 86400) / 3600);
  const mins = Math.floor((diffSec % 3600) / 60);
  const secs = diffSec % 60;
  const isAntiSniperWindow = diffSec > 0 && diffSec <= 120;

  const formatted =
    days > 0
      ? `${days}d ${String(hrs).padStart(2, "0")}h ${String(mins).padStart(
          2,
          "0"
        )}m`
      : hrs > 0
      ? `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
          2,
          "0"
        )}:${String(secs).padStart(2, "0")}`
      : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return { diffSec, formatted, isAntiSniperWindow };
}

function formatDateTimePtBr(iso: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function toDatetimeLocalValue(iso: string) {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

export function MarketClient({
  athletes,
  clubs,
  contracts,
  auctions,
  proposals,
  transferWindow,
  initialClubId,
  defaultSection = "auctions",
  canManage = false,
}: MarketClientProps) {
  const [activeTab, setActiveTab] = useState<
    "auctions" | "buyout" | "proposals"
  >(defaultSection);
  const [auctionSubTab, setAuctionSubTab] = useState<
    "active" | "upcoming" | "finished"
  >("active");
  const [buyoutSubMode, setBuyoutSubMode] = useState<"contracted" | "free">(
    contracts.length > 0 ? "contracted" : "free"
  );
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showWindowSettings, setShowWindowSettings] = useState(false);

  const [activeClubId, setActiveClubId] = useState(
    initialClubId || clubs[0]?.id || ""
  );
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [bidAmounts, setBidAmounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [minOverall, setMinOverall] = useState<number>(77);
  const [posFilter, setPosFilter] = useState<string>("ALL");

  // Estado do Configurador do Calendário da Janela de Transferências
  const [winName, setWinName] = useState(transferWindow.windowName);
  const [winOpensLocal, setWinOpensLocal] = useState(() =>
    toDatetimeLocalValue(transferWindow.opensAt)
  );
  const [winClosesLocal, setWinClosesLocal] = useState(() =>
    toDatetimeLocalValue(transferWindow.closesAt)
  );
  const [winForceStatus, setWinForceStatus] = useState<
    "AUTO" | "OPEN" | "CLOSED"
  >(transferWindow.forceStatus);
  const [winBuyoutEnabled, setWinBuyoutEnabled] = useState(
    transferWindow.buyoutEnabled
  );
  const [winTradesEnabled, setWinTradesEnabled] = useState(
    transferWindow.tradesEnabled
  );
  const [winFreeAgencyEnabled, setWinFreeAgencyEnabled] = useState(
    transferWindow.freeAgencyEnabled
  );

  // Formulário de Agendamento Prévio de Leilão (Organizador)
  const [schedAthleteId, setSchedAthleteId] = useState<string>(
    athletes.find((a) => a.name.includes("Mbappé"))?.id ??
      athletes[0]?.id ??
      ""
  );
  const [schedStartBid, setSchedStartBid] = useState<number>(100);
  const [schedMinIncrement, setSchedMinIncrement] = useState<number>(5);
  const [schedStartsInMinutes, setSchedStartsInMinutes] = useState<number>(60);
  const [schedDurationMinutes] = useState<number>(120);

  // Formulário Nova Proposta de Troca
  const [targetClubId, setTargetClubId] = useState<string>(
    clubs.find((c) => c.id !== initialClubId)?.id ?? clubs[1]?.id ?? ""
  );
  const [offeredAthleteId, setOfferedAthleteId] = useState<string>("");
  const [requestedAthleteId, setRequestedAthleteId] = useState<string>("");
  const [cashOffer, setCashOffer] = useState<number>(45);

  const [feedback, setFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Cronômetro Regressivo em Tempo Real (1s)
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentClub =
    clubs.find((c) => c.id === activeClubId) ?? clubs[0] ?? null;

  const isWindowOpen = transferWindow.isOpenNow;
  const windowTimer = formatCountdown(
    isWindowOpen ? transferWindow.closesAt : transferWindow.opensAt,
    nowMs
  );

  // Classificação dinâmica de leilões
  const upcomingAuctions = auctions.filter(
    (a) =>
      a.status === "AGENDADO" && new Date(a.startsAt).getTime() > nowMs
  );

  const activeAuctions = auctions.filter(
    (a) =>
      (a.status === "ATIVO" && new Date(a.endsAt).getTime() > nowMs) ||
      (a.status === "AGENDADO" &&
        new Date(a.startsAt).getTime() <= nowMs &&
        new Date(a.endsAt).getTime() > nowMs)
  );

  const finishedAuctions = auctions.filter(
    (a) =>
      a.status === "ENCERRADO" ||
      (a.status !== "CANCELADO" && new Date(a.endsAt).getTime() <= nowMs)
  );

  const contractedAthleteIds = new Set(contracts.map((c) => c.athleteId));

  const filteredContracts = contracts
    .filter((c) => {
      if (c.overall < minOverall) return false;
      if (posFilter !== "ALL" && c.position !== posFilter) return false;
      if (
        searchQuery.trim() &&
        !c.athleteName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !c.clubName.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.overall - a.overall);

  const filteredFreeAgents = athletes
    .filter((a) => {
      if (contractedAthleteIds.has(a.id)) return false;
      if (a.overall < minOverall) return false;
      if (posFilter !== "ALL" && a.position !== posFilter) return false;
      if (
        searchQuery.trim() &&
        !a.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !a.defaultTeam.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .slice(0, 60);

  const myContracts = contracts.filter((c) => c.clubTeamId === activeClubId);
  const targetClubContracts = contracts.filter(
    (c) => c.clubTeamId === targetClubId
  );

  function getMinimumValidBid(auction: AuctionDTO) {
    if (!auction.currentWinningClubId) {
      return auction.startingBid;
    }
    return auction.currentBid + (auction.minIncrement || 5);
  }

  function handleQuickBid(auction: AuctionDTO, customAmount?: number) {
    if (!currentClub) return;
    const minValid = getMinimumValidBid(auction);
    const amount = customAmount ?? bidAmounts[auction.id] ?? minValid;
    setFeedback(null);
    startTransition(async () => {
      const res = await placeAuctionBidAction({
        auctionId: auction.id,
        bidderClubId: currentClub.id,
        bidAmount: amount,
      });
      setFeedback({
        ok: res.ok,
        text: res.ok ? res.message! : res.error!,
      });
    });
  }

  function handleScheduleAuction(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const startsAtMs = Date.now() + schedStartsInMinutes * 60 * 1000;
    const endsAtMs = startsAtMs + schedDurationMinutes * 60 * 1000;

    startTransition(async () => {
      const res = await scheduleAuctionAction({
        athleteId: schedAthleteId,
        startingBid: schedStartBid,
        minIncrement: schedMinIncrement,
        startsAtIso: new Date(startsAtMs).toISOString(),
        endsAtIso: new Date(endsAtMs).toISOString(),
      });
      setFeedback({
        ok: res.ok,
        text: res.ok ? res.message! : res.error!,
      });
      if (res.ok) {
        setShowScheduleForm(false);
        if (schedStartsInMinutes > 0) {
          setAuctionSubTab("upcoming");
        } else {
          setAuctionSubTab("active");
        }
      }
    });
  }

  function handlePayBuyout(contract: ContractRosterItemDTO) {
    if (!currentClub) return;
    setFeedback(null);
    startTransition(async () => {
      const res = await payBuyoutClauseAction({
        contractId: contract.id,
        buyerClubId: currentClub.id,
      });
      setFeedback({
        ok: res.ok,
        text: res.ok ? res.message! : res.error!,
      });
    });
  }

  function handleSignFreeAgent(athlete: AthleteDTO) {
    if (!currentClub) return;
    setFeedback(null);
    startTransition(async () => {
      const res = await signFreeAgentAction({
        athleteId: athlete.id,
        buyerClubId: currentClub.id,
      });
      setFeedback({
        ok: res.ok,
        text: res.ok ? res.message! : res.error!,
      });
    });
  }

  function handleRespondProposal(
    proposalId: string,
    decision: "ACEITA" | "RECUSADA" | "CANCELADA"
  ) {
    setFeedback(null);
    startTransition(async () => {
      const res = await respondTransferProposalAction({
        proposalId,
        decision,
      });
      setFeedback({
        ok: res.ok,
        text: res.ok ? res.message! : res.error!,
      });
    });
  }

  function handleCreateProposal(e: React.FormEvent) {
    e.preventDefault();
    if (!currentClub) return;
    setFeedback(null);
    startTransition(async () => {
      const res = await createTransferProposalAction({
        fromClubId: currentClub.id,
        toClubId: targetClubId,
        offeredAthleteId:
          offeredAthleteId || myContracts[0]?.athleteId || "",
        requestedAthleteId:
          requestedAthleteId || targetClubContracts[0]?.athleteId || "",
        cashAmount: cashOffer,
      });
      setFeedback({
        ok: res.ok,
        text: res.ok ? res.message! : res.error!,
      });
    });
  }

  function handleSaveTransferWindow(
    e?: React.FormEvent,
    overrideStatus?: "AUTO" | "OPEN" | "CLOSED"
  ) {
    if (e) e.preventDefault();
    setFeedback(null);
    const statusToSave = overrideStatus ?? winForceStatus;
    if (overrideStatus) {
      setWinForceStatus(overrideStatus);
    }

    startTransition(async () => {
      const opensIso = winOpensLocal
        ? new Date(winOpensLocal).toISOString()
        : transferWindow.opensAt;
      const closesIso = winClosesLocal
        ? new Date(winClosesLocal).toISOString()
        : transferWindow.closesAt;

      const res = await updateTransferWindowSettingsAction({
        windowName: winName,
        opensAtIso: opensIso,
        closesAtIso: closesIso,
        forceStatus: statusToSave,
        buyoutEnabled: winBuyoutEnabled,
        tradesEnabled: winTradesEnabled,
        freeAgencyEnabled: winFreeAgencyEnabled,
      });
      setFeedback({
        ok: res.ok,
        text: res.ok ? res.message! : res.error!,
      });
      if (res.ok && !overrideStatus) {
        setShowWindowSettings(false);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* ==================================================================== */}
      {/* CALENDÁRIO OFICIAL DA JANELA DE TRANSFERÊNCIAS (ABRE / FECHA)         */}
      {/* ==================================================================== */}
      <div
        className={`rounded-[4px] border p-4 sm:p-5 transition-colors ${
          isWindowOpen
            ? "bg-gradient-to-r from-[#0d1f17] via-[#111622] to-[#111622] border-[#15a34a]/50"
            : "bg-gradient-to-r from-[#241115] via-[#111622] to-[#111622] border-[#dc2626]/50"
        }`}
      >
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {isWindowOpen ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[2px] bg-[#15a34a] text-[#090c12] text-[11px] font-extrabold uppercase">
                  <Unlock className="w-3 h-3" />
                  JANELA DE TRANSFERÊNCIAS ABERTA
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[2px] bg-[#dc2626] text-white text-[11px] font-extrabold uppercase">
                  <Lock className="w-3 h-3" />
                  JANELA DE TRANSFERÊNCIAS FECHADA • ELENCOS TRAVADOS
                </span>
              )}

              <span className="text-xs font-extrabold text-[#f4f6fb]">
                {transferWindow.windowName}
              </span>

              <span className="text-[11px] text-[#9aa5b8]">
                • Abertura: {formatDateTimePtBr(transferWindow.opensAt)} •
                Fechamento: {formatDateTimePtBr(transferWindow.closesAt)}
              </span>
            </div>

            <p className="text-xs text-[#b6c0d4]">
              {isWindowOpen ? (
                <>
                  <strong>Movimentações Liberadas:</strong> Pagamento de Multa
                  Rescisória transfere o atleta imediatamente de um clube para
                  outro. Um jogador nunca pode pertencer a dois times ao mesmo
                  tempo.
                </>
              ) : (
                <>
                  <strong>Elencos Travados:</strong> Fora do período da Janela
                  de Transferências, os atletas ficam travados em seus clubes
                  atuais e não podem ser transferidos por multa ou troca.
                </>
              )}
            </p>
          </div>

          {/* Controles Padronizados h-11 (Mesmo tamanho em Mobile e Web) */}
          <div
            className={`grid grid-cols-1 ${
              canManage ? "sm:grid-cols-3" : "sm:grid-cols-1"
            } gap-2.5 w-full xl:w-auto shrink-0`}
          >
            <div className="h-11 px-4 rounded-[4px] bg-[#090c12] border border-[#222c40] flex items-center justify-between sm:justify-center gap-2.5 sm:min-w-[190px]">
              <span className="text-[10px] uppercase font-bold text-[#78849e]">
                {isWindowOpen ? "Fecha em:" : "Calendário:"}
              </span>
              <span className="text-xs font-mono font-extrabold text-[#ffdc2b] whitespace-nowrap">
                {transferWindow.forceStatus === "OPEN"
                  ? "ABERTA MANUAL"
                  : transferWindow.forceStatus === "CLOSED"
                  ? "FECHADA MANUAL"
                  : windowTimer.formatted}
              </span>
            </div>

            {canManage && (
              <>
                {!isWindowOpen ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleSaveTransferWindow(undefined, "OPEN")}
                    className="w-full sm:min-w-[190px] h-11 px-4 rounded-[4px] bg-[#15a34a] hover:bg-[#16a34a] text-[#090c12] text-xs font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
                  >
                    <Unlock className="w-3.5 h-3.5 shrink-0" />
                    <span>Abrir Janela Agora</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      handleSaveTransferWindow(undefined, "CLOSED")
                    }
                    className="w-full sm:min-w-[190px] h-11 px-4 rounded-[4px] bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
                  >
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Fechar Janela (Travar)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowWindowSettings((v) => !v)}
                  className="w-full sm:min-w-[190px] h-11 px-4 rounded-[4px] bg-[#161d2c] hover:bg-[#1e273b] border border-[#2c3852] text-xs font-bold text-[#f4f6fb] inline-flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
                >
                  <Settings2 className="w-3.5 h-3.5 text-[#ffdc2b] shrink-0" />
                  <span>Calendário da Janela</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Painel do Organizador: Agendar Abertura e Fechamento da Janela */}
        {canManage && showWindowSettings && (
          <form
            onSubmit={(e) => handleSaveTransferWindow(e)}
            className="mt-4 pt-4 border-t border-[#222c40] space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#ffdc2b] flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Configurar Calendário de Abertura e Fechamento da Janela de
                  Transferências
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#78849e] mb-1">
                  Nome da Janela / Período
                </label>
                <input
                  type="text"
                  value={winName}
                  onChange={(e) => setWinName(e.target.value)}
                  className="w-full h-11 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs font-bold text-[#f4f6fb]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#78849e] mb-1">
                  Data e Hora de Abertura
                </label>
                <input
                  type="datetime-local"
                  value={winOpensLocal}
                  onChange={(e) => setWinOpensLocal(e.target.value)}
                  className="w-full h-11 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs font-bold text-[#4ade80]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#78849e] mb-1">
                  Data e Hora de Fechamento
                </label>
                <input
                  type="datetime-local"
                  value={winClosesLocal}
                  onChange={(e) => setWinClosesLocal(e.target.value)}
                  className="w-full h-11 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs font-bold text-[#f87171]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#78849e] mb-1">
                  Modo de Operação
                </label>
                <select
                  value={winForceStatus}
                  onChange={(e) =>
                    setWinForceStatus(
                      e.target.value as "AUTO" | "OPEN" | "CLOSED"
                    )
                  }
                  className="w-full h-11 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs font-bold text-[#ffdc2b]"
                >
                  <option value="AUTO" className="bg-[#111622]">
                    Automático pelo Calendário (Abre/Fecha nas datas)
                  </option>
                  <option value="OPEN" className="bg-[#111622]">
                    Forçar Janela ABERTA Imediatamente
                  </option>
                  <option value="CLOSED" className="bg-[#111622]">
                    Forçar Janela FECHADA Imediatamente (Travar Tudo)
                  </option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#b6c0d4]">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={winBuyoutEnabled}
                    onChange={(e) => setWinBuyoutEnabled(e.target.checked)}
                    className="accent-[#ffdc2b]"
                  />
                  <span>Permitir Pagamento de Multa Rescisória</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={winTradesEnabled}
                    onChange={(e) => setWinTradesEnabled(e.target.checked)}
                    className="accent-[#ffdc2b]"
                  />
                  <span>Permitir Trocas & Propostas Diretas</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={winFreeAgencyEnabled}
                    onChange={(e) => setWinFreeAgencyEnabled(e.target.checked)}
                    className="accent-[#ffdc2b]"
                  />
                  <span>Permitir Contratação de Jogadores Livres</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto sm:min-w-[220px] h-11 px-5 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-extrabold text-xs inline-flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                Salvar Calendário da Janela
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Header do Mercado com Saldo do Clube Comprador em Escudos (3 Blocos h-12 Idênticos) */}
      <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded-[2px] bg-[#ffdc2b] text-[#0e1312] text-[11px] font-extrabold uppercase">
              ECONOMIA EM ESCUDOS
            </span>
            <span className="text-xs text-[#78849e]">
              Contrato Exclusivo por Clube • Multa Rescisória • Custódia Escrow
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#f4f6fb] mt-1">
            {activeTab === "auctions"
              ? "Central de Leilões & Vitrine Bola Preta"
              : "Central de Transferências & Multas Rescisórias"}
          </h1>
        </div>

        {currentClub && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full xl:w-auto shrink-0">
            <div className="h-12 px-3.5 rounded-[4px] bg-[#090c12] border border-[#222c40] flex items-center gap-2.5 sm:min-w-[200px]">
              <ClubCrest clubName={currentClub.name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-[#78849e] uppercase font-bold leading-none">
                  Operando como:
                </div>
                <select
                  value={activeClubId}
                  onChange={(e) => {
                    setActiveClubId(e.target.value);
                    setFeedback(null);
                  }}
                  className="w-full bg-transparent text-xs font-bold text-[#f4f6fb] focus:outline-none cursor-pointer truncate mt-0.5"
                >
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#111622]">
                      {c.name} ({c.ownerNickname})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="h-12 px-3.5 rounded-[4px] bg-[#15a34a]/15 border border-[#15a34a]/40 flex items-center gap-2.5 sm:min-w-[200px]">
              <Wallet className="w-4 h-4 text-[#4ade80] shrink-0" />
              <div>
                <div className="text-[10px] text-[#9aa5b8] uppercase font-bold leading-none">
                  Saldo Disponível
                </div>
                <div className="text-sm font-extrabold text-[#4ade80] tabular-nums mt-0.5">
                  {formatEscudos(currentClub.balance)}
                </div>
              </div>
            </div>

            <Link
              href="/store/escudos"
              className="w-full sm:min-w-[200px] h-12 px-4 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] text-xs font-extrabold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>+ Comprar Escudos</span>
            </Link>
          </div>
        )}
      </div>

      {/* Feedback Transacional */}
      {feedback && (
        <div
          className={`p-3.5 rounded-[4px] border text-xs font-semibold flex items-center justify-between ${
            feedback.ok
              ? "bg-[#15a34a]/15 border-[#15a34a]/40 text-[#4ade80]"
              : "bg-[#dc2626]/15 border-[#dc2626]/40 text-[#f87171]"
          }`}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-[11px] underline ml-4 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Navegação Principal Padronizada (Grid Uniforme h-11 em Mobile e Web) */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${
          activeTab === "auctions" ? "xl:grid-cols-4" : "xl:grid-cols-3"
        } gap-2.5 border-b border-[#222c40] pb-4`}
      >
        <button
          type="button"
          onClick={() => setActiveTab("auctions")}
          className={`w-full h-11 px-4 rounded-[4px] text-xs font-extrabold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "auctions"
              ? "bg-[#ffdc2b] text-[#0e1312]"
              : "bg-[#111622] text-[#b6c0d4] hover:bg-[#161d2c] border border-[#222c40]"
          }`}
        >
          <Gavel className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">1. Central de Leilões</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 leading-none shrink-0">
            {auctions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("buyout")}
          className={`w-full h-11 px-4 rounded-[4px] text-xs font-extrabold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "buyout"
              ? "bg-[#ffdc2b] text-[#0e1312]"
              : "bg-[#111622] text-[#b6c0d4] hover:bg-[#161d2c] border border-[#222c40]"
          }`}
        >
          <Flame className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">2. Multa Rescisória & Transferência</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 leading-none shrink-0">
            {contracts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("proposals")}
          className={`w-full h-11 px-4 rounded-[4px] text-xs font-extrabold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "proposals"
              ? "bg-[#ffdc2b] text-[#0e1312]"
              : "bg-[#111622] text-[#b6c0d4] hover:bg-[#161d2c] border border-[#222c40]"
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">3. Propostas Diretas & Trocas</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 leading-none shrink-0">
            {proposals.length}
          </span>
        </button>

        {activeTab === "auctions" && (
          <button
            type="button"
            onClick={() => setShowScheduleForm((v) => !v)}
            className="w-full h-11 px-4 rounded-[4px] bg-[#133865] hover:bg-[#1c4d8a] border border-[#2b6cb0] text-xs font-extrabold text-[#f4f6fb] inline-flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#ffdc2b] shrink-0" />
            <span className="truncate">
              {showScheduleForm
                ? "Fechar Agendador"
                : "+ Agendar Novo Leilão"}
            </span>
          </button>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MÓDULO 1: CENTRAL DE LEILÕES (VITRINE BOLA PRETA + 3 SUB-ABAS)        */}
      {/* ==================================================================== */}
      {activeTab === "auctions" && (
        <div className="space-y-6">
          {/* Formulário de Agendamento Prévio de Leilão */}
          {showScheduleForm && (
            <form
              onSubmit={handleScheduleAuction}
              className="bg-[#111622] border-2 border-[#ffdc2b]/60 rounded-[4px] p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#ffdc2b] flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Agendamento Prévio de Leilão Oficial (Apenas Jogadores Sem
                      Clube)
                    </span>
                  </h3>
                  <p className="text-xs text-[#9aa5b8] mt-0.5">
                    Configure um evento futuro ou inicie imediatamente. Atletas
                    que já possuem clube não podem ir a leilão pelo banco.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-[#78849e] mb-1">
                    Craque Livre para Leiloar
                  </label>
                  <select
                    value={schedAthleteId}
                    onChange={(e) => setSchedAthleteId(e.target.value)}
                    className="w-full h-11 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs font-bold text-[#f4f6fb]"
                  >
                    {athletes
                      .filter((a) => !contractedAthleteIds.has(a.id))
                      .map((a) => (
                        <option
                          key={a.id}
                          value={a.id}
                          className="bg-[#111622]"
                        >
                          {a.ballType === "BOLA_PRETA" ? "⚫ " : "🟡 "}
                          {a.name} (OVR {a.overall} • {a.position} •{" "}
                          {a.defaultTeam})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#78849e] mb-1">
                    Lance Mínimo (Escudos)
                  </label>
                  <input
                    type="number"
                    step={5}
                    min={10}
                    value={schedStartBid}
                    onChange={(e) => setSchedStartBid(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs font-bold text-[#ffdc2b]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#78849e] mb-1">
                    Incremento Mínimo
                  </label>
                  <select
                    value={schedMinIncrement}
                    onChange={(e) =>
                      setSchedMinIncrement(Number(e.target.value))
                    }
                    className="w-full h-11 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs font-bold text-[#4ade80]"
                  >
                    <option value={5} className="bg-[#111622]">
                      5 em 5 Escudos (Padrão)
                    </option>
                    <option value={10} className="bg-[#111622]">
                      10 em 10 Escudos
                    </option>
                    <option value={20} className="bg-[#111622]">
                      20 em 20 Escudos
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#78849e] mb-1">
                    Horário de Abertura
                  </label>
                  <select
                    value={schedStartsInMinutes}
                    onChange={(e) =>
                      setSchedStartsInMinutes(Number(e.target.value))
                    }
                    className="w-full h-11 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs font-bold text-[#f4f6fb]"
                  >
                    <option value={0} className="bg-[#111622]">
                      Iniciar Agora (ATIVO)
                    </option>
                    <option value={30} className="bg-[#111622]">
                      Daqui a 30 min (AGENDADO)
                    </option>
                    <option value={60} className="bg-[#111622]">
                      Daqui a 1 hora (AGENDADO)
                    </option>
                    <option value={180} className="bg-[#111622]">
                      Daqui a 3 horas (AGENDADO)
                    </option>
                    <option value={1440} className="bg-[#111622]">
                      Amanhã no mesmo horário
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <span className="text-[11px] text-[#78849e]">
                  Duração da janela de lances após abrir:{" "}
                  <strong className="text-[#f4f6fb]">
                    {schedDurationMinutes} minutos
                  </strong>{" "}
                  (com prorrogação automática Anti-Sniper +2 min).
                </span>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto sm:min-w-[240px] h-11 px-5 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-extrabold text-xs inline-flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  Confirmar Publicação no Calendário
                </button>
              </div>
            </form>
          )}

          {/* Vitrine e Divulgação Antecipada de Craques "Bola Preta" */}
          <div className="bg-gradient-to-r from-[#111622] via-[#151e32] to-[#111622] border border-[#ffdc2b]/35 rounded-[4px] p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[2px] bg-black text-[#ffdc2b] border border-[#ffdc2b] text-[11px] font-extrabold uppercase">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#111] border border-[#ffdc2b]" />
                  <span>VITRINE BOLA PRETA • CALENDÁRIO OFICIAL</span>
                </span>
                <span className="text-xs text-[#b6c0d4]">
                  Programação pública de craques de elite com dia e hora
                  marcados
                </span>
              </div>
              <Link
                href="/players"
                className="text-xs font-bold text-[#ffdc2b] hover:underline whitespace-nowrap"
              >
                Ver Database Completo de Jogadores →
              </Link>
            </div>

            {[...upcomingAuctions, ...activeAuctions].length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {[...upcomingAuctions, ...activeAuctions]
                  .slice(0, 5)
                  .map((item) => {
                    const isUpcoming =
                      item.status === "AGENDADO" &&
                      new Date(item.startsAt).getTime() > nowMs;
                    const timer = formatCountdown(
                      isUpcoming ? item.startsAt : item.endsAt,
                      nowMs
                    );

                    return (
                      <div
                        key={item.id}
                        onClick={() =>
                          setAuctionSubTab(isUpcoming ? "upcoming" : "active")
                        }
                        className="p-3 rounded-[4px] bg-[#090c12] border border-[#222c40] hover:border-[#ffdc2b] transition-colors cursor-pointer flex items-center gap-3"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.photoUrl}
                          alt={item.athleteName}
                          className="w-12 h-12 rounded-[4px] bg-[#111622] border border-[#ffdc2b]/40 object-contain object-bottom shrink-0 pt-0.5"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded-[2px] bg-[#ffdc2b] text-[#0e1312] text-[10px] font-extrabold">
                              {item.overall}
                            </span>
                            <span className="text-[10px] font-bold text-[#60a5fa]">
                              {item.position}
                            </span>
                          </div>
                          <div className="text-xs font-extrabold text-[#f4f6fb] truncate mt-0.5">
                            {item.athleteName}
                          </div>
                          <div className="text-[10px] text-[#9aa5b8] truncate">
                            {isUpcoming
                              ? `Abre em ${timer.formatted}`
                              : `Ao Vivo • ${formatEscudos(item.currentBid)}`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* 3 Sub-Abas de Leilões Padronizadas (Grid 3 Colunas Iguais h-11) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setAuctionSubTab("active")}
              className={`w-full h-11 px-4 rounded-[4px] text-xs font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                auctionSubTab === "active"
                  ? "bg-[#15a34a] text-[#090c12]"
                  : "bg-[#111622] hover:bg-[#161d2c] text-[#b6c0d4] border border-[#222c40]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Em Andamento (Ao Vivo)</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/25 leading-none shrink-0">
                {activeAuctions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAuctionSubTab("upcoming")}
              className={`w-full h-11 px-4 rounded-[4px] text-xs font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                auctionSubTab === "upcoming"
                  ? "bg-[#ffdc2b] text-[#0e1312]"
                  : "bg-[#111622] hover:bg-[#161d2c] text-[#b6c0d4] border border-[#222c40]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Próximos Leilões (Agendados)</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/25 leading-none shrink-0">
                {upcomingAuctions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAuctionSubTab("finished")}
              className={`w-full h-11 px-4 rounded-[4px] text-xs font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                auctionSubTab === "finished"
                  ? "bg-[#60a5fa] text-[#090c12]"
                  : "bg-[#111622] hover:bg-[#161d2c] text-[#b6c0d4] border border-[#222c40]"
              }`}
            >
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Finalizados (Histórico)</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/25 leading-none shrink-0">
                {finishedAuctions.length}
              </span>
            </button>
          </div>

          {/* SUB-ABA A: EM ANDAMENTO */}
          {auctionSubTab === "active" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeAuctions.map((auc) => {
                const { diffSec, formatted, isAntiSniperWindow } =
                  formatCountdown(auc.endsAt, nowMs);
                const step = auc.minIncrement || 5;
                const minNextBid = getMinimumValidBid(auc);
                const currentInputBid = bidAmounts[auc.id] ?? minNextBid;
                const isWinning =
                  auc.currentWinningClubId === currentClub?.id;

                return (
                  <div
                    key={auc.id}
                    className={`bg-[#111622] border rounded-[4px] p-4 flex flex-col justify-between gap-4 ${
                      isAntiSniperWindow
                        ? "border-[#ffdc2b] shadow-[0_0_20px_rgba(255,220,43,0.14)]"
                        : "border-[#222c40]"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={auc.photoUrl}
                            alt={auc.athleteName}
                            className="w-16 h-16 rounded-[6px] bg-gradient-to-b from-[#1e293b] to-[#090c12] border border-[#ffdc2b]/40 object-contain object-bottom shrink-0 pt-1"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-[2px] bg-[#ffdc2b] text-[#0e1312] font-extrabold text-xs">
                                OVR {auc.overall}
                              </span>
                              <span className="px-2 py-0.5 rounded-[2px] bg-[#161d2c] text-[#60a5fa] font-bold text-[11px] border border-[#222c40]">
                                {auc.position}
                              </span>
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-black text-[#ffdc2b] border border-[#ffdc2b]/40 text-[10px] font-extrabold">
                                <span className="w-2 h-2 rounded-full bg-[#111] border border-[#ffdc2b]" />
                                Bola Preta
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-[#f4f6fb] mt-1">
                              {auc.athleteName}
                            </h3>
                            <p className="text-[11px] text-[#78849e]">
                              Origem: {auc.defaultTeam} • Lance Inicial:{" "}
                              {formatEscudos(auc.startingBid)}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`px-3 py-1.5 rounded-[4px] border text-right ${
                            isAntiSniperWindow
                              ? "bg-[#dc2626]/20 border-[#dc2626] text-[#f87171]"
                              : "bg-[#090c12] border-[#222c40] text-[#f4f6fb]"
                          }`}
                        >
                          <div className="flex items-center justify-end gap-1 text-[10px] uppercase font-bold">
                            <Clock className="w-3 h-3" />
                            <span>
                              {isAntiSniperWindow
                                ? "ZONA ANTI-SNIPER"
                                : "ENCERRA EM"}
                            </span>
                          </div>
                          <div className="text-base font-mono font-extrabold tabular-nums">
                            {diffSec > 0 ? formatted : "ENCERRADO"}
                          </div>
                        </div>
                      </div>

                      {isAntiSniperWindow && (
                        <div className="mt-3 px-3 py-1.5 rounded-[4px] bg-[#ffdc2b]/15 border border-[#ffdc2b]/40 text-[#ffdc2b] text-[11px] font-bold flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            Anti-Sniper Ativo: Qualquer lance nos últimos 2
                            minutos prorroga o término em +02:00!
                          </span>
                        </div>
                      )}

                      <div className="mt-4 p-3 rounded-[4px] bg-[#0c1018] border border-[#1c2436] flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-[#78849e]">
                            Lance Atual (Escrow Reservado)
                          </div>
                          <div className="text-lg font-extrabold text-[#4ade80] tabular-nums">
                            {formatEscudos(auc.currentBid)}
                          </div>
                          <div className="text-[10px] text-[#78849e]">
                            Incremento mínimo: de {step} em {step} Escudos
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] uppercase font-bold text-[#78849e]">
                            Líder Atual
                          </div>
                          {auc.currentWinningClubName ? (
                            <div className="flex items-center justify-end gap-1.5 mt-0.5">
                              <ClubCrest
                                clubName={auc.currentWinningClubName}
                                size="sm"
                              />
                              <span className="text-xs font-bold text-[#f4f6fb]">
                                {auc.currentWinningClubName}
                              </span>
                              {isWinning && (
                                <span className="px-1.5 py-0.2 rounded-full bg-[#15a34a]/25 text-[#4ade80] text-[10px] font-bold">
                                  SEU CLUBE
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-[#78849e]">
                              Aguardando 1º lance (
                              {formatEscudos(auc.startingBid)})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#1c2436] space-y-2.5">
                      <div className="grid grid-cols-3 gap-2">
                        {[minNextBid, minNextBid + step, minNextBid + step * 2].map(
                          (quickVal) => (
                            <button
                              key={quickVal}
                              type="button"
                              disabled={isPending || diffSec === 0}
                              onClick={() => {
                                setBidAmounts((prev) => ({
                                  ...prev,
                                  [auc.id]: quickVal,
                                }));
                                handleQuickBid(auc, quickVal);
                              }}
                              className="w-full h-9 px-2 rounded-[4px] bg-[#161d2c] hover:bg-[#ffdc2b] text-[#ffdc2b] hover:text-[#0e1312] border border-[#ffdc2b]/40 text-[11px] font-extrabold inline-flex items-center justify-center transition-colors cursor-pointer tabular-nums"
                            >
                              +{formatEscudos(quickVal)}
                            </button>
                          )
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#78849e] mb-1">
                            Seu Lance (Mín: {formatEscudos(minNextBid)})
                          </label>
                          <input
                            type="number"
                            step={step}
                            min={minNextBid}
                            value={currentInputBid}
                            onChange={(e) =>
                              setBidAmounts((prev) => ({
                                ...prev,
                                [auc.id]: Number(e.target.value),
                              }))
                            }
                            className="w-full h-11 px-3 rounded-[4px] bg-[#090c12] border border-[#2c3852] text-xs font-bold text-[#f4f6fb] tabular-nums focus:border-[#ffdc2b] focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          disabled={isPending || diffSec === 0}
                          onClick={() => handleQuickBid(auc)}
                          className="w-full h-11 px-4 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-extrabold text-xs inline-flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Confirmar Lance
                        </button>
                      </div>

                      {auc.bids.length > 0 && (
                        <div className="text-[11px] text-[#78849e] flex items-center justify-between pt-1">
                          <span>
                            Histórico:{" "}
                            {auc.bids
                              .slice(0, 3)
                              .map(
                                (b) =>
                                  `${b.clubAcronym} (${formatEscudos(
                                    b.bidAmount
                                  )})`
                              )
                              .join(" → ")}
                          </span>
                          <span>{auc.bids.length} lance(s)</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SUB-ABA B: PRÓXIMOS LEILÕES */}
          {auctionSubTab === "upcoming" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingAuctions.map((auc) => {
                const startTimer = formatCountdown(auc.startsAt, nowMs);

                return (
                  <div
                    key={auc.id}
                    className="bg-[#111622] border border-[#ffdc2b]/40 rounded-[4px] p-4 flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#ffdc2b]/15 text-[#ffdc2b] border border-[#ffdc2b]/40 text-[10px] font-extrabold uppercase">
                          <Calendar className="w-3 h-3" />
                          <span>AGENDADO • UPCOMING</span>
                        </span>
                        <span className="text-[11px] font-bold text-[#9aa5b8]">
                          Início: {formatDateTimePtBr(auc.startsAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={auc.photoUrl}
                          alt={auc.athleteName}
                          className="w-18 h-18 rounded-[6px] bg-gradient-to-b from-[#1e293b] to-[#090c12] border border-[#ffdc2b]/50 object-contain object-bottom shrink-0 pt-1"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-[2px] bg-[#ffdc2b] text-[#0e1312] font-extrabold text-xs">
                              OVR {auc.overall}
                            </span>
                            <span className="px-2 py-0.5 rounded-[2px] bg-[#161d2c] text-[#60a5fa] font-bold text-[10px]">
                              {auc.position}
                            </span>
                          </div>
                          <h3 className="text-base font-extrabold text-[#f4f6fb] mt-1">
                            {auc.athleteName}
                          </h3>
                          <p className="text-xs text-[#9aa5b8]">
                            Clube Base: {auc.defaultTeam}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 p-3 rounded-[4px] bg-[#090c12] border border-[#1c2436] space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[#78849e]">
                            Lance Mínimo Inicial:
                          </span>
                          <span className="font-extrabold text-[#4ade80]">
                            {formatEscudos(auc.startingBid)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#78849e]">
                            Incremento por Lance:
                          </span>
                          <span className="font-bold text-[#f4f6fb]">
                            De {auc.minIncrement} em {auc.minIncrement} Escudos
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#78849e]">Encerramento:</span>
                          <span className="font-semibold text-[#b6c0d4]">
                            {formatDateTimePtBr(auc.endsAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="h-11 px-3 rounded-[4px] bg-[#ffdc2b]/10 border border-[#ffdc2b]/30 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase text-[#ffdc2b]">
                        Abre automaticamente em:
                      </span>
                      <span className="text-sm font-mono font-extrabold text-[#f4f6fb] tabular-nums">
                        {startTimer.formatted}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SUB-ABA C: FINALIZADOS */}
          {auctionSubTab === "finished" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {finishedAuctions.map((auc) => (
                <div
                  key={auc.id}
                  className="bg-[#111622] border border-[#222c40] rounded-[4px] p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={auc.photoUrl}
                      alt={auc.athleteName}
                      className="w-16 h-16 rounded-[6px] bg-[#090c12] border border-[#2c3852] object-contain object-bottom shrink-0 pt-1"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-[2px] bg-[#1d2639] text-[#ffdc2b] text-[10px] font-extrabold">
                          OVR {auc.overall} • {auc.position}
                        </span>
                        <span className="px-2 py-0.5 rounded-[2px] bg-[#15a34a]/20 text-[#4ade80] text-[10px] font-extrabold uppercase">
                          ARREMATADO
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#f4f6fb] mt-1">
                        {auc.athleteName}
                      </h3>
                      <p className="text-xs text-[#78849e]">
                        Vencedor:{" "}
                        <strong className="text-[#f4f6fb]">
                          {auc.currentWinningClubName ?? "Banco da Liga"}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-[#78849e]">
                      Valor Final do Arremate
                    </div>
                    <div className="text-lg font-extrabold text-[#ffdc2b] tabular-nums">
                      {formatEscudos(auc.currentBid)}
                    </div>
                    <div className="text-[10px] text-[#78849e]">
                      {auc.bids.length} lance(s) registrados
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MÓDULO 2: MULTA RESCISÓRIA & TRANSFERÊNCIA IMEDIATA EM ESCUDOS        */}
      {/* ==================================================================== */}
      {activeTab === "buyout" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setBuyoutSubMode("contracted")}
              className={`w-full h-11 px-4 rounded-[4px] text-xs font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                buyoutSubMode === "contracted"
                  ? "bg-[#dc2626] text-white"
                  : "bg-[#111622] hover:bg-[#161d2c] text-[#b6c0d4] border border-[#222c40]"
              }`}
            >
              <Flame className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                Jogadores em Clubes • Pagar Multa & Transferir (
                {contracts.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setBuyoutSubMode("free")}
              className={`w-full h-11 px-4 rounded-[4px] text-xs font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                buyoutSubMode === "free"
                  ? "bg-[#15a34a] text-[#090c12]"
                  : "bg-[#111622] hover:bg-[#161d2c] text-[#b6c0d4] border border-[#222c40]"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                Jogadores Livres no Banco da Federação (
                {athletes.length - contracts.length})
              </span>
            </button>
          </div>

          <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-[#78849e] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar atleta ou clube detentor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-9 pr-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs text-[#f4f6fb] focus:border-[#ffdc2b] focus:outline-none"
                />
              </div>

              <div className="h-11 flex items-center gap-2 bg-[#090c12] border border-[#222c40] rounded-[4px] px-3.5">
                <span className="text-[11px] text-[#78849e] font-semibold shrink-0">
                  Overall Mínimo:
                </span>
                <select
                  value={minOverall}
                  onChange={(e) => setMinOverall(Number(e.target.value))}
                  className="w-full bg-transparent text-xs font-bold text-[#ffdc2b] focus:outline-none cursor-pointer"
                >
                  <option value={77} className="bg-[#111622]">
                    77+ OVR (Todos)
                  </option>
                  <option value={80} className="bg-[#111622]">
                    80+ OVR (Bola Ouro)
                  </option>
                  <option value={85} className="bg-[#111622]">
                    85+ OVR (Bola Preta)
                  </option>
                  <option value={89} className="bg-[#111622]">
                    89+ OVR (World Class)
                  </option>
                </select>
              </div>

              <div className="h-11 flex items-center gap-2 bg-[#090c12] border border-[#222c40] rounded-[4px] px-3.5">
                <span className="text-[11px] text-[#78849e] font-semibold shrink-0">
                  Posição:
                </span>
                <select
                  value={posFilter}
                  onChange={(e) => setPosFilter(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-[#f4f6fb] focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-[#111622]">
                    Todas as Posições
                  </option>
                  <option value="ATA" className="bg-[#111622]">
                    ATA (Atacante)
                  </option>
                  <option value="PE" className="bg-[#111622]">
                    PE (Ponta Esq.)
                  </option>
                  <option value="PD" className="bg-[#111622]">
                    PD (Ponta Dir.)
                  </option>
                  <option value="MEI" className="bg-[#111622]">
                    MEI (Meia)
                  </option>
                  <option value="MC" className="bg-[#111622]">
                    MC / VOL
                  </option>
                  <option value="ZAG" className="bg-[#111622]">
                    ZAG (Defensor)
                  </option>
                  <option value="GOL" className="bg-[#111622]">
                    GOL (Goleiro)
                  </option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#ffdc2b]">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                {isWindowOpen
                  ? "Janela Aberta: Pagamento da multa transfere o jogador imediatamente para o seu elenco!"
                  : "Janela Fechada: Jogadores estão travados em seus clubes até a próxima abertura."}
              </span>
            </div>
          </div>

          {buyoutSubMode === "contracted" ? (
            <div className="bg-[#111622] border border-[#222c40] rounded-[4px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#222c40] bg-[#0c1018] text-[11px] font-bold uppercase text-[#78849e]">
                      <th className="py-3 px-4">Jogador</th>
                      <th className="py-3 px-3 text-center">Posição</th>
                      <th className="py-3 px-3 text-center">OVR</th>
                      <th className="py-3 px-3">Clube Exclusivo Atual</th>
                      <th className="py-3 px-3 text-right">Salário</th>
                      <th className="py-3 px-3 text-right">Multa Rescisória</th>
                      <th className="py-3 px-4 text-right">
                        Transferência por Multa
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c2436] text-xs">
                    {filteredContracts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-8 px-4 text-center text-[#9aa5b8]"
                        >
                          Nenhum jogador contratado encontrado com esses
                          filtros. Clique na aba{" "}
                          <button
                            type="button"
                            onClick={() => setBuyoutSubMode("free")}
                            className="text-[#ffdc2b] font-bold underline cursor-pointer"
                          >
                            Jogadores Livres no Banco da Federação
                          </button>{" "}
                          para contratar atletas para o seu clube!
                        </td>
                      </tr>
                    ) : (
                      filteredContracts.map((c) => {
                        const isOwnPlayer = c.clubTeamId === currentClub?.id;
                        const canAfford =
                          (currentClub?.balance ?? 0) >= c.buyoutClause;
                        const canExecuteBuyout =
                          isWindowOpen &&
                          transferWindow.buyoutEnabled &&
                          canAfford;

                        return (
                          <tr
                            key={c.id}
                            className="hover:bg-[#161d2c]/60 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={c.photoUrl}
                                  alt={c.athleteName}
                                  className="w-11 h-11 rounded-[6px] bg-gradient-to-b from-[#1e293b] to-[#090c12] border border-[#2c3852] object-contain object-bottom shrink-0 pt-0.5"
                                />
                                <div>
                                  <div className="font-bold text-[#f4f6fb]">
                                    {c.athleteName}
                                  </div>
                                  <div className="text-[11px] text-[#78849e]">
                                    {c.age} anos • Base: {c.defaultTeam}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3 text-center">
                              <span className="px-2 py-0.5 rounded-[2px] bg-[#161d2c] text-[#60a5fa] font-bold text-[11px] border border-[#222c40]">
                                {c.position}
                              </span>
                            </td>

                            <td className="py-3 px-3 text-center">
                              <span
                                className={`inline-flex items-center justify-center w-8 h-7 rounded-[4px] font-extrabold text-xs ${
                                  c.overall >= 88
                                    ? "bg-[#ffdc2b] text-[#0e1312]"
                                    : "bg-[#1d2639] text-[#f4f6fb]"
                                }`}
                              >
                                {c.overall}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <ClubCrest clubName={c.clubName} size="sm" />
                                <div>
                                  <div className="font-semibold text-[#f4f6fb]">
                                    {c.clubName}
                                  </div>
                                  <div className="text-[10px] text-[#78849e]">
                                    Treinador: {c.ownerNickname}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3 text-right tabular-nums text-[#b6c0d4]">
                              {formatEscudos(c.salary)}
                            </td>

                            <td className="py-3 px-3 text-right">
                              <span className="font-extrabold text-[#ffdc2b] tabular-nums">
                                {formatEscudos(c.buyoutClause)}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right">
                              {isOwnPlayer ? (
                                <span className="inline-flex items-center justify-center min-w-[195px] h-10 px-3 rounded-[4px] bg-[#161d2c] text-[#4ade80] text-xs font-bold">
                                  Atleta do Seu Clube
                                </span>
                              ) : !isWindowOpen ||
                                !transferWindow.buyoutEnabled ? (
                                <span className="inline-flex items-center justify-center gap-1.5 min-w-[195px] h-10 px-3 rounded-[4px] bg-[#161d2c] border border-[#222c40] text-[#9aa5b8] text-xs font-bold">
                                  <Lock className="w-3.5 h-3.5 text-[#f87171]" />
                                  <span>Travado (Janela Fechada)</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  disabled={isPending || !canExecuteBuyout}
                                  onClick={() => handlePayBuyout(c)}
                                  className={`inline-flex items-center justify-center gap-1.5 min-w-[195px] h-10 px-3.5 rounded-[4px] text-xs font-extrabold transition-colors cursor-pointer ${
                                    canAfford
                                      ? "bg-[#dc2626] hover:bg-[#b91c1c] text-white"
                                      : "bg-[#1d2639] text-[#78849e] opacity-60 cursor-not-allowed"
                                  }`}
                                >
                                  <Flame className="w-3.5 h-3.5 shrink-0" />
                                  <span>
                                    {canAfford
                                      ? "Pagar Multa & Transferir"
                                      : "Escudos Insuficientes"}
                                  </span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-[#111622] border border-[#222c40] rounded-[4px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#222c40] bg-[#0c1018] text-[11px] font-bold uppercase text-[#78849e]">
                      <th className="py-3 px-4">Jogador Livre</th>
                      <th className="py-3 px-3 text-center">Posição</th>
                      <th className="py-3 px-3 text-center">OVR</th>
                      <th className="py-3 px-3">Clube de Origem</th>
                      <th className="py-3 px-3 text-right">Custo do Passe</th>
                      <th className="py-3 px-4 text-right">
                        Contratação Direta
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c2436] text-xs">
                    {filteredFreeAgents.map((a) => {
                      const { signingFee: cost } = getFreeAgentSigningCost(
                        a.overall
                      );
                      const canAfford = (currentClub?.balance ?? 0) >= cost;

                      return (
                        <tr
                          key={a.id}
                          className="hover:bg-[#161d2c]/60 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={a.photoUrl}
                                alt={a.name}
                                className="w-11 h-11 rounded-[6px] bg-gradient-to-b from-[#1e293b] to-[#090c12] border border-[#2c3852] object-contain object-bottom shrink-0 pt-0.5"
                              />
                              <div>
                                <div className="font-bold text-[#f4f6fb]">
                                  {a.name}
                                </div>
                                <div className="text-[11px] text-[#78849e]">
                                  {a.age} anos • Livre no Banco da Federação
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-[2px] bg-[#161d2c] text-[#60a5fa] font-bold text-[11px] border border-[#222c40]">
                              {a.position}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-7 rounded-[4px] font-extrabold text-xs ${
                                a.overall >= 88
                                  ? "bg-[#ffdc2b] text-[#0e1312]"
                                  : "bg-[#1d2639] text-[#f4f6fb]"
                              }`}
                            >
                              {a.overall}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <ClubCrest clubName={a.defaultTeam} size="sm" />
                              <span className="font-semibold text-[#f4f6fb]">
                                {a.defaultTeam}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <span className="font-extrabold text-[#ffdc2b] tabular-nums">
                              {formatEscudos(cost)}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            {!isWindowOpen ||
                            !transferWindow.freeAgencyEnabled ? (
                              <span className="inline-flex items-center justify-center gap-1.5 min-w-[195px] h-10 px-3 rounded-[4px] bg-[#161d2c] border border-[#222c40] text-[#9aa5b8] text-xs font-bold">
                                <Lock className="w-3.5 h-3.5 text-[#f87171]" />
                                <span>Janela Fechada</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={
                                  isPending || !currentClub || !canAfford
                                }
                                onClick={() => handleSignFreeAgent(a)}
                                className={`inline-flex items-center justify-center gap-1.5 min-w-[195px] h-10 px-3.5 rounded-[4px] text-xs font-extrabold transition-colors cursor-pointer ${
                                  canAfford
                                    ? "bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312]"
                                    : "bg-[#1d2639] text-[#78849e] opacity-60 cursor-not-allowed"
                                }`}
                              >
                                <UserPlus className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                  {canAfford
                                    ? "Contratar Agora"
                                    : "Escudos Insuficientes"}
                                </span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MÓDULO 3: PROPOSTAS DE TROCA & NEGOCIAÇÕES DIRETAS EM ESCUDOS         */}
      {/* ==================================================================== */}
      {activeTab === "proposals" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#f4f6fb]">
              Negociações Diretas & Trocas entre Clubes
            </h2>

            {proposals.map((p) => {
              const isIncoming = p.toClubId === currentClub?.id;
              const isOutgoing = p.fromClubId === currentClub?.id;

              return (
                <div
                  key={p.id}
                  className="bg-[#111622] border border-[#222c40] rounded-[4px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-[2px] text-[10px] font-extrabold uppercase ${
                          p.status === "PENDENTE"
                            ? "bg-[#ffdc2b]/20 text-[#ffdc2b]"
                            : p.status === "ACEITA"
                            ? "bg-[#15a34a]/20 text-[#4ade80]"
                            : "bg-[#dc2626]/20 text-[#f87171]"
                        }`}
                      >
                        {p.status}
                      </span>
                      {isIncoming && (
                        <span className="text-[11px] font-bold text-[#4ade80]">
                          • Recebida pelo seu clube
                        </span>
                      )}
                      {isOutgoing && (
                        <span className="text-[11px] font-bold text-[#60a5fa]">
                          • Enviada pelo seu clube
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-[#f4f6fb]">
                        <ClubCrest clubName={p.fromClubName} size="sm" />
                        <span>{p.fromClubName} oferece:</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-[4px] bg-[#161d2c] text-[#ffdc2b] font-bold">
                        {p.offeredAthletes.map((a) => a.name).join(", ") ||
                          "Apenas Escudos"}
                      </span>
                      {p.cashAmount > 0 && (
                        <span className="px-2 py-0.5 rounded-[4px] bg-[#15a34a]/20 text-[#4ade80] font-bold">
                          + {formatEscudos(p.cashAmount)}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-[#b6c0d4]">
                        <ClubCrest clubName={p.toClubName} size="sm" />
                        <span>Em troca de ({p.toClubName}):</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-[4px] bg-[#161d2c] text-[#60a5fa] font-bold">
                        {p.requestedAthletes.map((a) => a.name).join(", ") ||
                          "Liberação Direta"}
                      </span>
                    </div>
                  </div>

                  {p.status === "PENDENTE" && (
                    <div className="grid grid-cols-2 gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={
                          isPending ||
                          !isWindowOpen ||
                          !transferWindow.tradesEnabled
                        }
                        onClick={() => handleRespondProposal(p.id, "ACEITA")}
                        className="min-w-[130px] h-10 px-3 rounded-[4px] bg-[#15a34a] hover:bg-[#16a34a] text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aceitar Troca</span>
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleRespondProposal(p.id, "RECUSADA")}
                        className="min-w-[130px] h-10 px-3 rounded-[4px] bg-[#dc2626]/20 hover:bg-[#dc2626]/30 border border-[#dc2626]/40 text-[#f87171] font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Recusar</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Formulário: Enviar Nova Proposta de Troca */}
          <form
            onSubmit={handleCreateProposal}
            className="bg-[#111622] border border-[#222c40] rounded-[4px] p-4 space-y-4 h-fit"
          >
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#f4f6fb]">
                Enviar Nova Proposta de Troca
              </h3>
              <p className="text-xs text-[#78849e] mt-0.5">
                Proponha troca de jogadores + compensação em Escudos
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#78849e] mb-1">
                Clube Destinatário
              </label>
              <select
                value={targetClubId}
                onChange={(e) => {
                  setTargetClubId(e.target.value);
                  setRequestedAthleteId("");
                }}
                className="w-full h-11 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs font-bold text-[#f4f6fb]"
              >
                {clubs
                  .filter((c) => c.id !== currentClub?.id)
                  .map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#111622]">
                      {c.name} ({c.ownerNickname})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#78849e] mb-1">
                Jogador Oferecido (Do Seu Elenco)
              </label>
              <select
                value={offeredAthleteId}
                onChange={(e) => setOfferedAthleteId(e.target.value)}
                className="w-full h-11 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs text-[#f4f6fb]"
              >
                {myContracts.map((c) => (
                  <option
                    key={c.athleteId}
                    value={c.athleteId}
                    className="bg-[#111622]"
                  >
                    {c.athleteName} (OVR {c.overall} • {c.position})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#78849e] mb-1">
                Jogador Solicitado (Do Adversário)
              </label>
              <select
                value={requestedAthleteId}
                onChange={(e) => setRequestedAthleteId(e.target.value)}
                className="w-full h-11 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs text-[#f4f6fb]"
              >
                {targetClubContracts.map((c) => (
                  <option
                    key={c.athleteId}
                    value={c.athleteId}
                    className="bg-[#111622]"
                  >
                    {c.athleteName} (OVR {c.overall} • {c.position})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#78849e] mb-1">
                Volta em Escudos (+ Compensação)
              </label>
              <input
                type="number"
                step={5}
                min={0}
                value={cashOffer}
                onChange={(e) => setCashOffer(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs font-bold text-[#4ade80]"
              />
            </div>

            <button
              type="submit"
              disabled={
                isPending || !isWindowOpen || !transferWindow.tradesEnabled
              }
              className="w-full h-11 px-4 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-extrabold text-xs inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isWindowOpen
                  ? "Enviar Proposta Oficial"
                  : "Janela Fechada (Propostas Pausadas)"}
              </span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
