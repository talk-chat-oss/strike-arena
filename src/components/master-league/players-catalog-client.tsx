"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  Gavel,
  Flame,
  Users,
} from "lucide-react";
import type {
  AthleteDTO,
  ContractRosterItemDTO,
  AuctionDTO,
} from "@/lib/master-league-data";
import { formatEscudos } from "@/lib/master-league-data";
import { ClubCrest } from "@/lib/club-crests";

interface PlayersCatalogClientProps {
  athletes: AthleteDTO[];
  contracts: ContractRosterItemDTO[];
  auctions: AuctionDTO[];
}

type SortMode = "OVERALL_DESC" | "OVERALL_ASC" | "NAME_ASC" | "NAME_DESC";

export function PlayersCatalogClient({
  athletes,
  contracts,
  auctions,
}: PlayersCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [ballFilter, setBallFilter] = useState<
    "ALL" | "BOLA_PRETA" | "BOLA_OURO"
  >("ALL");
  const [posFilter, setPosFilter] = useState<string>("ALL");
  const [sortMode, setSortMode] = useState<SortMode>("OVERALL_DESC");

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
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const contract = contractByAthleteId.get(a.id);
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
  }, [athletes, ballFilter, posFilter, searchQuery, sortMode, contractByAthleteId]);

  const blackBallCount = athletes.filter(
    (a) => a.ballType === "BOLA_PRETA"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header do Catálogo Global */}
      <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded-[2px] bg-[#ffdc2b] text-[#0e1312] text-[11px] font-extrabold uppercase">
              DATABASE GLOBAL DE ATLETAS
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#090c12] border border-[#2c3852] text-[11px] font-bold text-[#f4f6fb]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#111] border border-[#ffdc2b] inline-block" />
              {blackBallCount} Craques Bola Preta
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#f4f6fb] mt-1.5">
            Catálogo Oficial de Jogadores da Master Liga
          </h1>
          <p className="text-xs text-[#78849e] mt-0.5">
            Consulte todos os atletas cadastrados, categoria de raridade (Bola
            Preta / Bola Ouro), clube detentor, multa em Escudos e status de
            leilão.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/auctions"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] text-xs font-extrabold transition-colors"
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>Ver Leilões de Bola Preta</span>
          </Link>
          <Link
            href="/transfers"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[4px] bg-[#161d2c] hover:bg-[#1e273b] border border-[#2c3852] text-xs font-bold text-[#f4f6fb] transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-[#f87171]" />
            <span>Central de Transferências</span>
          </Link>
        </div>
      </div>

      {/* Barra de Filtros Dinâmicos e Seletores de Ordenação */}
      <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Busca Textual */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#78849e] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar jogador ou clube (ex: Messi, Yamal, Real)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs text-[#f4f6fb] focus:border-[#ffdc2b] focus:outline-none"
            />
          </div>

          {/* Filtro por Categoria (Bola Preta / Bola Ouro) */}
          <div className="flex items-center gap-2 bg-[#090c12] border border-[#222c40] rounded-[4px] px-3 py-2">
            <Sparkles className="w-3.5 h-3.5 text-[#ffdc2b] shrink-0" />
            <span className="text-[11px] text-[#78849e] font-semibold shrink-0">
              Categoria:
            </span>
            <select
              value={ballFilter}
              onChange={(e) =>
                setBallFilter(
                  e.target.value as "ALL" | "BOLA_PRETA" | "BOLA_OURO"
                )
              }
              className="w-full bg-transparent text-xs font-bold text-[#ffdc2b] focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#111622]">
                Todas as Categorias ({athletes.length})
              </option>
              <option value="BOLA_PRETA" className="bg-[#111622]">
                ⚫ Bola Preta — Craques Elite 85+ ({blackBallCount})
              </option>
              <option value="BOLA_OURO" className="bg-[#111622]">
                🟡 Bola Ouro — Destaques (&lt; 85 OVR)
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
              onChange={(e) => setPosFilter(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-[#f4f6fb] focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#111622]">
                Todas as Posições
              </option>
              <option value="ATA" className="bg-[#111622]">
                ATA — Centroavante / Atacante
              </option>
              <option value="PE" className="bg-[#111622]">
                PE — Ponta Esquerda
              </option>
              <option value="PD" className="bg-[#111622]">
                PD — Ponta Direita
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
              <option value="GOL" className="bg-[#111622]">
                GOL — Goleiro
              </option>
            </select>
          </div>

          {/* Seletor de Ordenação (A-Z, Z-A, Overall Maior->Menor, Menor->Maior) */}
          <div className="flex items-center gap-2 bg-[#090c12] border border-[#222c40] rounded-[4px] px-3 py-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#4ade80] shrink-0" />
            <span className="text-[11px] text-[#78849e] font-semibold shrink-0">
              Ordenar:
            </span>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="w-full bg-transparent text-xs font-bold text-[#4ade80] focus:outline-none cursor-pointer"
            >
              <option value="OVERALL_DESC" className="bg-[#111622]">
                Overall: Maior ao Menor (92 → 80)
              </option>
              <option value="OVERALL_ASC" className="bg-[#111622]">
                Overall: Menor ao Maior (80 → 92)
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
              onClick={() => setBallFilter("ALL")}
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
              onClick={() => setBallFilter("BOLA_PRETA")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-bold cursor-pointer transition-colors ${
                ballFilter === "BOLA_PRETA"
                  ? "bg-[#ffdc2b] text-[#0e1312]"
                  : "bg-[#090c12] text-[#f4f6fb] border border-[#2c3852]"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-black border border-[#ffdc2b]" />
              <span>Somente Bola Preta</span>
            </button>
            <button
              type="button"
              onClick={() => setBallFilter("BOLA_OURO")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-bold cursor-pointer transition-colors ${
                ballFilter === "BOLA_OURO"
                  ? "bg-[#ffdc2b] text-[#0e1312]"
                  : "bg-[#090c12] text-[#9aa5b8] border border-[#222c40]"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#facc15]" />
              <span>Bola Ouro</span>
            </button>
          </div>

          <div className="text-[11px] text-[#78849e] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#ffdc2b]" />
            <span>
              Exibindo{" "}
              <strong className="text-[#f4f6fb]">
                {filteredAndSortedAthletes.length}
              </strong>{" "}
              de {athletes.length} atletas
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Cards Visuais dos Jogadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAndSortedAthletes.map((athlete) => {
          const contract = contractByAthleteId.get(athlete.id);
          const auction = auctionByAthleteId.get(athlete.id);
          const isBlackBall = athlete.ballType === "BOLA_PRETA";

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
                    className="w-20 h-20 rounded-[6px] bg-gradient-to-b from-[#0f172a] to-[#090c12] border border-[#ffdc2b]/40 object-contain object-bottom pt-1"
                  />
                  <span
                    className={`absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded-[3px] text-xs font-extrabold tabular-nums shadow ${
                      athlete.overall >= 90
                        ? "bg-[#ffdc2b] text-[#0e1312]"
                        : "bg-[#15a34a] text-[#090c12]"
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
                          : "bg-[#ffdc2b]/20 text-[#ffdc2b]"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isBlackBall
                            ? "bg-[#111] border border-[#ffdc2b]"
                            : "bg-[#ffdc2b]"
                        }`}
                      />
                      {isBlackBall ? "Bola Preta" : "Bola Ouro"}
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

              {/* Status Contratual / Leilão na Master Liga */}
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
                  <div className="p-2.5 rounded-[4px] bg-[#0c1018] border border-[#1c2436] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-[#78849e]">
                        Clube na Liga:
                      </span>
                      <span className="font-bold text-[#f4f6fb]">
                        {contract.clubName} ({contract.ownerNickname})
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
                  </div>
                ) : (
                  <div className="p-2.5 rounded-[4px] bg-[#0c1018] border border-[#1c2436] flex items-center justify-between">
                    <span className="text-[11px] text-[#9aa5b8]">
                      Disponível no Banco da Federação
                    </span>
                    <Link
                      href="/auctions"
                      className="text-[11px] font-bold text-[#ffdc2b] hover:underline"
                    >
                      Agendar Leilão →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
