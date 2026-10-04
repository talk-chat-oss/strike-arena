"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  UserPlus,
  MessageSquare,
  Send,
  X,
  Scale,
  Award,
} from "lucide-react";
import type {
  MockTournament,
  MockGroup,
  MockParticipant,
  MockStanding,
  MockMatch,
} from "@/db/mock-data";
import type { SessionUser } from "@/lib/auth";
import { CLUB_CRESTS, ClubCrest } from "@/lib/club-crests";
import { MatchStatusBadge } from "./status-badge";
import { ScoreSubmissionPanel } from "./score-submission-modal";
import {
  mediateMatchAction,
  joinTournamentAction,
  toggleCheckinAction,
  getMatchMessagesAction,
  sendMatchMessageAction,
} from "@/app/actions/tournament-actions";
import {
  generateTournamentFixturesAction,
  adminAdvanceTieWinnerAction,
} from "@/app/actions/tournament-engine-actions";
import {
  STAGE_LABELS,
  sortStandingsWithTiebreakers,
  type KnockoutStage,
} from "@/lib/tournament-engine";
import { createLeaguePassStripeCheckoutAction } from "@/app/actions/master-league-actions";

interface TournamentTabsProps {
  tournament: MockTournament;
  groups: MockGroup[];
  participants: MockParticipant[];
  standings: MockStanding[];
  matches: MockMatch[];
  currentUser: SessionUser | null;
  userLeaguePass?: {
    hasActivePass: boolean;
    expiresAt: string | null;
    mode: string;
    clubTeamId: string | null;
  };
}

type ActiveTab = "standings" | "bracket" | "matches" | "h2h" | "rules";
type MatchFilter = "all" | "group_a" | "group_b" | "playoffs" | "pending";

interface ChatMessage {
  id: string;
  matchId: string;
  senderNickname: string;
  senderRole: string;
  content: string;
  createdAt: string;
}

const POPULAR_CLUBS = Object.keys(CLUB_CRESTS);

