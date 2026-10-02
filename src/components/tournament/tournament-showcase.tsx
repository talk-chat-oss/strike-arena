"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Gamepad2,
  Users,
  ArrowRight,
  ShieldCheck,
  Search,
  Zap,
} from "lucide-react";
import type { MockTournament } from "@/db/mock-data";
import { TournamentStatusBadge } from "./status-badge";
import { CLUB_CRESTS, GAME_COVERS, ClubCrest } from "@/lib/club-crests";

const FORMAT_LABELS: Record<string, string> = {
  groups_playoffs: "Fase de Grupos + Playoffs",
  round_robin: "Pontos Corridos",
  single_elimination: "Torneio Relâmpago (Mata-Mata)",
  double_elimination: "Eliminação Dupla",
};

const PLATFORM_LABELS: Record<string, string> = {
  crossplay: "Crossplay (PS5 / Xbox / PC)",
  ps5: "PlayStation 5",
  xbox: "Xbox Series X|S",
  pc: "PC (EA App / Steam)",
};

const FEATURED_CLUBS = Object.keys(CLUB_CRESTS).slice(0, 8);

export function TournamentShowcase({
  tournaments,
}: {
  tournaments: MockTournament[];
}) {
  const [gameFilter, setGameFilter] = useState<"all" | "ea_fc" | "efootball">(
    "all"
  );
  const [platformFilter, setPlatformFilter] = useState<
    "all" | "crossplay" | "ps5" | "xbox" | "pc"
  >("all");
  const [search, setSearch] = useState("");

  const filtered = tournaments.filter((t) => {
    if (gameFilter !== "all" && t.game !== gameFilter) return false;
    if (platformFilter !== "all" && t.platform !== platformFilter) return false;
    if (
      search.trim() &&
      !t.name.toLowerCase().includes(search.trim().toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Faixa de Escudos / Clubes Licenciados na Liga (Inspirado no Arena Virtual) */}
      <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase tracking-wider text-[#ffdc2b] font-bold">
            Clubes & Brasões Disponíveis na Inscrição
          </span>
          <p className="text-xs text-[#b6c0d4]">
            Escolha o escudo do seu clube ao entrar em qualquer campeonato ou
            liga.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {FEATURED_CLUBS.map((clubName) => (
            <div
              key={clubName}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#090c12] border border-[#222c40] text-[11px] text-[#f4f6fb]"
            >
              <ClubCrest clubName={clubName} size="sm" />
              <span className="hidden sm:inline font-medium">{clubName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Barra de Filtros da Vitrine (Jogo, Console e Busca) */}
      <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-[#78849e] font-semibold mr-1">
            Jogo:
          </span>
          {[
            { id: "all", label: "Todos" },
            { id: "ea_fc", label: "EA SPORTS FC 26" },
            { id: "efootball", label: "eFootball 2026" },
          ].map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() =>
                setGameFilter(g.id as "all" | "ea_fc" | "efootball")
              }
              className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer ${
                gameFilter === g.id
                  ? "bg-[#ffdc2b] text-[#0e1312]"
                  : "bg-[#161d2c] text-[#b6c0d4] hover:text-[#f4f6fb]"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-[#78849e] font-semibold mr-1">
            Plataforma:
          </span>
          {[
            { id: "all", label: "Todas" },
            { id: "crossplay", label: "Crossplay" },
            { id: "ps5", label: "PS5" },
            { id: "xbox", label: "Xbox" },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() =>
                setPlatformFilter(
                  p.id as "all" | "crossplay" | "ps5" | "xbox" | "pc"
                )
              }
              className={`px-2.5 py-1.5 rounded-[4px] text-xs font-medium transition-colors cursor-pointer ${
                platformFilter === p.id
                  ? "bg-[#133865] text-[#ffdc2b] border border-[#ffdc2b]/50"
                  : "bg-[#161d2c] text-[#b6c0d4] hover:text-[#f4f6fb]"
              }`}
            >
              {p.label}
            </button>
          ))}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#78849e] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar campeonato..."
              className="h-8 pl-8 pr-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs text-[#f4f6fb] focus:outline-none focus:border-[#ffdc2b]"
            />
          </div>
        </div>
      </div>

      {/* Grid de Torneios com Capa Oficial do Jogo + Mini Escudos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filtered.map((t) => {
          const gameVisual =
            t.game === "ea_fc" ? GAME_COVERS.ea_fc : GAME_COVERS.efootball;
          const isRelampago = t.format === "single_elimination";

          return (
            <div
              key={t.id}
              className="bg-[#111622] border border-[#222c40] rounded-[4px] overflow-hidden flex flex-col justify-between hover:border-[#ffdc2b]/60 transition-colors"
            >
              {/* Banner Visual com Capa Oficial do Jogo (Arena17 Style) */}
              <div className="relative h-32 bg-[#090c12] border-b border-[#222c40] overflow-hidden flex items-center justify-between px-5">
                <div className="z-10 space-y-1.5 max-w-[68%]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-[2px] bg-[#161d2c]/90 border border-[#222c40] text-[10px] font-bold text-[#ffdc2b] uppercase">
                      {gameVisual.title}
                    </span>
                    {isRelampago && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#ffdc2b] text-[#0e1312] text-[10px] font-bold">
                        <Zap className="w-3 h-3" />
                        RELÂMPAGO
                      </span>
                    )}
                  </div>
                  <TournamentStatusBadge status={t.status} />
                </div>

                {/* Capa Oficial do Jogo (EA FC 26 / eFootball 2026) */}
                <div className="z-10 w-16 h-22 rounded-[4px] overflow-hidden border border-[#222c40] bg-[#161d2c] shrink-0 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={gameVisual.coverUrl}
                    alt={gameVisual.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-[#f4f6fb] leading-snug">
                    {t.name}
                  </h3>

                  {/* Mini-brasões de times participantes */}
                  <div className="flex items-center gap-1.5 py-1">
                    {["Real Madrid", "Manchester City", "FC Barcelona", "Arsenal", "Flamengo"].map(
                      (club) => (
                        <ClubCrest key={club} clubName={club} size="sm" />
                      )
                    )}
                    <span className="text-[11px] text-[#78849e] pl-1">
                      +{ Math.max(t.currentParticipants - 5, 3) } clubes
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#78849e] pt-1">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5">
                        <Gamepad2 className="w-3.5 h-3.5 text-[#b6c0d4]" />
                        Plataforma:
                      </span>
                      <span className="text-[#f4f6fb] font-medium">
                        {PLATFORM_LABELS[t.platform] ?? t.platform}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-[#ffdc2b]" />
                        Formato:
                      </span>
                      <span className="text-[#f4f6fb] font-medium">
                        {FORMAT_LABELS[t.format] ?? t.format}
                      </span>
                    </div>

                    <div className="flex items-center justify-between tabular-nums">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#b6c0d4]" />
                        Vagas / Check-in:
                      </span>
                      <span className="text-[#f4f6fb] font-semibold">
                        {t.currentParticipants} / {t.maxParticipants} inscritos
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80]" />
                        Organizador:
                      </span>
                      <span className="text-[#f4f6fb] font-semibold">
                        {t.organizerNickname}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#192131] space-y-3">
                  <div className="flex items-baseline justify-between tabular-nums">
                    <div>
                      <span className="text-[10px] uppercase text-[#78849e] block">
                        Inscrição
                      </span>
                      <span className="text-xs font-semibold text-[#b6c0d4]">
                        {t.entryFeeBrl > 0
                          ? `R$ ${t.entryFeeBrl},00`
                          : "Gratuita"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-[#78849e] block">
                        Premiação Total
                      </span>
                      <span className="text-base font-bold text-[#ffdc2b]">
                        R$ {t.prizePoolBrl},00
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/tournaments/${t.slug}`}
                    className="w-full min-h-10 px-4 py-2 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Acessar Central do Torneio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
