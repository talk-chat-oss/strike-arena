import Link from "next/link";
import {
  ArrowRight,
  Swords,
  CheckCircle2,
  UserPlus,
} from "lucide-react";
import { getAllTournaments } from "@/lib/queries/tournaments";
import { getCurrentUser } from "@/lib/auth";
import { TournamentShowcase } from "@/components/tournament/tournament-showcase";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ tournaments, source }, currentUser] = await Promise.all([
    getAllTournaments(),
    getCurrentUser(),
  ]);

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Section — Kinetic Control Plane */}
      <section className="relative border-b border-[#222c40] kinetic-grid-bg py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111622] border border-[#222c40] text-xs">
              <span className="w-2 h-2 rounded-full bg-[#ffdc2b]" />
              <span className="font-semibold text-[#ffdc2b]">
                TEMPORADA 2026 ATIVA
              </span>
              <span className="text-[#78849e]">·</span>
              <span className="text-[#b6c0d4]">
                EA FC 26 & eFootball · Fonte:{" "}
                {source === "postgres"
                  ? "PostgreSQL Isolado (strike-arena-db)"
                  : "Mock Fallback"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold text-[#f4f6fb] tracking-tight leading-[1.08]">
              Controle total para ligas e torneios de{" "}
              <span className="text-[#ffdc2b]">EA FC & eFootball</span>.
            </h1>

            <p className="text-sm sm:text-base text-[#b6c0d4] leading-relaxed max-w-2xl">
              Tabelas automáticas no PostgreSQL, chaveamento dinâmico, check-in
              pré-jogo e Match Hub com chat de partida, envio de comprovante de
              placar (print) e mediação anti-fraude.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/tournaments/strike-cup-eafc26-elite"
                className="min-h-11 px-5 py-2.5 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors"
              >
                <Swords className="w-4 h-4" />
                <span>Abrir Strike Arena Cup (Ao Vivo)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {!currentUser ? (
                <Link
                  href="/auth"
                  className="min-h-11 px-5 py-2.5 rounded-[4px] bg-[#133865] hover:bg-[#1c4d8a] border border-[#ffdc2b]/50 text-[#f4f6fb] font-semibold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-[#ffdc2b]" />
                  <span>Criar Conta de Jogador / Login</span>
                </Link>
              ) : (
                <Link
                  href="/organizer"
                  className="min-h-11 px-5 py-2.5 rounded-[4px] bg-[#111622] hover:bg-[#161d2c] border border-[#222c40] text-[#f4f6fb] font-semibold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors"
                >
                  <span>Painel do Organizador</span>
                </Link>
              )}
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12">
            {[
              {
                label: "Torneios Ativos",
                value: `${tournaments.length}`,
                sub: "EA FC 26 & eFootball",
              },
              {
                label: "Premiação Acumulada",
                value: "R$ 1.100",
                sub: "Via PIX automatizado",
              },
              {
                label: "Partidas Auditadas",
                value: "100%",
                sub: "Com print de placar",
              },
              {
                label: "Banco Dedicado",
                value: "PG 16",
                sub: "strike-arena-db :5433",
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="bg-[#111622] border border-[#222c40] rounded-[4px] p-4 tabular-nums"
              >
                <span className="text-[11px] uppercase tracking-wider text-[#78849e] block">
                  {kpi.label}
                </span>
                <p className="text-xl sm:text-2xl font-bold text-[#f4f6fb] mt-1">
                  {kpi.value}
                </p>
                <span className="text-[11px] text-[#ffdc2b]">{kpi.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vitrine de Torneios com Filtros */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#ffdc2b] font-semibold">
              Vitrine de Competições
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#f4f6fb] mt-0.5">
              Torneios e Ligas Disponíveis
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#78849e]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80]" />
            <span>Dados sincronizados em tempo real</span>
          </div>
        </div>

        <TournamentShowcase tournaments={tournaments} />
      </section>
    </div>
  );
}