export function TournamentTabs({
  tournament,
  groups,
  participants,
  standings,
  matches,
  currentUser,
  userLeaguePass,
}: TournamentTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("standings");
  const [matchFilter, setMatchFilter] = useState<MatchFilter>("all");
  const [modalMatchId, setModalMatchId] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Registration modal state
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState("Real Madrid");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [passClubTeamId, setPassClubTeamId] = useState<string | null>(
    userLeaguePass?.clubTeamId ?? null
  );

  // Match Chat state
  const [chatMatch, setChatMatch] = useState<MockMatch | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Freguesômetro (Head-to-Head) state
  const [h2hPlayerAId, setH2hPlayerAId] = useState(
    standings[0]?.participantId ?? ""
  );
  const [h2hPlayerBId, setH2hPlayerBId] = useState(
    standings[1]?.participantId ?? ""
  );

  const myParticipant = currentUser
    ? participants.find(
        (p) =>
          p.userId === currentUser.id ||
          p.nickname.toLowerCase() === currentUser.nickname.toLowerCase()
      )
    : undefined;

  const canMediate =
    currentUser?.isSuperAdmin ||
    currentUser?.role === "organizer" ||
    !currentUser;

  const groupAStandings = sortStandingsWithTiebreakers(
    standings.filter((s) => s.groupCode === "A"),
    matches
  );

  const groupBStandings = sortStandingsWithTiebreakers(
    standings.filter((s) => s.groupCode === "B"),
    matches
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

  // Freguesômetro calculations
  const playerAStanding =
    standings.find((s) => s.participantId === h2hPlayerAId) ?? standings[0];
  const playerBStanding =
    standings.find((s) => s.participantId === h2hPlayerBId) ?? standings[1];

  const directMatches = matches.filter(
    (m) =>
      (m.homeParticipantId === h2hPlayerAId &&
        m.awayParticipantId === h2hPlayerBId) ||
      (m.homeParticipantId === h2hPlayerBId &&
        m.awayParticipantId === h2hPlayerAId)
  );

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
        router.refresh();
      }
    });
  }

  function handleJoinTournament(e: React.FormEvent) {
    e.preventDefault();
    setJoinError(null);
    startTransition(async () => {
      const res = await joinTournamentAction({
        tournamentId: tournament.id,
        tournamentSlug: tournament.slug,
        clubName: selectedClub,
      });
      if (!res.ok) {
        if (res.requireAuth) {
          router.push("/auth");
          return;
        }
        if ("clubTeamId" in res && res.clubTeamId) {
          setPassClubTeamId(String(res.clubTeamId));
        }
        setJoinError(res.error ?? "Erro ao inscrever-se.");
        return;
      }
      setJoinModalOpen(false);
      setActionBanner(res.message ?? "Inscrição realizada com sucesso!");
      router.refresh();
    });
  }

  function handleBuyPassFromTournament(
    billingMode: "RECURRING_STRIPE" | "MONTHLY_PIX"
  ) {
    if (!passClubTeamId) {
      router.push("/store/strike-coins");
      return;
    }
    setJoinError(null);
    startTransition(async () => {
      const originUrl =
        typeof window !== "undefined" ? window.location.origin : undefined;
      const res = await createLeaguePassStripeCheckoutAction({
        clubTeamId: passClubTeamId,
        billingMode,
        returnPath: `/tournaments/${tournament.slug}`,
        originUrl,
      });
      if (res.ok && res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }
      setJoinError(
        res.error ||
          "Não foi possível iniciar o pagamento do Passe de Liga. Acesse a Loja Oficial."
      );
    });
  }

  function handleToggleCheckin(participant: MockParticipant) {
    startTransition(async () => {
      const res = await toggleCheckinAction({
        participantId: participant.id,
        tournamentSlug: tournament.slug,
        currentStatus: participant.checkinStatus,
      });
      if (res.ok) {
        setActionBanner(
          `${participant.nickname}: ${res.message ?? "Check-in atualizado!"}`
        );
        router.refresh();
      }
    });
  }

  async function openMatchChat(match: MockMatch) {
    setChatMatch(match);
    setChatLoading(true);
    const msgs = await getMatchMessagesAction(match.id);
    setChatMessages(msgs);
    setChatLoading(false);
  }

  function handleSendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatMatch || !chatInput.trim()) return;
    const text = chatInput;
    setChatInput("");
    startTransition(async () => {
      const res = await sendMatchMessageAction({
        matchId: chatMatch.id,
        tournamentSlug: tournament.slug,
        content: text,
      });
      if (res.ok) {
        const updated = await getMatchMessagesAction(chatMatch.id);
        setChatMessages(updated);
      }
    });
  }

  function handleGenerateFixtures() {
    setActionBanner(null);
    startTransition(async () => {
      const res = await generateTournamentFixturesAction({
        tournamentSlug: tournament.slug,
      });
      setActionBanner(
        res.ok
          ? res.message ?? "Jogos gerados com sucesso!"
          : res.error ?? "Erro ao gerar jogos."
      );
      if (res.ok) router.refresh();
    });
  }

  function handleAdminAdvanceTie(
    stage: string,
    slot: number,
    winnerParticipantId: string
  ) {
    if (!winnerParticipantId) return;
    setActionBanner(null);
    startTransition(async () => {
      const res = await adminAdvanceTieWinnerAction({
        tournamentSlug: tournament.slug,
        stage,
        slot,
        winnerParticipantId,
      });
      setActionBanner(
        res.ok
          ? res.message ?? "Classificado avançado!"
          : res.error ?? "Erro ao avançar classificado."
      );
      if (res.ok) router.refresh();
    });
  }

  const knockoutOrder: (KnockoutStage | "third_place")[] = [
    "round_of_32",
    "round_of_16",
    "quarterfinal",
    "semifinal",
    "final",
    "third_place",
  ];
  const presentKnockoutStages = knockoutOrder.filter((st) =>
    matches.some((m) => m.stage === st)
  );
  const hasGroupMatches = matches.some((m) => m.stage === "group");
  const hasKnockoutMatches = presentKnockoutStages.length > 0;

  function groupStageTies(stage: KnockoutStage | "third_place") {
    const stageMatches = matches
      .filter((m) => m.stage === stage)
      .sort(
        (a, b) =>
          (a.bracketPosition ?? 1) - (b.bracketPosition ?? 1) ||
          (a.leg ?? 1) - (b.leg ?? 1)
      );
    const map = new Map<number, MockMatch[]>();
    for (const m of stageMatches) {
      const key = m.bracketPosition ?? 1;
      const arr = map.get(key) ?? [];
      arr.push(m);
      map.set(key, arr);
    }
    return Array.from(map.entries()).map(([slot, legs]) => {
      const first = legs[0];
      const last = legs[legs.length - 1];
      const teamAId = first.homeParticipantId;
      let aggA = 0;
      let aggB = 0;
      let anyPlayed = false;
      for (const l of legs) {
        if ((l.leg ?? 1) <= 2 && l.homeScore !== null && l.awayScore !== null) {
          anyPlayed = true;
          if (l.homeParticipantId === teamAId) {
            aggA += l.homeScore;
            aggB += l.awayScore;
          } else {
            aggA += l.awayScore;
            aggB += l.homeScore;
          }
        }
      }
      return {
        slot,
        legs,
        first,
        last,
        aggA: anyPlayed ? aggA : null,
        aggB: anyPlayed ? aggB : null,
      };
    });
  }

  return (
    <div className="space-y-6">
      {/* Kinetic Filled Tabs Bar + Botões de Inscrição e Envio de Placar (Padronizados h-11) */}
      <div className="space-y-2.5 border-b border-[#222c40] pb-4">
        <div
          role="tablist"
          aria-label="Seções do torneio"
          className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-5 gap-2"
        >
          <button
            role="tab"
            aria-selected={activeTab === "standings"}
            onClick={() => setActiveTab("standings")}
            className={`w-full h-11 px-3.5 rounded-[4px] text-xs font-extrabold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "standings"
                ? "bg-[#ffdc2b] text-[#0e1312]"
                : "bg-[#111622] text-[#b6c0d4] hover:bg-[#161d2c] hover:text-[#f4f6fb] border border-[#222c40]"
            }`}
          >
            <Table2 className="w-4 h-4 shrink-0" />
            <span className="truncate">Tabela & Classificação</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "bracket"}
            onClick={() => setActiveTab("bracket")}
            className={`w-full h-11 px-3.5 rounded-[4px] text-xs font-extrabold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "bracket"
                ? "bg-[#ffdc2b] text-[#0e1312]"
                : "bg-[#111622] text-[#b6c0d4] hover:bg-[#161d2c] hover:text-[#f4f6fb] border border-[#222c40]"
            }`}
          >
            <GitBranch className="w-4 h-4 shrink-0" />
            <span className="truncate">Chaveamento (Playoffs)</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "matches"}
            onClick={() => setActiveTab("matches")}
            className={`w-full h-11 px-3.5 rounded-[4px] text-xs font-extrabold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "matches"
                ? "bg-[#ffdc2b] text-[#0e1312]"
                : "bg-[#111622] text-[#b6c0d4] hover:bg-[#161d2c] hover:text-[#f4f6fb] border border-[#222c40]"
            }`}
          >
            <Swords className="w-4 h-4 shrink-0" />
            <span className="truncate">Partidas & Match Hub</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none shrink-0 ${
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
            aria-selected={activeTab === "h2h"}
            onClick={() => setActiveTab("h2h")}
            className={`w-full h-11 px-3.5 rounded-[4px] text-xs font-extrabold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "h2h"
                ? "bg-[#ffdc2b] text-[#0e1312]"
                : "bg-[#111622] text-[#b6c0d4] hover:bg-[#161d2c] hover:text-[#f4f6fb] border border-[#222c40]"
            }`}
          >
            <Scale className="w-4 h-4 shrink-0" />
            <span className="truncate">Freguesômetro & Fair Play</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "rules"}
            onClick={() => setActiveTab("rules")}
            className={`w-full h-11 px-3.5 rounded-[4px] text-xs font-extrabold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "rules"
                ? "bg-[#ffdc2b] text-[#0e1312]"
                : "bg-[#111622] text-[#b6c0d4] hover:bg-[#161d2c] hover:text-[#f4f6fb] border border-[#222c40]"
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate">
              Inscritos & Check-in ({participants.length})
            </span>
          </button>
        </div>

        {/* Botões Rápidos: Inscrever-se + Enviar Placar (Mesmo Tamanho h-11) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {myParticipant ? (
            <button
              type="button"
              onClick={() => handleToggleCheckin(myParticipant)}
              className="w-full h-11 px-4 rounded-[4px] bg-[#15a34a]/20 hover:bg-[#15a34a]/30 border border-[#15a34a]/50 text-[#4ade80] text-xs font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <ClubCrest clubName={myParticipant.clubName} size="sm" />
              <span className="truncate">
                Inscrito ({myParticipant.clubName}) ·{" "}
                {myParticipant.checkinStatus === "checked_in"
                  ? "Check-in OK"
                  : "Fazer Check-in"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  router.push("/auth");
                } else {
                  setJoinModalOpen(true);
                }
              }}
              className="w-full h-11 px-4 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] text-xs font-extrabold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>Inscrever-se / Escolher Escudo</span>
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              setModalMatchId(
                matches.find((m) => m.status !== "completed")?.id ??
                  matches[0]?.id ??
                  null
              )
            }
            className="w-full h-11 px-4 rounded-[4px] bg-[#133865] hover:bg-[#1c4d8a] border border-[#ffdc2b]/50 text-[#f4f6fb] text-xs font-extrabold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#ffdc2b] shrink-0" />
            <span>Enviar Placar / Print</span>
          </button>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionBanner && (
        <div className="p-3.5 rounded-[4px] bg-[#15a34a]/15 border border-[#15a34a]/40 text-xs text-[#4ade80] flex items-center justify-between">
          <span>✔ {actionBanner}</span>
          <button
            type="button"
            onClick={() => setActionBanner(null)}
            className="text-[11px] underline cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* =====================================================================
       * TAB 1: TABELA DE CLASSIFICAÇÃO COM BRASÕES DOS TIMES
       * ===================================================================== */}
      {activeTab === "standings" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {[
              {
                group: groups[0] ?? { name: "Grupo A", code: "A" },
                rows: groupAStandings,
              },
              {
                group: groups[1] ?? { name: "Grupo B", code: "B" },
                rows: groupBStandings,
              },
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
                        <th className="py-3 px-4">Clube / Competidor</th>
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
                              <div className="flex items-center gap-3">
                                <ClubCrest clubName={row.clubName} size="md" />
                                <div>
                                  <div className="font-semibold text-[#f4f6fb]">
                                    {row.nickname}
                                  </div>
                                  <div className="text-[11px] text-[#78849e] flex items-center gap-2">
                                    <span className="text-[#ffdc2b] font-medium">
                                      {row.clubName}
                                    </span>
                                    <span>·</span>
                                    <span>{row.platformHandle}</span>
                                  </div>
                                </div>
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

          {/* Resumo de Ataque / Artilharia Consolidada com Brasões */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#111622] border border-[#222c40] rounded-[4px] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#ffdc2b] font-semibold">
                    Artilharia & Poder Ofensivo
                  </span>
                  <h4 className="text-sm font-bold text-[#f4f6fb]">
                    Top 5 Melhores Ataques do Campeonato
                  </h4>
                </div>
                <Sparkles className="w-4 h-4 text-[#ffdc2b]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {topAttacks.map((item, i) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-[4px] bg-[#161d2c] border border-[#222c40] flex flex-col justify-between gap-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] bg-[#1d2639] text-[#ffdc2b]">
                        #{i + 1}
                      </span>
                      <ClubCrest clubName={item.clubName} size="sm" />
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
                      <span className="text-[11px] text-[#78849e]">
                        Gols Pró
                      </span>
                      <span className="text-base font-bold text-[#ffdc2b]">
                        {item.goalsFor}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card de Alerta / Critérios de Desempate Oficiais KSN YNUI */}
            <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-5 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-[#ffdc2b] font-semibold">
                  Critérios Oficiais da Liga
                </span>
                <ol className="list-decimal list-inside space-y-1 text-xs text-[#b6c0d4]">
                  <li>Maior número de Pontos (PTS)</li>
                  <li>Maior número de Vitórias (V)</li>
                  <li>Maior Saldo de Gol (SG)</li>
                  <li>Maior número de Gols Feitos (GP)</li>
                  <li>Confronto Direto (H2H)</li>
                  <li>Persistindo empate: Jogo Extra (Prorrogação + Pênaltis)</li>
                </ol>
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
                  onClick={() => setActiveTab("h2h")}
                  className="flex-1 min-h-10 px-3 py-2 rounded-[4px] bg-[#161d2c] hover:bg-[#1d2639] border border-[#222c40] text-[#f4f6fb] font-medium text-xs cursor-pointer"
                >
                  Freguesômetro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
       * TAB 2: CHAVEAMENTO INTERATIVO COM BRASÕES (MATA-MATA / BRACKET TREE)
       * ===================================================================== */}
      {activeTab === "bracket" && (
        <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-5 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222c40] pb-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#ffdc2b] font-semibold">
                Fase Eliminatória ·{" "}
                {tournament.legsPerRound === 2
                  ? "Ida e Volta (Desempate por Gols → Jogo Extra c/ Prorrogação + Pênaltis)"
                  : "Jogo Único"}{" "}
                · Final Jogo Único
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#f4f6fb]">
                Árvore de Playoffs — {tournament.name}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {canMediate &&
                (!hasKnockoutMatches ||
                  (tournament.format === "groups_playoffs" &&
                    !hasGroupMatches)) && (
                  <button
                    type="button"
                    onClick={handleGenerateFixtures}
                    disabled={isPending}
                    className="px-3.5 py-2 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {isPending
                        ? "Gerando..."
                        : tournament.format === "groups_playoffs" &&
                          !hasGroupMatches
                        ? "Sortear Grupos e Gerar Jogos"
                        : "Gerar Chave de Mata-Mata"}
                    </span>
                  </button>
                )}
              <div className="flex items-center gap-2 text-xs text-[#78849e]">
                <Trophy className="w-4 h-4 text-[#ffdc2b]" />
                <span>Premiação Total: R$ {tournament.prizePoolBrl},00</span>
              </div>
            </div>
          </div>

          {!hasKnockoutMatches ? (
            <div className="p-8 text-center bg-[#090c12] border border-[#222c40] rounded-[4px] space-y-3">
              <p className="text-sm font-bold text-[#f4f6fb]">
                A chave eliminatória ainda não foi gerada.
              </p>
              <p className="text-xs text-[#78849e] max-w-lg mx-auto">
                {tournament.format === "groups_playoffs"
                  ? "Conclua todos os jogos da fase de grupos para liberar o cruzamento olímpico (ou clique no botão acima para iniciar a fase atual)."
                  : "Clique em 'Gerar Chave de Mata-Mata' acima para sortear os confrontos (Ida e Volta ou Jogo Único conforme configurado)."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 py-2 items-start">
              {presentKnockoutStages.map((stageKey) => {
                const ties = groupStageTies(stageKey);
                const isFinal = stageKey === "final";
                return (
                  <div key={stageKey} className="space-y-4">
                    <div
                      className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        isFinal ? "text-[#ffdc2b]" : "text-[#78849e]"
                      }`}
                    >
                      {isFinal && <Trophy className="w-4 h-4" />}
                      <span>
                        {STAGE_LABELS[stageKey]} (
                        {isFinal
                          ? "Jogo Único"
                          : (ties[0]?.legs.length ?? 1) >= 2
                          ? "Ida e Volta"
                          : "Jogo Único"}
                        )
                      </span>
                    </div>

                    {ties.map((tie) => {
                      const { first, last, legs, aggA, aggB } = tie;
                      const winnerId = last.winnerParticipantId;
                      const teamAWon =
                        Boolean(winnerId) &&
                        winnerId === first.homeParticipantId;
                      const teamBWon =
                        Boolean(winnerId) &&
                        winnerId === first.awayParticipantId;
                      const hasPens =
                        last.homePenalties !== null &&
                        last.homePenalties !== undefined &&
                        last.awayPenalties !== null &&
                        last.awayPenalties !== undefined;

                      return (
                        <div
                          key={`${stageKey}-${tie.slot}`}
                          className={`bg-[#090c12] rounded-[4px] p-4 space-y-3 ${
                            isFinal
                              ? "border-2 border-[#ffdc2b]"
                              : "border border-[#222c40]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold text-[#ffdc2b]">
                              {STAGE_LABELS[stageKey]}{" "}
                              {ties.length > 1 ? `#${tie.slot}` : ""}
                            </span>
                            <MatchStatusBadge status={last.status} />
                          </div>

                          <div className="space-y-2 tabular-nums">
                            <div
                              className={`flex items-center justify-between p-2.5 rounded-[4px] border ${
                                teamAWon
                                  ? "bg-[#ffdc2b]/10 border-[#ffdc2b]/50 text-[#f4f6fb]"
                                  : "bg-[#161d2c] border-[#222c40] text-[#b6c0d4]"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <ClubCrest clubName={first.homeClub} size="md" />
                                <div>
                                  <p className="text-xs font-bold text-[#f4f6fb]">
                                    {first.homeNickname}
                                  </p>
                                  <p className="text-[11px] text-[#78849e]">
                                    {first.homeClub}
                                  </p>
                                </div>
                              </div>
                              <span className="text-base font-bold text-[#ffdc2b]">
                                {aggA ?? "—"}
                              </span>
                            </div>

                            <div
                              className={`flex items-center justify-between p-2.5 rounded-[4px] border ${
                                teamBWon
                                  ? "bg-[#ffdc2b]/10 border-[#ffdc2b]/50 text-[#f4f6fb]"
                                  : "bg-[#161d2c] border-[#222c40] text-[#b6c0d4]"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <ClubCrest clubName={first.awayClub} size="md" />
                                <div>
                                  <p className="text-xs font-bold text-[#f4f6fb]">
                                    {first.awayNickname}
                                  </p>
                                  <p className="text-[11px] text-[#78849e]">
                                    {first.awayClub}
                                  </p>
                                </div>
                              </div>
                              <span className="text-base font-bold text-[#ffdc2b]">
                                {aggB ?? "—"}
                              </span>
                            </div>
                          </div>

                          {legs.length > 1 && (
                            <div className="text-[11px] text-[#b6c0d4] bg-[#161d2c]/70 border border-[#222c40] rounded-[4px] p-2.5 space-y-1 tabular-nums">
                              {legs.map((l) => (
                                <div
                                  key={l.id}
                                  className="flex items-center justify-between"
                                >
                                  <span
                                    className={
                                      l.leg === 3
                                        ? "text-[#ffdc2b] font-semibold"
                                        : "text-[#78849e]"
                                    }
                                  >
                                    {l.leg === 1
                                      ? "Jogo de Ida"
                                      : l.leg === 2
                                      ? "Jogo de Volta"
                                      : "3º Jogo Extra (Prorrogação + Pênaltis)"}{" "}
                                    ({l.homeNickname} × {l.awayNickname})
                                  </span>
                                  <span className="font-bold text-[#f4f6fb]">
                                    {l.homeScore !== null
                                      ? `${l.homeScore} × ${l.awayScore}`
                                      : "Agendado"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {hasPens && (
                            <div className="text-[11px] font-semibold text-[#ffdc2b] bg-[#ffdc2b]/10 border border-[#ffdc2b]/30 rounded-[4px] px-2.5 py-1.5 text-center tabular-nums">
                              Pênaltis ({last.homeNickname} {last.homePenalties}{" "}
                              × {last.awayPenalties} {last.awayNickname})
                            </div>
                          )}

                          {canMediate &&
                            first.homeParticipantId &&
                            first.awayParticipantId && (
                              <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-[#192131]">
                                <span className="text-[10px] uppercase tracking-wider text-[#78849e]">
                                  Avançar (ADM):
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() =>
                                      handleAdminAdvanceTie(
                                        stageKey,
                                        tie.slot,
                                        first.homeParticipantId
                                      )
                                    }
                                    className="px-2 py-1 rounded-[2px] bg-[#15a34a]/20 hover:bg-[#15a34a] text-[#4ade80] hover:text-[#f4f6fb] text-[10px] font-bold transition-colors cursor-pointer"
                                  >
                                    Passar {first.homeNickname}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() =>
                                      handleAdminAdvanceTie(
                                        stageKey,
                                        tie.slot,
                                        first.awayParticipantId
                                      )
                                    }
                                    className="px-2 py-1 rounded-[2px] bg-[#15a34a]/20 hover:bg-[#15a34a] text-[#4ade80] hover:text-[#f4f6fb] text-[10px] font-bold transition-colors cursor-pointer"
                                  >
                                    Passar {first.awayNickname}
                                  </button>
                                </div>
                              </div>
                            )}

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <span className="text-[11px] text-[#78849e] truncate max-w-[180px]">
                              {legs.length > 1
                                ? "Soma de gols (Ida + Volta)"
                                : first.notes ?? "Confronto eliminatório"}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {legs.map((l) => (
                                <button
                                  key={l.id}
                                  type="button"
                                  onClick={() => setModalMatchId(l.id)}
                                  className="px-2.5 py-1 rounded-[2px] bg-[#1d2639] hover:bg-[#ffdc2b] hover:text-[#0e1312] text-[11px] font-semibold text-[#f4f6fb] transition-colors cursor-pointer"
                                >
                                  {legs.length > 1
                                    ? `Reportar ${
                                        l.leg === 1
                                          ? "Ida"
                                          : l.leg === 2
                                          ? "Volta"
                                          : "Jogo Extra"
                                      }`
                                    : "Reportar Placar"}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
       * TAB 3: PARTIDAS & MATCH HUB COM BRASÕES FRENTE A FRENTE
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

                  {/* Placar Central com Brasões dos Clubes */}
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-1 tabular-nums">
                    <div className="flex items-center gap-3">
                      <ClubCrest clubName={m.homeClub} size="md" />
                      <div>
                        <p className="text-sm font-bold text-[#f4f6fb]">
                          {m.homeNickname}
                        </p>
                        <p className="text-xs text-[#78849e]">{m.homeClub}</p>
                      </div>
                    </div>

                    <div className="px-3.5 py-1.5 rounded-[4px] bg-[#090c12] border border-[#222c40] text-base font-bold text-[#ffdc2b] flex items-center gap-2">
                      <span>{m.homeScore ?? "—"}</span>
                      <span className="text-xs text-[#78849e]">×</span>
                      <span>{m.awayScore ?? "—"}</span>
                    </div>

                    <div className="flex items-center justify-end gap-3 text-right">
                      <div>
                        <p className="text-sm font-bold text-[#f4f6fb]">
                          {m.awayNickname}
                        </p>
                        <p className="text-xs text-[#78849e]">{m.awayClub}</p>
                      </div>
                      <ClubCrest clubName={m.awayClub} size="md" />
                    </div>
                  </div>

                  {/* Rodapé da Partida: Notas, Comprovante, Chat e Ações */}
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
                      <button
                        type="button"
                        onClick={() => openMatchChat(m)}
                        className="px-2.5 py-1 rounded-[2px] bg-[#161d2c] hover:bg-[#1d2639] border border-[#222c40] text-[#b6c0d4] hover:text-[#f4f6fb] text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3 text-[#ffdc2b]" />
                        <span>Chat da Sala</span>
                      </button>

                      {canMediate &&
                        (m.status === "awaiting_confirmation" ||
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
                        Reportar Placar
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
       * TAB 4: FREGUESÔMETRO (HEAD-TO-HEAD) & RANKING FAIR PLAY (ARENA VIRTUAL / ARENA17)
       * ===================================================================== */}
      {activeTab === "h2h" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Freguesômetro Comparador */}
          <div className="lg:col-span-7 bg-[#111622] border border-[#222c40] rounded-[4px] p-6 space-y-6">
            <div className="border-b border-[#222c40] pb-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#ffdc2b] font-semibold">
                  Freguesômetro · Confronto Direto & Raio-X
                </span>
                <h3 className="text-base font-bold text-[#f4f6fb]">
                  Comparador Head-to-Head de Competidores
                </h3>
              </div>
              <Scale className="w-5 h-5 text-[#ffdc2b]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#78849e] mb-1.5">
                  Competidor 1
                </label>
                <select
                  value={h2hPlayerAId}
                  onChange={(e) => setH2hPlayerAId(e.target.value)}
                  className="w-full h-10 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs text-[#f4f6fb]"
                >
                  {standings.map((s) => (
                    <option key={s.participantId} value={s.participantId}>
                      {s.nickname} ({s.clubName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#78849e] mb-1.5">
                  Competidor 2
                </label>
                <select
                  value={h2hPlayerBId}
                  onChange={(e) => setH2hPlayerBId(e.target.value)}
                  className="w-full h-10 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs text-[#f4f6fb]"
                >
                  {standings.map((s) => (
                    <option key={s.participantId} value={s.participantId}>
                      {s.nickname} ({s.clubName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {playerAStanding && playerBStanding && (
              <div className="bg-[#090c12] border border-[#222c40] rounded-[4px] p-5 space-y-5 tabular-nums">
                <div className="grid grid-cols-3 items-center text-center gap-3">
                  <div className="flex flex-col items-center gap-2">
                    <ClubCrest clubName={playerAStanding.clubName} size="lg" />
                    <div>
                      <p className="text-sm font-bold text-[#f4f6fb]">
                        {playerAStanding.nickname}
                      </p>
                      <p className="text-xs text-[#ffdc2b]">
                        {playerAStanding.clubName}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs font-bold uppercase tracking-widest text-[#78849e]">
                    VS
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <ClubCrest clubName={playerBStanding.clubName} size="lg" />
                    <div>
                      <p className="text-sm font-bold text-[#f4f6fb]">
                        {playerBStanding.nickname}
                      </p>
                      <p className="text-xs text-[#ffdc2b]">
                        {playerBStanding.clubName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-[#192131] text-xs">
                  {[
                    {
                      label: "Pontos na Liga",
                      a: playerAStanding.points,
                      b: playerBStanding.points,
                    },
                    {
                      label: "Vitórias",
                      a: playerAStanding.wins,
                      b: playerBStanding.wins,
                    },
                    {
                      label: "Gols Marcados (GP)",
                      a: playerAStanding.goalsFor,
                      b: playerBStanding.goalsFor,
                    },
                    {
                      label: "Saldo de Gols (SG)",
                      a: playerAStanding.goalDifference,
                      b: playerBStanding.goalDifference,
                    },
                    {
                      label: "Aproveitamento",
                      a: `${
                        playerAStanding.matchesPlayed > 0
                          ? Math.round(
                              (playerAStanding.points /
                                (playerAStanding.matchesPlayed * 3)) *
                                100
                            )
                          : 0
                      }%`,
                      b: `${
                        playerBStanding.matchesPlayed > 0
                          ? Math.round(
                              (playerBStanding.points /
                                (playerBStanding.matchesPlayed * 3)) *
                                100
                            )
                          : 0
                      }%`,
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="py-2.5 grid grid-cols-3 items-center text-center"
                    >
                      <span className="font-bold text-sm text-[#f4f6fb]">
                        {stat.a}
                      </span>
                      <span className="text-[11px] uppercase text-[#78849e]">
                        {stat.label}
                      </span>
                      <span className="font-bold text-sm text-[#f4f6fb]">
                        {stat.b}
                      </span>
                    </div>
                  ))}
                </div>

                {directMatches.length > 0 && (
                  <div className="pt-3 border-t border-[#222c40] space-y-2">
                    <span className="text-[11px] font-bold uppercase text-[#ffdc2b]">
                      Confronto(s) Direto(s) Registrado(s) no Torneio:
                    </span>
                    {directMatches.map((dm) => (
                      <div
                        key={dm.id}
                        className="p-2.5 rounded-[4px] bg-[#161d2c] flex items-center justify-between text-xs"
                      >
                        <span>{dm.label}</span>
                        <span className="font-bold text-[#ffdc2b]">
                          {dm.homeNickname} {dm.homeScore ?? "—"} ×{" "}
                          {dm.awayScore ?? "—"} {dm.awayNickname}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ranking Fair Play & Conduta (Arena17 Style) */}
          <div className="lg:col-span-5 bg-[#111622] border border-[#222c40] rounded-[4px] p-6 space-y-4">
            <div className="border-b border-[#222c40] pb-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#4ade80] font-semibold">
                  Índice de Conduta · Anti-W.O.
                </span>
                <h3 className="text-base font-bold text-[#f4f6fb]">
                  Ranking Fair Play da Liga
                </h3>
              </div>
              <Award className="w-5 h-5 text-[#4ade80]" />
            </div>

            <p className="text-xs text-[#78849e] leading-relaxed">
              Calculado automaticamente pelo comparecimento no horário, ausência
              de W.O. e confirmação rápida de resultados no Match Hub.
            </p>

            <div className="divide-y divide-[#192131]">
              {participants.map((p) => {
                const isPendingCheckin = p.checkinStatus !== "checked_in";
                const score = isPendingCheckin ? "85%" : "100%";
                return (
                  <div
                    key={p.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <ClubCrest clubName={p.clubName} size="sm" />
                      <div>
                        <p className="text-xs font-bold text-[#f4f6fb]">
                          {p.nickname}
                        </p>
                        <p className="text-[11px] text-[#78849e]">
                          {p.clubName} · 0 W.O. sofridos
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${
                        isPendingCheckin
                          ? "bg-[#f97316]/15 text-[#fb923c]"
                          : "bg-[#15a34a]/15 text-[#4ade80]"
                      }`}
                    >
                      {score} Fair Play
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
       * TAB 5: INSCRITOS (CHECK-IN INTERATIVO COM BRASÕES) & REGULAMENTO
       * ===================================================================== */}
      {activeTab === "rules" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Participantes e Check-in */}
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
                Clique no status para alternar Check-in
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
                    <ClubCrest clubName={p.clubName} size="md" />
                    <div>
                      <p className="text-xs font-bold text-[#f4f6fb]">
                        {p.nickname}{" "}
                        <span className="text-[#ffdc2b] font-medium">
                          · {p.clubName}
                        </span>
                      </p>
                      <p className="text-[11px] text-[#78849e]">
                        {p.platformHandle} · Grupo {p.groupCode}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleToggleCheckin(p)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-opacity hover:opacity-80 cursor-pointer ${
                      p.checkinStatus === "checked_in"
                        ? "bg-[#15a34a]/15 text-[#4ade80] border border-[#15a34a]/40"
                        : "bg-[#f97316]/15 text-[#fb923c] border border-[#f97316]/40"
                    }`}
                  >
                    {p.checkinStatus === "checked_in"
                      ? "Check-in Confirmado"
                      : "Check-in Pendente"}
                  </button>
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

      {/* =====================================================================
       * MODAL DE INSCRIÇÃO NO TORNEIO (SELETOR VISUAL DE ESCUDOS + PASSE DE LIGA)
       * ===================================================================== */}
      {joinModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="w-full max-w-lg bg-[#111622] border border-[#222c40] rounded-[4px] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#222c40] pb-3">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#ffdc2b] font-semibold">
                  Passe de Liga Obrigatório (R$ 30,00/mês) · +500 Striker Coins
                </span>
                <h3 className="text-base font-bold text-[#f4f6fb]">
                  Inscrever-se em {tournament.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setJoinModalOpen(false)}
                className="text-[#78849e] hover:text-[#f4f6fb] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Card de Status do Passe de Liga (R$ 30,00 / mês) */}
            <div
              className={`p-3.5 rounded-[4px] border text-xs space-y-2.5 ${
                userLeaguePass?.hasActivePass
                  ? "bg-[#15a34a]/15 border-[#15a34a]/50 text-[#4ade80]"
                  : "bg-[#ffdc2b]/10 border-[#ffdc2b]/50 text-[#f4f6fb]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold uppercase tracking-wider">
                  {userLeaguePass?.hasActivePass
                    ? "✔ Passe de Liga Ativo"
                    : "🎟️ Passe de Liga Obrigatório (R$ 30,00 / mês)"}
                </span>
                {userLeaguePass?.expiresAt && (
                  <span className="text-[11px] font-bold">
                    Vencimento:{" "}
                    {new Date(userLeaguePass.expiresAt).toLocaleDateString(
                      "pt-BR"
                    )}
                  </span>
                )}
              </div>

              {!userLeaguePass?.hasActivePass && (
                <>
                  <p className="text-[11px] text-[#b6c0d4] leading-relaxed">
                    Só pode jogar torneios da Master League quem tiver o{" "}
                    <strong className="text-[#ffdc2b]">
                      Passe de Liga ativo (R$ 30,00/mês)
                    </strong>{" "}
                    via assinatura mensal recorrente ou pagamento mensal via PIX
                    com vencimento estipulado.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        handleBuyPassFromTournament("RECURRING_STRIPE")
                      }
                      className="h-10 px-3 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-extrabold text-[11px] inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Assinar Recorrente (R$ 30/mês)</span>
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleBuyPassFromTournament("MONTHLY_PIX")}
                      className="h-10 px-3 rounded-[4px] bg-[#133865] hover:bg-[#1c4d8a] border border-[#ffdc2b]/50 text-[#f4f6fb] font-extrabold text-[11px] inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Mensal 30 Dias / PIX (R$ 30)</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {joinError && (
              <div className="p-3 rounded-[4px] bg-[#be123c]/15 border border-[#be123c]/40 text-xs text-[#fb7185]">
                {joinError}
              </div>
            )}

            <form onSubmit={handleJoinTournament} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#b6c0d4] mb-1.5">
                  Competidor Autenticado
                </label>
                <div className="p-2.5 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs font-bold text-[#ffdc2b]">
                  {currentUser?.nickname} ({currentUser?.email})
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#b6c0d4] mb-2">
                  Escolha seu Clube & Brasão Oficial
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
                  {POPULAR_CLUBS.map((club) => {
                    const active = selectedClub === club;
                    return (
                      <button
                        key={club}
                        type="button"
                        onClick={() => setSelectedClub(club)}
                        className={`p-2.5 rounded-[4px] border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                          active
                            ? "bg-[#ffdc2b]/15 border-[#ffdc2b] text-[#f4f6fb]"
                            : "bg-[#090c12] border-[#222c40] text-[#b6c0d4] hover:border-[#78849e]"
                        }`}
                      >
                        <ClubCrest clubName={club} size="sm" />
                        <span className="text-xs font-semibold truncate">
                          {club}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3">
                  <label className="block text-[11px] text-[#78849e] mb-1">
                    Ou digite o nome de outro clube:
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value)}
                    placeholder="Ex: Real Madrid"
                    className="w-full h-9 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs text-[#f4f6fb] focus:outline-none focus:border-[#ffdc2b]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setJoinModalOpen(false)}
                  className="h-10 px-4 rounded-[4px] bg-[#161d2c] text-xs text-[#b6c0d4] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="h-10 px-5 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-bold text-xs cursor-pointer"
                >
                  {isPending
                    ? "Confirmando inscrição..."
                    : "Confirmar Escudo & Inscrição"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
       * MODAL DE CHAT DA PARTIDA (COMBINAMENTO DE HORÁRIO / ID)
       * ===================================================================== */}
      {chatMatch && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-lg bg-[#111622] border border-[#222c40] rounded-[4px] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#222c40] pb-3">
              <div className="flex items-center gap-2.5">
                <ClubCrest clubName={chatMatch.homeClub} size="sm" />
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#ffdc2b] font-semibold block">
                    Sala de Confronto · {chatMatch.label}
                  </span>
                  <h3 className="text-sm font-bold text-[#f4f6fb]">
                    {chatMatch.homeNickname} × {chatMatch.awayNickname}
                  </h3>
                </div>
                <ClubCrest clubName={chatMatch.awayClub} size="sm" />
              </div>
              <button
                type="button"
                onClick={() => setChatMatch(null)}
                className="text-[#78849e] hover:text-[#f4f6fb] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="h-64 overflow-y-auto bg-[#090c12] border border-[#222c40] rounded-[4px] p-3 space-y-2.5">
              {chatLoading ? (
                <p className="text-xs text-[#78849e]">
                  Carregando histórico da partida...
                </p>
              ) : chatMessages.length === 0 ? (
                <div className="text-xs text-[#78849e] space-y-1">
                  <p className="text-[#b6c0d4] font-semibold">
                    Nenhuma mensagem enviada ainda nesta sala.
                  </p>
                  <p>
                    Use este chat para enviar sua PSN/EA ID, senha do lobby
                    amistoso e combinar o horário da partida.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-2.5 rounded-[4px] bg-[#161d2c] border border-[#222c40] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#ffdc2b]">
                        {msg.senderNickname}
                      </span>
                      <span className="text-[10px] text-[#78849e]">
                        {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-[#f4f6fb]">{msg.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ex: Bora jogar agora? Me adiciona na PSN / EA ID..."
                className="flex-1 h-10 px-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs text-[#f4f6fb] focus:outline-none focus:border-[#ffdc2b]"
              />
              <button
                type="submit"
                disabled={isPending}
                className="h-10 px-4 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </form>
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
