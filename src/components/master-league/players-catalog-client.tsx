"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  Gavel,
  Flame,
  Users,
  ChevronDown,
  Lock,
  Unlock,
  Wallet,
  UserPlus,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import type {
  AthleteDTO,
  ContractRosterItemDTO,
  AuctionDTO,
  ClubTeamDTO,
  TransferWindowSettingsDTO,
} from "@/lib/master-league-data";
import {
  formatEscudos,
  getFreeAgentSigningCost,
} from "@/lib/master-league-data";
import {
  payBuyoutClauseAction,
  signFreeAgentAction,
} from "@/app/actions/master-league-actions";
import { ClubCrest } from "@/lib/club-crests";

interface PlayersCatalogClientProps {
  athletes: AthleteDTO[];
  contracts: ContractRosterItemDTO[];
  auctions: AuctionDTO[];
  clubs: ClubTeamDTO[];
  transferWindow: TransferWindowSettingsDTO;
  initialClubId: string;
}

type SortMode = "OVERALL_DESC" | "OVERALL_ASC" | "NAME_ASC" | "NAME_DESC";
type AvailabilityFilter = "ALL" | "FREE_AGENTS" | "CONTRACTED";

const PAGE_SIZE = 48;

export function PlayersCatalogClient({
  athletes,
  contracts,
  auctions,
  clubs,
  transferWindow,
  initialClubId,
}: PlayersCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [ballFilter, setBallFilter] = useState<
    "ALL" | "BOLA_PRETA" | "BOLA_OURO" | "BOLA_PRATA"
  >("ALL");
  const [posFilter, setPosFilter] = useState<string>("ALL");
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("ALL");
  const [sortMode, setSortMode] = useState<SortMode>("OVERALL_DESC");
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [activeClubId, setActiveClubId] = useState<string>(
    initialClubId || clubs[0]?.id || ""
  );
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentClub =
    clubs.find((c) => c.id === activeClubId) ?? clubs[0] ?? null;

  const contractByAthleteId = useMemo(() => {
    const map = new Map<string, ContractRosterItemDTO>();
    for (const c of contracts) {
      map.set(c.athleteId, c);
    }
    return map;
  }, [contracts]);

  const auctionByAthleteId = useMemo(() => {
    const map = new Map<string, AuctionDTO>();
    for (const a of auctions) {
      if (a.status === "ATIVO" || a.status === "AGENDADO") {
        map.set(a.athleteId, a);
      }
    }
    return map;
  }, [auctions]);

  const filteredAndSortedAthletes = useMemo(() => {
    const list = athletes.filter((a) => {
      if (ballFilter !== "ALL" && a.ballType !== ballFilter) return false;
      if (posFilter !== "ALL" && a.position !== posFilter) return false;

      const contract = contractByAthleteId.get(a.id);
      if (availabilityFilter === "FREE_AGENTS" && contract) return false;
      if (availabilityFilter === "CONTRACTED" && !contract) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = a.name.toLowerCase().includes(q);
        const matchesOrigin = a.defaultTeam.toLowerCase().includes(q);
        const matchesClub = contract?.clubName.toLowerCase().includes(q);
        if (!matchesName && !matchesOrigin && !matchesClub) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortMode === "OVERALL_DESC") {
        return b.overall - a.overall || a.name.localeCompare(b.name, "pt-BR");
      }
      if (sortMode === "OVERALL_ASC") {
        return a.overall - b.overall || a.name.localeCompare(b.name, "pt-BR");
      }
      if (sortMode === "NAME_ASC") {
        return a.name.localeCompare(b.name, "pt-BR");
      }
      return b.name.localeCompare(a.name, "pt-BR");
    });
  }, [
    athletes,
    ballFilter,
    posFilter,
    availabilityFilter,
    searchQuery,
    sortMode,
    contractByAthleteId,
  ]);

  const displayedAthletes = useMemo(
    () => filteredAndSortedAthletes.slice(0, visibleCount),
    [filteredAndSortedAthletes, visibleCount]
  );

  const blackBallCount = useMemo(
    () => athletes.filter((a) => a.ballType === "BOLA_PRETA").length,
    [athletes]
  );
  const goldBallCount = useMemo(
    () => athletes.filter((a) => a.ballType === "BOLA_OURO").length,
    [athletes]
  );
  const silverBallCount = useMemo(
    () => athletes.filter((a) => a.ballType === "BOLA_PRATA").length,
    [athletes]
  );

  function handleFilterChange<T>(setter: (val: T) => void, val: T) {
    setter(val);
    setVisibleCount(PAGE_SIZE);
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

  function handlePayBuyoutAndTransfer(contract: ContractRosterItemDTO) {
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

  const isWindowOpen = transferWindow.isOpenNow;

  return (
    <div className="space-y-6">
      {/* Header do Catálogo Global + Status da Janela de Transferências */}
      <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded-[2px] bg-[#ffdc2b] text-[#0e1312] text-[11px] font-extrabold uppercase">
              DATABASE GLOBAL DE ATLETAS ({athletes.length})
            </span>
            {isWindowOpen ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[2px] bg-[#15a34a]/20 border border-[#15a34a]/50 text-[11px] font-extrabold text-[#4ade80] uppercase">
                <Unlock className="w-3 h-3" />
                JANELA DE TRANSFERÊNCIAS ABERTA
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[2px] bg-[#dc2626]/20 border border-[#dc2626]/50 text-[11px] font-extrabold text-[#f87171] uppercase">
                <Lock className="w-3 h-3" />
                JANELA FECHADA • ELENCOS TRAVADOS
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#090c12] border border-[#2c3852] text-[11px] font-bold text-[#f4f6fb]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#111] border border-[#ffdc2b] inline-block" />
              {blackBallCount} Bola Preta
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#090c12] border border-[#2c3852] text-[11px] font-bold text-[#ffdc2b]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#facc15] inline-block" />
              {goldBallCount} Bola Ouro
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#f4f6fb] mt-1.5">
            Catálogo Oficial de Jogadores & Contratações
          </h1>
          <p className="text-xs text-[#78849e] mt-0.5">
            Regra Master Liga: Cada atleta possui vínculo exclusivo com apenas 1
            clube. Quando a Janela de Transferências está aberta, você pode
            contratar jogadores livres ou pagar a Multa Rescisória para
            transferir imediatamente de outro clube.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {currentClub && (
            <div className="flex items-center gap-2.5 bg-[#090c12] border border-[#222c40] rounded-[4px] px-3 py-1.5">
              <ClubCrest clubName={currentClub.name} size="sm" />
              <div>
                <div className="text-[10px] text-[#78849e] uppercase font-bold">
                  Seu Clube ({formatEscudos(currentClub.balance)}):
                </div>
                <select
                  value={activeClubId}
                  onChange={(e) => {
                    setActiveClubId(e.target.value);
                    setFeedback(null);
                  }}
                  className="bg-transparent text-xs font-bold text-[#ffdc2b] focus:outline-none cursor-pointer"
                >
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#111622]">
                      {c.name} ({c.ownerNickname})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <Link
            href="/transfers"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] text-xs font-extrabold transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendário da Janela & Multas</span>
          </Link>
          <Link
            href="/auctions"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[4px] bg-[#161d2c] hover:bg-[#1e273b] border border-[#2c3852] text-xs font-bold text-[#f4f6fb] transition-colors"
          >
            <Gavel className="w-3.5 h-3.5 text-[#ffdc2b]" />
            <span>Leilões</span>
          </Link>
        </div>
      </div>

      {/* Feedback de Contratação / Pagamento de Multa */}
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

      {/* Barra de Filtros Dinâmicos e Seletores de Ordenação */}
      <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Busca Textual */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#78849e] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar jogador ou clube (ex: Mbappé, Real Madrid, Arsenal)..."
              value={searchQuery}
              onChange={(e) =>
                handleFilterChange(setSearchQuery, e.target.value)
              }
              className="w-full pl-9 pr-3 py-2 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs text-[#f4f6fb] focus:border-[#ffdc2b] focus:outline-none"
            />
          </div>

          {/* Filtro por Categoria (Bola Preta / Bola Ouro / Bola Prata) */}
          <div className="flex items-center gap-2 bg-[#090c12] border border-[#222c40] rounded-[4px] px-3 py-2">
            <Sparkles className="w-3.5 h-3.5 text-[#ffdc2b] shrink-0" />
            <span className="text-[11px] text-[#78849e] font-semibold shrink-0">
              Categoria:
            </span>
            <select
              value={ballFilter}
              onChange={(e) =>
                handleFilterChange(
                  setBallFilter,
                  e.target.value as
                    | "ALL"
                    | "BOLA_PRETA"
                    | "BOLA_OURO"
                    | "BOLA_PRATA"
                )
              }
              className="w-full bg-transparent text-xs font-bold text-[#ffdc2b] focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#111622]">
                Todas as Categorias ({athletes.length})
              </option>
              <option value="BOLA_PRETA" className="bg-[#111622]">
                ⚫ Bola Preta — Elite 85+ ({blackBallCount})
              </option>
              <option value="BOLA_OURO" className="bg-[#111622]">
                🟡 Bola Ouro — 80 a 84 OVR ({goldBallCount})
              </option>
              <option value="BOLA_PRATA" className="bg-[#111622]">
                ⚪ Bola Prata — 77 a 79 OVR ({silverBallCount})
              </option>
            </select>
          </div>

          {/* Filtro por Posição */}
          <div className="flex items-center gap-2 bg-[#090c12] border border-[#222c40] rounded-[4px] px-3 py-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#60a5fa] shrink-0" />
            <span className="text-[11px] text-[#78849e] font-semibold shrink-0">
              Posição:
            </span>
            <select
              value={posFilter}
              onChange={(e) => handleFilterChange(setPosFilter, e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-[#f4f6fb] focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#111622]">
                Todas as Posições
              </option>
              <option value="ATA" className="bg-[#111622]">
                ATA — Centroavante / Atacante
              </option>
              <option value="PE" className="bg-[#111622]">
                PE — Ponta / Meia Esquerda
              </option>
              <option value="PD" className="bg-[#111622]">
                PD — Ponta / Meia Direita
              </option>
              <option value="MEI" className="bg-[#111622]">
                MEI — Meia Armador
              </option>
              <option value="MC" className="bg-[#111622]">
                MC — Meio-Campista Central
              </option>
              <option value="VOL" className="bg-[#111622]">
                VOL — Volante
              </option>
              <option value="ZAG" className="bg-[#111622]">
                ZAG — Zagueiro
              </option>
              <option value="LE" className="bg-[#111622]">
                LE — Lateral Esquerdo
              </option>
              <option value="LD" className="bg-[#111622]">
                LD — Lateral Direito
              </option>
              <option value="GOL" className="bg-[#111622]">
                GOL — Goleiro
              </option>
            </select>
          </div>

          {/* Seletor de Ordenação */}
          <div className="flex items-center gap-2 bg-[#090c12] border border-[#222c40] rounded-[4px] px-3 py-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#4ade80] shrink-0" />
            <span className="text-[11px] text-[#78849e] font-semibold shrink-0">
              Ordenar:
            </span>
            <select
              value={sortMode}
              onChange={(e) =>
                handleFilterChange(setSortMode, e.target.value as SortMode)
              }
              className="w-full bg-transparent text-xs font-bold text-[#4ade80] focus:outline-none cursor-pointer"
            >
              <option value="OVERALL_DESC" className="bg-[#111622]">
                Overall: Maior ao Menor (91 → 77)
              </option>
              <option value="OVERALL_ASC" className="bg-[#111622]">
                Overall: Menor ao Maior (77 → 91)
              </option>
              <option value="NAME_ASC" className="bg-[#111622]">
                Ordem Alfabética: A → Z
              </option>
              <option value="NAME_DESC" className="bg-[#111622]">
                Ordem Alfabética: Z → A
              </option>
            </select>
          </div>
        </div>

        {/* Chips rápidos de filtro */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleFilterChange(setBallFilter, "ALL")}
              className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold cursor-pointer transition-colors ${
                ballFilter === "ALL"
                  ? "bg-[#ffdc2b] text-[#0e1312]"
                  : "bg-[#090c12] text-[#9aa5b8] border border-[#222c40]"
              }`}
            >
              Todos ({athletes.length})
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange(setBallFilter, "BOLA_PRETA")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-bold cursor-pointer transition-colors ${
                ballFilter === "BOLA_PRETA"
                  ? "bg-[#ffdc2b] text-[#0e1312]"
                  : "bg-[#090c12] text-[#f4f6fb] border border-[#2c3852]"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-black border border-[#ffdc2b]" />
              <span>Bola Preta ({blackBallCount})</span>
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange(setBallFilter, "BOLA_OURO")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-bold cursor-pointer transition-colors ${
                ballFilter === "BOLA_OURO"
                  ? "bg-[#ffdc2b] text-[#0e1312]"
                  : "bg-[#090c12] text-[#9aa5b8] border border-[#222c40]"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#facc15]" />
              <span>Bola Ouro ({goldBallCount})</span>
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange(setBallFilter, "BOLA_PRATA")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-bold cursor-pointer transition-colors ${
                ballFilter === "BOLA_PRATA"
                  ? "bg-[#ffdc2b] text-[#0e1312]"
                  : "bg-[#090c12] text-[#9aa5b8] border border-[#222c40]"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#cbd5e1]" />
              <span>Bola Prata ({silverBallCount})</span>
            </button>

            <span className="mx-1 text-[#222c40]">|</span>

            <button
              type="button"
              onClick={() =>
                handleFilterChange(setAvailabilityFilter, "FREE_AGENTS")
              }
              className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold cursor-pointer transition-colors ${
                availabilityFilter === "FREE_AGENTS"
                  ? "bg-[#15a34a] text-[#090c12]"
                  : "bg-[#090c12] text-[#4ade80] border border-[#15a34a]/40"
              }`}
            >
              Livres para Contratar ({athletes.length - contracts.length})
            </button>
            <button
              type="button"
              onClick={() =>
                handleFilterChange(setAvailabilityFilter, "CONTRACTED")
              }
              className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold cursor-pointer transition-colors ${
                availabilityFilter === "CONTRACTED"
                  ? "bg-[#dc2626] text-white"
                  : "bg-[#090c12] text-[#f87171] border border-[#dc2626]/40"
              }`}
            >
              Em Clubes / Multa Rescisória ({contracts.length})
            </button>
          </div>

          <div className="text-[11px] text-[#78849e] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#ffdc2b]" />
            <span>
              Exibindo{" "}
              <strong className="text-[#f4f6fb]">
                {displayedAthletes.length}
              </strong>{" "}
              de{" "}
              <strong className="text-[#f4f6fb]">
                {filteredAndSortedAthletes.length}
              </strong>{" "}
              atletas filtrados
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Cards Visuais dos Jogadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedAthletes.map((athlete) => {
          const contract = contractByAthleteId.get(athlete.id);
          const auction = auctionByAthleteId.get(athlete.id);
          const isBlackBall = athlete.ballType === "BOLA_PRETA";
          const isGoldBall = athlete.ballType === "BOLA_OURO";
          const { signingFee: freeAgentCost } = getFreeAgentSigningCost(
            athlete.overall
          );
          const isMyPlayer =
            contract && currentClub && contract.clubTeamId === currentClub.id;
          const canAffordBuyout =
            contract &&
            currentClub &&
            currentClub.balance >= contract.buyoutClause;
          const canAffordFreeAgent =
            currentClub && currentClub.balance >= freeAgentCost;

          return (
            <div
              key={athlete.id}
              className={`bg-[#111622] border rounded-[4px] overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-0.5 ${
                isBlackBall
                  ? "border-[#2c3852] hover:border-[#ffdc2b]/60"
                  : "border-[#222c40]"
              }`}
            >
              {/* Topo Visual do Card */}
              <div className="relative p-4 bg-gradient-to-b from-[#182236] to-[#111622] border-b border-[#1c2436] flex items-center gap-3.5">
                {/* Foto Oficial Recortada */}
                <div className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={athlete.photoUrl}
                    alt={athlete.name}
                    loading="lazy"
                    className="w-20 h-20 rounded-[6px] bg-gradient-to-b from-[#0f172a] to-[#090c12] border border-[#ffdc2b]/40 object-contain object-bottom pt-1"
                  />
                  <span
                    className={`absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded-[3px] text-xs font-extrabold tabular-nums shadow ${
                      athlete.overall >= 88
                        ? "bg-[#ffdc2b] text-[#0e1312]"
                        : athlete.overall >= 84
                        ? "bg-[#15a34a] text-[#090c12]"
                        : "bg-[#38bdf8] text-[#090c12]"
                    }`}
                  >
                    {athlete.overall}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-[2px] bg-[#090c12] text-[#60a5fa] border border-[#222c40] text-[10px] font-extrabold">
                      {athlete.position}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[10px] font-extrabold uppercase ${
                        isBlackBall
                          ? "bg-black text-[#ffdc2b] border border-[#ffdc2b]/50"
                          : isGoldBall
                          ? "bg-[#ffdc2b]/20 text-[#ffdc2b]"
                          : "bg-[#cbd5e1]/20 text-[#cbd5e1]"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isBlackBall
                            ? "bg-[#111] border border-[#ffdc2b]"
                            : isGoldBall
                            ? "bg-[#ffdc2b]"
                            : "bg-[#cbd5e1]"
                        }`}
                      />
                      {isBlackBall
                        ? "Bola Preta"
                        : isGoldBall
                        ? "Bola Ouro"
                        : "Bola Prata"}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#f4f6fb] truncate mt-1.5">
                    {athlete.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-[11px] text-[#9aa5b8] mt-0.5">
                    <ClubCrest clubName={athlete.defaultTeam} size="sm" />
                    <span className="truncate">
                      Origem: {athlete.defaultTeam}
                    </span>
                    <span>• {athlete.age}a</span>
                  </div>
                </div>
              </div>

              {/* Status Contratual Exclusivo / Multa Rescisória / Contratação */}
              <div className="p-3.5 space-y-2.5 text-xs bg-[#111622]">
                {auction ? (
                  <div className="p-2.5 rounded-[4px] bg-[#ffdc2b]/10 border border-[#ffdc2b]/40 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-extrabold uppercase text-[#ffdc2b]">
                        {auction.status === "AGENDADO"
                          ? "📅 LEILÃO AGENDADO"
                          : "🔥 EM LEILÃO AO VIVO"}
                      </div>
                      <div className="text-xs font-extrabold text-[#f4f6fb] mt-0.5">
                        Lance: {formatEscudos(auction.currentBid)}
                      </div>
                    </div>
                    <Link
                      href="/auctions"
                      className="px-2.5 py-1.5 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-extrabold text-[11px]"
                    >
                      Ir ao Leilão
                    </Link>
                  </div>
                ) : contract ? (
                  <div className="p-2.5 rounded-[4px] bg-[#0c1018] border border-[#1c2436] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold text-[#78849e]">
                        Vínculo Exclusivo:
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-[#f4f6fb] truncate">
                        <ClubCrest clubName={contract.clubName} size="sm" />
                        <span>{contract.clubName}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-[#78849e]">
                        Salário / Multa:
                      </span>
                      <span className="font-extrabold text-[#ffdc2b] tabular-nums">
                        {formatEscudos(contract.salary, false)} /{" "}
                        {formatEscudos(contract.buyoutClause)}
                      </span>
                    </div>

                    {isMyPlayer ? (
                      <div className="w-full py-1.5 px-2.5 rounded-[4px] bg-[#15a34a]/15 border border-[#15a34a]/40 text-[#4ade80] font-bold text-[11px] flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Atleta do Seu Elenco</span>
                      </div>
                    ) : isWindowOpen && transferWindow.buyoutEnabled ? (
                      <button
                        type="button"
                        disabled={isPending || !currentClub || !canAffordBuyout}
                        onClick={() => handlePayBuyoutAndTransfer(contract)}
                        className={`w-full py-1.5 px-2.5 rounded-[4px] font-extrabold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          canAffordBuyout
                            ? "bg-[#dc2626] hover:bg-[#b91c1c] text-white"
                            : "bg-[#161d2c] text-[#78849e] border border-[#222c40] cursor-not-allowed"
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>
                          {!currentClub
                            ? "Crie um Clube para Contratar"
                            : canAffordBuyout
                            ? `Pagar Multa (${formatEscudos(
                                contract.buyoutClause
                              )}) & Transferir`
                            : `Multa: ${formatEscudos(
                                contract.buyoutClause
                              )} (Saldo Insuficiente)`}
                        </span>
                      </button>
                    ) : (
                      <div className="w-full py-1.5 px-2.5 rounded-[4px] bg-[#161d2c] border border-[#222c40] text-[#9aa5b8] font-bold text-[11px] flex items-center justify-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#f87171]" />
                        <span>Travado no Clube (Janela Fechada)</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-[4px] bg-[#0c1018] border border-[#1c2436] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-[#4ade80]">
                        Passe Livre (Federação):
                      </span>
                      <span className="font-extrabold text-[#ffdc2b] tabular-nums">
                        {formatEscudos(freeAgentCost)}
                      </span>
                    </div>

                    {isWindowOpen && transferWindow.freeAgencyEnabled ? (
                      <button
                        type="button"
                        disabled={
                          isPending || !currentClub || !canAffordFreeAgent
                        }
                        onClick={() => handleSignFreeAgent(athlete)}
                        className={`w-full py-1.5 px-2.5 rounded-[4px] font-extrabold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          canAffordFreeAgent
                            ? "bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312]"
                            : "bg-[#161d2c] text-[#78849e] border border-[#222c40] cursor-not-allowed"
                        }`}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>
                          {!currentClub
                            ? "Crie um Clube para Contratar"
                            : canAffordFreeAgent
                            ? `Contratar para Meu Clube (${formatEscudos(
                                freeAgentCost
                              )})`
                            : `Passe: ${formatEscudos(
                                freeAgentCost
                              )} (Saldo Insuficiente)`}
                        </span>
                      </button>
                    ) : (
                      <div className="w-full py-1.5 px-2.5 rounded-[4px] bg-[#161d2c] border border-[#222c40] text-[#9aa5b8] font-bold text-[11px] flex items-center justify-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#f87171]" />
                        <span>Contratações Pausadas (Janela Fechada)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginação / Carregar Mais */}
      {visibleCount < filteredAndSortedAthletes.length && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="inline-flex items-center gap-2 min-h-11 px-6 py-2.5 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-extrabold text-xs cursor-pointer transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
            <span>
              Carregar mais {PAGE_SIZE} atletas (Restam{" "}
              {filteredAndSortedAthletes.length - visibleCount})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setVisibleCount(filteredAndSortedAthletes.length)}
            className="inline-flex items-center gap-2 min-h-11 px-4 py-2.5 rounded-[4px] bg-[#161d2c] hover:bg-[#1e273b] border border-[#2c3852] text-[#f4f6fb] font-bold text-xs cursor-pointer transition-colors"
          >
            <span>Mostrar todos ({filteredAndSortedAthletes.length})</span>
          </button>
        </div>
      )}
    </div>
  );
}
