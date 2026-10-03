import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Trophy,
  Gamepad2,
  Users,
  ShieldCheck,
  ChevronRight,
  CalendarClock,
} from "lucide-react";
import { getTournamentBySlug } from "@/lib/queries/tournaments";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { isSuperAdmin } from "@/db";
import { GAME_COVERS } from "@/lib/club-crests";
import { TournamentStatusBadge } from "@/components/tournament/status-badge";
import { TournamentTabs } from "@/components/tournament/tournament-tabs";

export const dynamic = "force-dynamic";

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
  pc: "PC",
};

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [data, currentUser] = await Promise.all([
    getTournamentBySlug(slug),
    getCurrentUser(),
  ]);

  if (!data) {
    notFound();
  }

  let userLeaguePass: {
    hasActivePass: boolean;
    expiresAt: string | null;
    mode: string;
    clubTeamId: string | null;
  } = {
    hasActivePass: false,
    expiresAt: null,
    mode: "NONE",
    clubTeamId: null,
  };

  if (currentUser) {
    try {
      const { data: clubRow } = await supabaseAdmin
        .from("club_teams")
        .select("id, league_pass_expires_at, league_pass_mode")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      const isSuper = isSuperAdmin(currentUser.id);
      const expIso = clubRow?.league_pass_expires_at
        ? String(clubRow.league_pass_expires_at)
        : null;
      const active =
        isSuper ||
        Boolean(expIso && new Date(expIso).getTime() > Date.now());

      userLeaguePass = {
        hasActivePass: active,
        expiresAt: isSuper ? expIso || "2099-12-31T23:59:59.000Z" : expIso,
        mode: isSuper
          ? "ADMIN_GRANTED"
          : String(clubRow?.league_pass_mode || "NONE"),
        clubTeamId: clubRow?.id ?? null,
      };
    } catch {
      // ignore fallback
    }
  }

  const { tournament, groups, participants, standings, matches } = data;
  const gameVisual =
    tournament.game === "ea_fc" ? GAME_COVERS.ea_fc : GAME_COVERS.efootball;

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

      {/* Tournament Operational Header com Capa Oficial do Jogo */}
      <section className="bg-[#111622] border border-[#222c40] rounded-[4px] p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-4 max-w-3xl">
            <div className="hidden sm:block w-20 h-28 rounded-[4px] overflow-hidden border border-[#222c40] bg-[#090c12] shrink-0 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gameVisual.coverUrl}
                alt={gameVisual.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <TournamentStatusBadge status={tournament.status} />
                <span className="px-2.5 py-0.5 rounded-[2px] bg-[#161d2c] border border-[#222c40] text-[11px] font-bold text-[#ffdc2b] uppercase">
                  {gameVisual.title}
                </span>
                <span className="px-2.5 py-0.5 rounded-[2px] bg-[#161d2c] border border-[#222c40] text-[11px] text-[#b6c0d4]">
                  {PLATFORM_LABELS[tournament.platform] ?? tournament.platform}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#ffdc2b]/15 border border-[#ffdc2b]/40 text-[11px] font-extrabold text-[#ffdc2b]">
                  <CalendarClock className="w-3 h-3" />
                  Passe de Liga Obrigatório (R$ 30,00/mês)
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
                </strong>
              </p>
            </div>
          </div>

          {/* Prize Pool & League Pass Highlight Box */}
          <div className="bg-[#090c12] border border-[#ffdc2b]/50 rounded-[4px] px-5 py-3.5 text-right tabular-nums">
            <span className="text-[10px] uppercase tracking-wider text-[#78849e] block">
              Premiação Oficial
            </span>
            <p className="text-2xl font-bold text-[#ffdc2b]">
              R$ {tournament.prizePoolBrl},00
            </p>
            <span className="text-[11px] text-[#4ade80] font-bold block">
              Requisito: Passe de Liga (R$ 30,00/mês)
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

      {/* Interactive Tabs: Tabela, Chaveamento, Partidas, Freguesômetro, Regras */}
      <TournamentTabs
        tournament={tournament}
        groups={groups}
        participants={participants}
        standings={standings}
        matches={matches}
        currentUser={currentUser}
        userLeaguePass={userLeaguePass}
      />
    </div>
  );
}
