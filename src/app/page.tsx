import Link from "next/link";
import {
  Trophy,
  Gamepad2,
  Users,
  ArrowRight,
  ShieldCheck,
  Swords,
  CheckCircle2,
} from "lucide-react";
import { getAllTournaments } from "@/lib/queries/tournaments";
import { TournamentStatusBadge } from "@/components/tournament/status-badge";

export const dynamic = "force-dynamic";

const FORMAT_LABELS: Record<string, string> = {
  groups_playoffs: "Fase de Grupos + Playoffs",
  round_robin: "Pontos Corridos",
  single_elimination: "Mata-Mata Simples",
  double_elimination: "Eliminação Dupla",
};

const PLATFORM_LABELS: Record<string, string> = {
  crossplay: "Crossplay (PS5 / Xbox / PC)",
  ps5: "PlayStation 5",
  xbox: "Xbox Series X|S",
  pc: "PC (EA App / Steam)",
};

export default async function HomePage() {
  const { tournaments, source } = await getAllTournaments();

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
                  ? "PostgreSQL (deathstar:5433)"
                  : "Mock Fallback"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold text-[#f4f6fb] tracking-tight leading-[1.08]">
              Controle total para ligas e torneios de{" "}
              <span className="text-[#ffdc2b]">EA FC & eFootball</span>.
            </h1>

            <p className="text-sm sm:text-base text-[#b6c0d4] leading-relaxed max-w-2xl">
              Tabelas automáticas no PostgreSQL, chaveamento dinâmico, check-in
              pré-jogo e Match Hub com envio de comprovante de placar (print) e
              mediação anti-fraude.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/tournaments/strike-cup-eafc26-elite"
                className="min-h-11 px-5 py-2.5 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors"
              >
                <Swords className="w-4 h-4" />
                <span>Abrir Strike Arena Cup (8 Players / 2 Grupos)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/organizer"
                className="min-h-11 px-5 py-2.5 rounded-[4px] bg-[#111622] hover:bg-[#161d2c] border border-[#222c40] text-[#f4f6fb] font-semibold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors"
              >
                <span>Painel do Organizador</span>
              </Link>
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

      {/* Vitrine de Torneios */}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tournaments.map((t) => (
            <div
              key={t.id}
              className="bg-[#111622] border border-[#222c40] rounded-[4px] p-5 flex flex-col justify-between gap-5 hover:border-[#ffdc2b]/60 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-[2px] bg-[#161d2c] border border-[#222c40] text-[11px] font-bold text-[#ffdc2b] uppercase">
                    {t.game === "ea_fc" ? "EA SPORTS FC 26" : "eFootball 2026"}
                  </span>
                  <TournamentStatusBadge status={t.status} />
                </div>

                <h3 className="text-base font-bold text-[#f4f6fb] leading-snug">
                  {t.name}
                </h3>

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
                      {t.entryFeeBrl > 0 ? `R$ ${t.entryFeeBrl},00` : "Gratuita"}
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
          ))}
        </div>
      </section>
    </div>
  );
}
