"use client";

import { useState, useTransition } from "react";
import {
  Table2,
  GitBranch,
  Swords,
  FileText,
  Upload,
  ExternalLink,
  Check,
  ShieldAlert,
  Trophy,
  Users,
  Sparkles,
} from "lucide-react";
import type {
  MockTournament,
  MockGroup,
  MockParticipant,
  MockStanding,
  MockMatch,
} from "@/db/mock-data";
import { MatchStatusBadge } from "./status-badge";
import { ScoreSubmissionPanel } from "./score-submission-modal";
import { mediateMatchAction } from "@/app/actions/tournament-actions";

interface TournamentTabsProps {
  tournament: MockTournament;
  groups: MockGroup[];
  participants: MockParticipant[];
  standings: MockStanding[];
  matches: MockMatch[];
}

type ActiveTab = "standings" | "bracket" | "matches" | "rules";
type MatchFilter = "all" | "group_a" | "group_b" | "playoffs" | "pending";

export function TournamentTabs({
  tournament,
  groups,
  participants,
  standings,
  matches,
}: TournamentTabsProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("standings");
  const [matchFilter, setMatchFilter] = useState<MatchFilter>("all");
  const [modalMatchId, setModalMatchId] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const groupAStandings = standings
    .filter((s) => s.groupCode === "A")
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goalDifference - a.goalDifference ||
        b.goalsFor - a.goalsFor
    );

  const groupBStandings = standings
    .filter((s) => s.groupCode === "B")
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goalDifference - a.goalDifference ||
        b.goalsFor - a.goalsFor
    );

  const topAttacks = [...standings]
    .sort((a, b) => b.goalsFor - a.goalsFor || b.points - a.points)
    .slice(0, 5);

  const semifinals = matches.filter((m) => m.stage === "semifinal");
  const grandFinal = matches.find((m) => m.stage === "final");

  const filteredMatches = matches.filter((m) => {
    if (matchFilter === "group_a") return m.groupCode === "A";
    if (matchFilter === "group_b") return m.groupCode === "B";
    if (matchFilter === "playoffs") return m.stage !== "group";
    if (matchFilter === "pending")
      return (
        m.status === "awaiting_confirmation" ||
        m.status === "disputed" ||
        m.status === "scheduled"
      );
    return true;
  });

  const pendingMediationCount = matches.filter(
    (m) => m.status === "awaiting_confirmation" || m.status === "disputed"
  ).length;

  function handleQuickMediate(
    matchId: string,
    action: "approve" | "walkover_home" | "walkover_away"
  ) {
    setActionBanner(null);
    startTransition(async () => {
      const res = await mediateMatchAction({
        matchId,
        tournamentSlug: tournament.slug,
        action,
      });
      if (res.ok) {
        setActionBanner(res.message ?? "Partida atualizada!");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Kinetic Filled Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222c40] pb-4">
        <div
          role="tablist"
          aria-label="Seções do torneio"
          className="flex flex-wrap items-center gap-2"
        >
          <button
            role="tab"
            aria-selected={activeTab === "standings"}
            onClick={() => setActiveTab("standings")}
            className={`min-h-10 px-4 py-2 rounded-[4px] text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "standings"
                ? "bg-[#ffdc2b] text-[#0e1312]"
                : "bg-[#111622] text-[#b6c0d4] hover:bg-[#161d2c] hover:text-[#f4f6fb] border border-[#222c40]"
            }`}
          >
            <Table2 className="w-4 h-4" />
            <span>Tabela & Classificação</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "bracket"}
            onClick={() => setActiveTab("bracket")}
            className={`min-h-10 px-4 py-2 rounded-[4px] text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "bracket"
                ? "bg-[#ffdc2b] text-[#0e1312]"
                : "bg-[#111622] text-[#b6c0d4] hover:bg-[#161d2c] hover:text-[#f4f6fb] border border-[#222c40]"
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Chaveamento (Playoffs)</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "matches"}
            onClick={() => setActiveTab("matches")}
            className={`min-h-10 px-4 py-2 rounded-[4px] text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "matches"
                ? "bg-[#ffdc2b] text-[#0e1312]"
                : "bg-[#111622] text-[#b6c0d4] hover:bg-[#161d2c] hover:text-[#f4f6fb] border border-[#222c40]"
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Partidas & Match Hub</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === "matches"
                  ? "bg-[#0e1312] text-[#ffdc2b]"
                  : "bg-[#1d2639] text-[#ffdc2b]"
              }`}
            >
              {matches.length}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "rules"}
            onClick={() => setActiveTab("rules")}
            className={`min-h-10 px-4 py-2 rounded-[4px] text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "rules"
                ? "bg-[#ffdc2b] text-[#0e1312]"
                : "bg-[#111622] text-[#b6c0d4] hover:bg-[#161d2c] hover:text-[#f4f6fb] border border-[#222c40]"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Inscritos & Regulamento</span>
          </button>
        </div>

        {/* Botão Rápido de Envio de Placar */}
        <button
          type="button"
          onClick={() =>
            setModalMatchId(
              matches.find((m) => m.status !== "completed")?.id ??
                matches[0]?.id ??
                null
            )
          }
          className="min-h-10 px-4 py-2 rounded-[4px] bg-[#133865] hover:bg-[#1c4d8a] border border-[#ffdc2b]/50 text-[#f4f6fb] text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-[#ffdc2b]" />
          <span>Enviar Placar / Comprovante</span>
        </button>
      </div>

      {/* Action Feedback Banner */}
      {actionBanner && (
        <div className="p-3.5 rounded-[4px] bg-[#15a34a]/15 border border-[#15a34a]/40 text-xs text-[#4ade80] flex items-center justify-between">
          <span>✔ {actionBanner}</span>
          <button
            type="button"
            onClick={() => setActionBanner(null)}
            className="text-[11px] underline"
          >
            Fechar
          </button>
        </div>
      )}

      {/* =====================================================================
       * TAB 1: TABELA DE CLASSIFICAÇÃO (GRUPOS A & B + ARTILHARIA CONSOLIDADA)
       * ===================================================================== */}
      {activeTab === "standings" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {[
              { group: groups[0] ?? { name: "Grupo A", code: "A" }, rows: groupAStandings },
              { group: groups[1] ?? { name: "Grupo B", code: "B" }, rows: groupBStandings },
            ].map(({ group, rows }) => (
              <div
                key={group.code}
                className="bg-[#111622] border border-[#222c40] rounded-[4px] overflow-hidden"
              >
                <div className="px-5 py-4 bg-[#161d2c] border-b border-[#222c40] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-[2px] bg-[#ffdc2b] text-[#0e1312] font-bold text-xs inline-flex items-center justify-center">
                      {group.code}
                    </span>
                    <h3 className="text-sm font-bold text-[#f4f6fb]">
                      {group.name} — Fase de Classificação
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#4ade80] font-medium">
                    Top 2 avançam às Semifinais
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-[#222c40] text-[11px] uppercase tracking-wider text-[#78849e]">
                        <th className="py-3 px-4 w-10">#</th>
                        <th className="py-3 px-4">Jogador / Clube</th>
                        <th className="py-3 px-3 text-center">PTS</th>
                        <th className="py-3 px-2.5 text-center">J</th>
                        <th className="py-3 px-2.5 text-center">V</th>
                        <th className="py-3 px-2.5 text-center">E</th>
                        <th className="py-3 px-2.5 text-center">D</th>
                        <th className="py-3 px-2.5 text-center">GP</th>
                        <th className="py-3 px-2.5 text-center">GC</th>
                        <th className="py-3 px-3 text-center">SG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#192131] text-xs tabular-nums">
                      {rows.map((row, idx) => {
                        const isQualified = idx < 2;
                        return (
                          <tr
                            key={row.id}
                            className="hover:bg-[#161d2c]/70 transition-colors"
                          >
                            <td className="py-3.5 px-4 font-bold">
                              <span
                                className={`w-5 h-5 rounded-[2px] inline-flex items-center justify-center text-[11px] ${
                                  isQualified
                                    ? "bg-[#ffdc2b] text-[#0e1312]"
                                    : "bg-[#1d2639] text-[#78849e]"
                                }`}
                              >
                                {idx + 1}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-[#f4f6fb]">
                                {row.nickname}
                              </div>
                              <div className="text-[11px] text-[#78849e] flex items-center gap-2">
                                <span className="text-[#b6c0d4]">
                                  {row.clubName}
                                </span>
                                <span>·</span>
                                <span>{row.platformHandle}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-center font-bold text-sm text-[#ffdc2b]">
                              {row.points}
                            </td>
                            <td className="py-3.5 px-2.5 text-center text-[#b6c0d4]">
                              {row.matchesPlayed}
                            </td>
                            <td className="py-3.5 px-2.5 text-center text-[#4ade80]">
                              {row.wins}
                            </td>
                            <td className="py-3.5 px-2.5 text-center text-[#b6c0d4]">
                              {row.draws}
                            </td>
                            <td className="py-3.5 px-2.5 text-center text-[#fb7185]">
                              {row.losses}
                            </td>
                            <td className="py-3.5 px-2.5 text-center text-[#f4f6fb]">
                              {row.goalsFor}
                            </td>
                            <td className="py-3.5 px-2.5 text-center text-[#78849e]">
                              {row.goalsAgainst}
                            </td>
                            <td
                              className={`py-3.5 px-3 text-center font-semibold ${
                                row.goalDifference > 0
                                  ? "text-[#4ade80]"
                                  : row.goalDifference < 0
                                  ? "text-[#fb7185]"
                                  : "text-[#78849e]"
                              }`}
                            >
                              {row.goalDifference > 0
                                ? `+${row.goalDifference}`
                                : row.goalDifference}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Resumo de Ataque / Artilharia Consolidada + Pendências da Rodada */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#111622] border border-[#222c40] rounded-[4px] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#ffdc2b] font-semibold">
                    Estatísticas Consolidadas
                  </span>
                  <h4 className="text-sm font-bold text-[#f4f6fb]">
                    Melhores Ataques e Saldo de Gols
                  </h4>
                </div>
                <Sparkles className="w-4 h-4 text-[#ffdc2b]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {topAttacks.map((item, i) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-[4px] bg-[#161d2c] border border-[#222c40] flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] bg-[#1d2639] text-[#ffdc2b]">
                        #{i + 1}
                      </span>
                      <span className="text-[10px] text-[#78849e]">
                        Grupo {item.groupCode}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#f4f6fb] truncate">
                        {item.nickname}
                      </p>
                      <p className="text-[11px] text-[#78849e] truncate">
                        {item.clubName}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-[#222c40] flex items-baseline justify-between tabular-nums">
                      <span className="text-[11px] text-[#78849e]">Gols Pró</span>
                      <span className="text-base font-bold text-[#ffdc2b]">
                        {item.goalsFor}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card de Alerta / Ação Rápida */}
            <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-5 flex flex-col justify-between gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#fb923c] font-semibold">
                  Controle de Rodada
                </span>
                <h4 className="text-sm font-bold text-[#f4f6fb] mt-1">
                  {pendingMediationCount} partida(s) aguardando homologação
                </h4>
                <p className="text-xs text-[#78849e] mt-1.5 leading-relaxed">
                  Jogadores podem anexar o print do placar final a qualquer
                  momento. Assim que homologado, a tabela é recalculada
                  automaticamente no PostgreSQL.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("matches")}
                  className="flex-1 min-h-10 px-3 py-2 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-bold text-xs cursor-pointer"
                >
                  Abrir Match Hub
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("bracket")}
                  className="flex-1 min-h-10 px-3 py-2 rounded-[4px] bg-[#161d2c] hover:bg-[#1d2639] border border-[#222c40] text-[#f4f6fb] font-medium text-xs cursor-pointer"
                >
                  Ver Playoffs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
       * TAB 2: CHAVEAMENTO INTERATIVO (MATA-MATA / BRACKET TREE)
       * ===================================================================== */}
      {activeTab === "bracket" && (
        <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-5 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222c40] pb-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#ffdc2b] font-semibold">
                Fase Eliminatória · Cruzamento Olímpico (1ºA × 2ºB | 1ºB × 2ºA)
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#f4f6fb]">
                Árvore de Playoffs — Strike Arena Cup
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#78849e]">
              <Trophy className="w-4 h-4 text-[#ffdc2b]" />
              <span>Premiação Total: R$ {tournament.prizePoolBrl},00</span>
            </div>
          </div>

          {/* Bracket Visual Tree */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-6 lg:gap-8 py-2">
            {/* Coluna 1: Semifinais */}
            <div className="space-y-6">
              <div className="text-xs font-bold uppercase tracking-wider text-[#78849e]">
                Semifinais (Jogo Único)
              </div>

              {semifinals.map((sf) => {
                const homeWon =
                  sf.homeScore !== null &&
                  sf.awayScore !== null &&
                  sf.homeScore > sf.awayScore;
                const awayWon =
                  sf.homeScore !== null &&
                  sf.awayScore !== null &&
                  sf.awayScore > sf.homeScore;

                return (
                  <div
                    key={sf.id}
                    className="bg-[#090c12] border border-[#222c40] rounded-[4px] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-[#ffdc2b]">
                        {sf.label}
                      </span>
                      <MatchStatusBadge status={sf.status} />
                    </div>

                    <div className="space-y-2 tabular-nums">
                      {/* Home Player */}
                      <div
                        className={`flex items-center justify-between p-2.5 rounded-[4px] border ${
                          homeWon
                            ? "bg-[#ffdc2b]/10 border-[#ffdc2b]/50 text-[#f4f6fb]"
                            : "bg-[#161d2c] border-[#222c40] text-[#b6c0d4]"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-[#f4f6fb]">
                            {sf.homeNickname}
                          </p>
                          <p className="text-[11px] text-[#78849e]">
                            {sf.homeClub}
                          </p>
                        </div>
                        <span className="text-base font-bold text-[#ffdc2b]">
                          {sf.homeScore ?? "—"}
                        </span>
                      </div>

                      {/* Away Player */}
                      <div
                        className={`flex items-center justify-between p-2.5 rounded-[4px] border ${
                          awayWon
                            ? "bg-[#ffdc2b]/10 border-[#ffdc2b]/50 text-[#f4f6fb]"
                            : "bg-[#161d2c] border-[#222c40] text-[#b6c0d4]"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-[#f4f6fb]">
                            {sf.awayNickname}
                          </p>
                          <p className="text-[11px] text-[#78849e]">
                            {sf.awayClub}
                          </p>
                        </div>
                        <span className="text-base font-bold text-[#ffdc2b]">
                          {sf.awayScore ?? "—"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-[#78849e] truncate max-w-[220px]">
                        {sf.notes ?? "Confronto eliminatório"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setModalMatchId(sf.id)}
                        className="px-2.5 py-1 rounded-[2px] bg-[#1d2639] hover:bg-[#ffdc2b] hover:text-[#0e1312] text-[11px] font-semibold text-[#f4f6fb] transition-colors cursor-pointer"
                      >
                        Reportar Placar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Conector Visual Desktop */}
            <div className="hidden lg:flex flex-col items-center justify-center text-[#222c40]">
              <div className="w-12 h-28 border-y border-r border-[#ffdc2b]/40 rounded-r-[4px]" />
              <div className="w-12 h-px bg-[#ffdc2b]" />
            </div>

            {/* Coluna 2: Grande Final */}
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#ffdc2b] flex items-center gap-1.5">
                <Trophy className="w-4 h-4" />
                <span>Grande Final · Vale Título e R$ 350</span>
              </div>

              {grandFinal && (
                <div className="bg-[#090c12] border-2 border-[#ffdc2b] rounded-[4px] p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#ffdc2b]">
                      {grandFinal.label}
                    </span>
                    <MatchStatusBadge status={grandFinal.status} />
                  </div>

                  <div className="space-y-2.5 tabular-nums">
                    <div className="flex items-center justify-between p-3 rounded-[4px] bg-[#161d2c] border border-[#222c40]">
                      <div>
                        <p className="text-sm font-bold text-[#f4f6fb]">
                          {grandFinal.homeNickname}
                        </p>
                        <p className="text-xs text-[#78849e]">
                          {grandFinal.homeClub}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-[#ffdc2b]">
                        {grandFinal.homeScore ?? "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-[4px] bg-[#161d2c] border border-[#222c40]">
                      <div>
                        <p className="text-sm font-bold text-[#f4f6fb]">
                          {grandFinal.awayNickname}
                        </p>
                        <p className="text-xs text-[#78849e]">
                          {grandFinal.awayClub}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-[#ffdc2b]">
                        {grandFinal.awayScore ?? "—"}
                      </span>
                    </div>
                  </div>

                  {grandFinal.notes && (
                    <p className="text-xs text-[#b6c0d4] bg-[#161d2c] p-2.5 rounded-[4px]">
                      {grandFinal.notes}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => setModalMatchId(grandFinal.id)}
                    className="w-full min-h-10 px-4 py-2 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-bold text-xs transition-colors cursor-pointer"
                  >
                    Registrar Resultado da Grande Final
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
       * TAB 3: PARTIDAS & MATCH HUB (COM SUBMISSÃO DE PLACAR E MEDIAÇÃO)
       * ===================================================================== */}
      {activeTab === "matches" && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 items-start">
          {/* Lista de Confrontos + Filtros */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111622] border border-[#222c40] rounded-[4px] p-3">
              <div
                role="group"
                aria-label="Filtrar partidas"
                className="flex flex-wrap items-center gap-1.5"
              >
                {[
                  { id: "all", label: `Todas (${matches.length})` },
                  { id: "group_a", label: "Grupo A" },
                  { id: "group_b", label: "Grupo B" },
                  { id: "playoffs", label: "Playoffs" },
                  {
                    id: "pending",
                    label: `Pendentes / Disputa (${pendingMediationCount})`,
                  },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setMatchFilter(f.id as MatchFilter)}
                    className={`px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors cursor-pointer ${
                      matchFilter === f.id
                        ? "bg-[#ffdc2b] text-[#0e1312] font-bold"
                        : "bg-[#161d2c] text-[#b6c0d4] hover:text-[#f4f6fb]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredMatches.map((m) => (
                <div
                  key={m.id}
                  className="bg-[#111622] border border-[#222c40] rounded-[4px] p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#192131]">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-[2px] bg-[#1d2639] text-[#ffdc2b] text-[11px] font-semibold">
                        {m.label}
                      </span>
                    </div>
                    <MatchStatusBadge status={m.status} />
                  </div>

                  {/* Placar Central */}
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-1 tabular-nums">
                    <div>
                      <p className="text-sm font-bold text-[#f4f6fb]">
                        {m.homeNickname}
                      </p>
                      <p className="text-xs text-[#78849e]">{m.homeClub}</p>
                    </div>

                    <div className="px-3.5 py-1.5 rounded-[4px] bg-[#090c12] border border-[#222c40] text-base font-bold text-[#ffdc2b] flex items-center gap-2">
                      <span>{m.homeScore ?? "—"}</span>
                      <span className="text-xs text-[#78849e]">×</span>
                      <span>{m.awayScore ?? "—"}</span>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-[#f4f6fb]">
                        {m.awayNickname}
                      </p>
                      <p className="text-xs text-[#78849e]">{m.awayClub}</p>
                    </div>
                  </div>

                  {/* Rodapé da Partida: Notas, Comprovante e Ações */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#192131] text-xs">
                    <div className="flex flex-wrap items-center gap-3 text-[#78849e]">
                      {m.notes && <span>{m.notes}</span>}
                      {m.proofUrl && (
                        <a
                          href={m.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#ffdc2b] hover:underline font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Ver Print Comprovante</span>
                        </a>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {(m.status === "awaiting_confirmation" ||
                        m.status === "disputed") && (
                        <>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleQuickMediate(m.id, "approve")}
                            className="px-2.5 py-1 rounded-[2px] bg-[#15a34a]/20 hover:bg-[#15a34a]/30 border border-[#15a34a]/50 text-[#4ade80] text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Homologar</span>
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              handleQuickMediate(m.id, "walkover_away")
                            }
                            className="px-2.5 py-1 rounded-[2px] bg-[#be123c]/20 hover:bg-[#be123c]/30 border border-[#be123c]/50 text-[#fb7185] text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <ShieldAlert className="w-3 h-3" />
                            <span>Aplicar W.O.</span>
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => setModalMatchId(m.id)}
                        className="px-3 py-1 rounded-[2px] bg-[#161d2c] hover:bg-[#ffdc2b] hover:text-[#0e1312] border border-[#222c40] text-[11px] font-semibold text-[#f4f6fb] transition-colors cursor-pointer"
                      >
                        Editar / Enviar Placar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Painel Fixo Lateral de Submissão de Placar */}
          <div className="xl:sticky xl:top-20">
            <ScoreSubmissionPanel
              tournamentSlug={tournament.slug}
              matches={matches}
              selectedMatchId={
                matches.find((m) => m.status === "awaiting_confirmation")?.id ??
                matches[0]?.id
              }
            />
          </div>
        </div>
      )}

      {/* =====================================================================
       * TAB 4: INSCRITOS (CHECK-IN) & REGULAMENTO
       * ===================================================================== */}
      {activeTab === "rules" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de 8 Participantes e Check-in */}
          <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#222c40] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#ffdc2b]" />
                <h3 className="text-sm font-bold text-[#f4f6fb]">
                  Participantes Inscritos ({participants.length}/
                  {tournament.maxParticipants})
                </h3>
              </div>
              <span className="text-[11px] text-[#78849e]">
                Status de Check-in Pré-Jogo
              </span>
            </div>

            <div className="divide-y divide-[#192131]">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-[2px] bg-[#161d2c] border border-[#222c40] text-xs font-bold text-[#ffdc2b] inline-flex items-center justify-center tabular-nums">
                      {p.seed}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[#f4f6fb]">
                        {p.nickname}{" "}
                        <span className="text-[#78849e] font-normal">
                          · {p.clubName}
                        </span>
                      </p>
                      <p className="text-[11px] text-[#78849e]">
                        {p.platformHandle} · Grupo {p.groupCode}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                      p.checkinStatus === "checked_in"
                        ? "bg-[#15a34a]/15 text-[#4ade80] border border-[#15a34a]/40"
                        : "bg-[#f97316]/15 text-[#fb923c] border border-[#f97316]/40"
                    }`}
                  >
                    {p.checkinStatus === "checked_in"
                      ? "Check-in Confirmado"
                      : "Check-in Pendente"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Regulamento Oficial */}
          <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-5 space-y-4">
            <div className="border-b border-[#222c40] pb-3">
              <span className="text-[11px] uppercase tracking-wider text-[#ffdc2b] font-semibold">
                Diretrizes da Competição
              </span>
              <h3 className="text-sm font-bold text-[#f4f6fb]">
                Regulamento e Critérios de Desempate
              </h3>
            </div>
            <div className="text-xs text-[#b6c0d4] leading-relaxed whitespace-pre-line space-y-2">
              {tournament.rulesMarkdown}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Submissão de Placar quando acionado por qualquer botão */}
      {modalMatchId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Reportar Placar e Comprovante"
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto"
        >
          <ScoreSubmissionPanel
            key={modalMatchId}
            tournamentSlug={tournament.slug}
            matches={matches}
            selectedMatchId={modalMatchId}
            onClose={() => setModalMatchId(null)}
            isModal
          />
        </div>
      )}
    </div>
  );
}
