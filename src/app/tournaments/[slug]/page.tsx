import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Trophy,
  Gamepad2,
  Users,
  ShieldCheck,
  ChevronRight,
  Database,
} from "lucide-react";
import { getTournamentBySlug } from "@/lib/queries/tournaments";
import { TournamentStatusBadge } from "@/components/tournament/status-badge";
import { TournamentTabs } from "@/components/tournament/tournament-tabs";

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
  pc: "PC",
};

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getTournamentBySlug(slug);

  if (!data) {
    notFound();
  }

  const { tournament, groups, participants, standings, matches, source } = data;

  const completedMatches = matches.filter(
    (m) => m.status === "completed" || m.status === "walkover"
  ).length;
  const totalGoals = matches.reduce(
    (acc, m) => acc + (m.homeScore ?? 0) + (m.awayScore ?? 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Kinetic */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#78849e]">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-[#f4f6fb] transition-colors">
              Vitrine
            </Link>
          </li>
          <li>
            <ChevronRight className="w-3.5 h-3.5" />
          </li>
          <li>
            <span className="text-[#b6c0d4]">Torneios</span>
          </li>
          <li>
            <ChevronRight className="w-3.5 h-3.5" />
          </li>
          <li aria-current="page" className="text-[#ffdc2b] font-semibold">
            {tournament.name}
          </li>
        </ol>
      </nav>

      {/* Tournament Operational Header */}
      <section className="bg-[#111622] border border-[#222c40] rounded-[4px] p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <TournamentStatusBadge status={tournament.status} />
              <span className="px-2.5 py-0.5 rounded-[2px] bg-[#161d2c] border border-[#222c40] text-[11px] font-bold text-[#ffdc2b] uppercase">
                {tournament.game === "ea_fc"
                  ? "EA SPORTS FC 26"
                  : "eFootball 2026"}
              </span>
              <span className="px-2.5 py-0.5 rounded-[2px] bg-[#161d2c] border border-[#222c40] text-[11px] text-[#b6c0d4]">
                {PLATFORM_LABELS[tournament.platform] ?? tournament.platform}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#161d2c] text-[11px] text-[#4ade80]">
                <Database className="w-3 h-3" />
                {source === "postgres" ? "PG Live" : "Mock"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#f4f6fb] tracking-tight">
              {tournament.name}
            </h1>

            <p className="text-xs sm:text-sm text-[#b6c0d4]">
              Formato:{" "}
              <strong className="text-[#f4f6fb]">
                {FORMAT_LABELS[tournament.format] ?? tournament.format}
              </strong>{" "}
              · Organizado por{" "}
              <strong className="text-[#ffdc2b]">
                {tournament.organizerNickname}
              </strong>{" "}
              (Super-Admin)
            </p>
          </div>

          {/* Prize Pool Highlight Box */}
          <div className="bg-[#090c12] border border-[#ffdc2b]/50 rounded-[4px] px-5 py-3.5 text-right tabular-nums">
            <span className="text-[10px] uppercase tracking-wider text-[#78849e] block">
              Premiação Oficial
            </span>
            <p className="text-2xl font-bold text-[#ffdc2b]">
              R$ {tournament.prizePoolBrl},00
            </p>
            <span className="text-[11px] text-[#b6c0d4]">
              Inscrição: R$ {tournament.entryFeeBrl},00
            </span>
          </div>
        </div>

        {/* Telemetry Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#192131] tabular-nums">
          <div className="p-3 rounded-[4px] bg-[#161d2c]">
            <span className="text-[11px] text-[#78849e] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#ffdc2b]" />
              Participantes
            </span>
            <p className="text-lg font-bold text-[#f4f6fb] mt-0.5">
              {participants.length} / {tournament.maxParticipants}
            </p>
          </div>

          <div className="p-3 rounded-[4px] bg-[#161d2c]">
            <span className="text-[11px] text-[#78849e] flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5 text-[#ffdc2b]" />
              Grupos Ativos
            </span>
            <p className="text-lg font-bold text-[#f4f6fb] mt-0.5">
              {groups.length} (A & B)
            </p>
          </div>

          <div className="p-3 rounded-[4px] bg-[#161d2c]">
            <span className="text-[11px] text-[#78849e] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80]" />
              Partidas Concluídas
            </span>
            <p className="text-lg font-bold text-[#f4f6fb] mt-0.5">
              {completedMatches} / {matches.length}
            </p>
          </div>

          <div className="p-3 rounded-[4px] bg-[#161d2c]">
            <span className="text-[11px] text-[#78849e] flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-[#ffdc2b]" />
              Gols Marcados (Média)
            </span>
            <p className="text-lg font-bold text-[#f4f6fb] mt-0.5">
              {totalGoals} gols (
              {completedMatches > 0
                ? (totalGoals / completedMatches).toFixed(1)
                : "0.0"}
              /jogo)
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Tabs: Tabela, Chaveamento, Partidas & Match Hub, Regras */}
      <TournamentTabs
        tournament={tournament}
        groups={groups}
        participants={participants}
        standings={standings}
        matches={matches}
      />
    </div>
  );
}
