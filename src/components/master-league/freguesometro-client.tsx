"use client";

import { useState, useTransition } from "react";
import {
  Swords,
  Crown,
  Flame,
  Calendar,
  Trophy,
  Upload,
  Plus,
  Trash2,
  Coins,
} from "lucide-react";
import {
  computeHeadToHeadBetweenClubs,
  type ClubTeamDTO,
  type ContractRosterItemDTO,
  type MasterGoalScorerDTO,
} from "@/lib/master-league-data";
import { submitMasterMatchWithRewardsAction } from "@/app/actions/master-league-actions";
import { ClubCrest } from "@/lib/club-crests";

interface FreguesometroClientProps {
  clubs: ClubTeamDTO[];
  contracts: ContractRosterItemDTO[];
  h2hRecords: {
    teamAId: string;
    teamBId: string;
    winsA: number;
    winsB: number;
    draws: number;
    goalsA: number;
    goalsB: number;
  }[];
  defaultMode?: "freguesometro" | "matches";
}

export function FreguesometroClient({
  clubs,
  contracts,
  h2hRecords,
  defaultMode = "freguesometro",
}: FreguesometroClientProps) {
  const [teamAId, setTeamAId] = useState(clubs[0]?.id ?? "");
  const [teamBId, setTeamBId] = useState(clubs[1]?.id ?? clubs[0]?.id ?? "");

  // Estado da Súmula / Hub de Confrontos (Envio de Resultado + Artilheiros + Bônus)
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [proofUrl, setProofUrl] = useState<string>("");
  const [homeScorers, setHomeScorers] = useState<MasterGoalScorerDTO[]>([]);
  const [awayScorers, setAwayScorers] = useState<MasterGoalScorerDTO[]>([]);
  const [newHomeScorerName, setNewHomeScorerName] = useState<string>("");
  const [newAwayScorerName, setNewAwayScorerName] = useState<string>("");

  const [feedback, setFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (clubs.length === 0) {
    return (
      <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-8 text-center space-y-2">
        <Swords className="w-8 h-8 text-[#ffdc2b] mx-auto" />
        <h2 className="text-base font-bold text-[#f4f6fb]">
          Nenhum clube registrado na temporada ainda
        </h2>
        <p className="text-xs text-[#78849e]">
          Assim que os treinadores criarem suas contas ou se inscreverem nos
          campeonatos, o Freguesômetro e o Hub de Confrontos serão habilitados.
        </p>
      </div>
    );
  }

  const teamA = clubs.find((c) => c.id === teamAId) ?? clubs[0];
  const teamB = clubs.find((c) => c.id === teamBId) ?? clubs[1] ?? clubs[0];

  const h2h = computeHeadToHeadBetweenClubs(teamA, teamB, h2hRecords);

  const teamARoster = contracts.filter((c) => c.clubTeamId === teamA?.id);
  const teamBRoster = contracts.filter((c) => c.clubTeamId === teamB?.id);

  // Cálculo em tempo real da Premiação Financeira por Desempenho em Escudos
  const winReward = 40;
  const drawReward = 15;
  const goalReward = 5;

  const previewHomePrize =
    (homeScore > awayScore
      ? winReward
      : homeScore === awayScore
      ? drawReward
      : 0) +
    homeScore * goalReward;

  const previewAwayPrize =
    (awayScore > homeScore
      ? winReward
      : homeScore === awayScore
      ? drawReward
      : 0) +
    awayScore * goalReward;

  const totalPctBase = Math.max(1, h2h.totalMatches);
  const pctWinsA = Math.round((h2h.winsA / totalPctBase) * 100);
  const pctDraws = Math.round((h2h.draws / totalPctBase) * 100);
  const pctWinsB = Math.max(0, 100 - pctWinsA - pctDraws);

  function handleAddHomeScorer() {
    const name =
      newHomeScorerName || teamARoster[0]?.athleteName || "Artilheiro Mandante";
    setHomeScorers((prev) => [...prev, { athleteName: name, goals: 1 }]);
  }

  function handleAddAwayScorer() {
    const name =
      newAwayScorerName ||
      teamBRoster[0]?.athleteName ||
      "Artilheiro Visitante";
    setAwayScorers((prev) => [...prev, { athleteName: name, goals: 1 }]);
  }

  function handleSubmitMatch(e: React.FormEvent) {
    e.preventDefault();
    if (!teamA || !teamB) return;
    setFeedback(null);
    startTransition(async () => {
      const res = await submitMasterMatchWithRewardsAction({
        homeTeamId: teamA.id,
        awayTeamId: teamB.id,
        homeScore,
        awayScore,
        homeScorers,
        awayScorers,
        proofUrl,
      });
      setFeedback({
        ok: res.ok,
        text: res.ok ? res.message! : res.error!,
      });
    });
  }

  return (
    <div className="space-y-8">
      {/* SEÇÃO 1: COMPARADOR HISTÓRICO DIRETO (FREGUESÔMETRO) */}
      <section className="bg-[#111622] border border-[#222c40] rounded-[4px] p-5 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222c40] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-[2px] bg-[#ffdc2b] text-[#0e1312] text-[11px] font-extrabold uppercase">
                HISTÓRICO OFICIAL DE RIVALIDADES
              </span>
              <span className="text-xs text-[#78849e]">
                Estatísticas acumuladas de confrontos diretos
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#f4f6fb] mt-1 flex items-center gap-2">
              <Swords className="w-5 h-5 text-[#ffdc2b]" />
              <span>Freguesômetro Oficial & Hub de Confrontos</span>
            </h1>
          </div>

          {/* Seletores dos 2 Adversários */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={teamAId}
              onChange={(e) => setTeamAId(e.target.value)}
              className="px-3 py-2 rounded-[4px] bg-[#090c12] border border-[#2c3852] text-xs font-bold text-[#ffdc2b]"
            >
              {clubs.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#111622]">
                  {c.name} ({c.ownerNickname})
                </option>
              ))}
            </select>

            <span className="text-xs font-extrabold text-[#78849e] px-1">
              VS
            </span>

            <select
              value={teamBId}
              onChange={(e) => setTeamBId(e.target.value)}
              className="px-3 py-2 rounded-[4px] bg-[#090c12] border border-[#2c3852] text-xs font-bold text-[#60a5fa]"
            >
              {clubs.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#111622]">
                  {c.name} ({c.ownerNickname})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Painel Central de Dominância */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Card Clube A */}
          <div className="p-4 rounded-[4px] bg-[#0c1018] border border-[#1c2436] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClubCrest clubName={teamA.name} size="lg" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold text-[#f4f6fb]">
                    {teamA.name}
                  </span>
                  {h2h.carrascoClubName === teamA.name && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffdc2b] text-[#0e1312] text-[10px] font-extrabold">
                      <Crown className="w-3 h-3" /> PAI / CARRASCO
                    </span>
                  )}
                  {h2h.freguesClubName === teamA.name && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#dc2626]/25 text-[#f87171] border border-[#dc2626]/40 text-[10px] font-extrabold">
                      FREGUÊS OFICIAL
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#78849e]">
                  Treinador: <strong>{teamA.ownerNickname}</strong>
                </p>
                <div className="text-xs text-[#4ade80] font-bold mt-1">
                  Aproveitamento: {h2h.winRateA}%
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-[#ffdc2b] tabular-nums">
                {h2h.winsA}
              </div>
              <div className="text-[10px] uppercase font-bold text-[#78849e]">
                Vitórias
              </div>
            </div>
          </div>

          {/* Resumo Central & Carimbo de Freguesia */}
          <div className="p-4 rounded-[4px] bg-[#161d2c]/60 border border-[#2c3852] text-center space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-[#ffdc2b]/15 border border-[#ffdc2b]/40 text-[#ffdc2b] text-xs font-extrabold uppercase tracking-wider">
              {h2h.dominanceLabel}
            </span>
            <div className="text-2xl font-extrabold text-[#f4f6fb] tabular-nums">
              {h2h.totalMatches} Jogos Disputados
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-[#b6c0d4]">
              <span>
                Empates: <strong>{h2h.draws}</strong>
              </span>
              <span>•</span>
              <span>
                Gols: <strong>{h2h.goalsA}</strong> ×{" "}
                <strong>{h2h.goalsB}</strong>
              </span>
            </div>
            {h2h.freguesClubName && (
              <p className="text-xs text-[#f87171] font-semibold">
                🔥 Veredito: <strong>{h2h.freguesClubName}</strong> ({h2h.freguesCoachName}) é freguês declarado do{" "}
                <strong>{h2h.carrascoClubName}</strong>!
              </p>
            )}
          </div>

          {/* Card Clube B */}
          <div className="p-4 rounded-[4px] bg-[#0c1018] border border-[#1c2436] flex items-center justify-between">
            <div className="text-left">
              <div className="text-3xl font-extrabold text-[#60a5fa] tabular-nums">
                {h2h.winsB}
              </div>
              <div className="text-[10px] uppercase font-bold text-[#78849e]">
                Vitórias
              </div>
            </div>
            <div className="flex items-center gap-3 text-right">
              <div>
                <div className="flex items-center justify-end gap-1.5">
                  {h2h.carrascoClubName === teamB.name && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffdc2b] text-[#0e1312] text-[10px] font-extrabold">
                      <Crown className="w-3 h-3" /> PAI / CARRASCO
                    </span>
                  )}
                  {h2h.freguesClubName === teamB.name && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#dc2626]/25 text-[#f87171] border border-[#dc2626]/40 text-[10px] font-extrabold">
                      FREGUÊS OFICIAL
                    </span>
                  )}
                  <span className="text-base font-extrabold text-[#f4f6fb]">
                    {teamB.name}
                  </span>
                </div>
                <p className="text-xs text-[#78849e]">
                  Treinador: <strong>{teamB.ownerNickname}</strong>
                </p>
                <div className="text-xs text-[#60a5fa] font-bold mt-1">
                  Aproveitamento: {h2h.winRateB}%
                </div>
              </div>
              <ClubCrest clubName={teamB.name} size="lg" />
            </div>
          </div>
        </div>

        {/* Gráfico de Barra de Retrospecto Direto */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#ffdc2b]">
              {teamA.name}: {pctWinsA}% ({h2h.winsA}V)
            </span>
            <span className="text-[#9aa5b8]">
              Empates: {pctDraws}% ({h2h.draws}E)
            </span>
            <span className="text-[#60a5fa]">
              {teamB.name}: {pctWinsB}% ({h2h.winsB}V)
            </span>
          </div>
          <div className="w-full h-4 rounded-[4px] overflow-hidden flex bg-[#090c12] border border-[#222c40]">
            <div
              style={{ width: `${pctWinsA}%` }}
              className="bg-[#ffdc2b] h-full transition-all duration-300"
            />
            <div
              style={{ width: `${pctDraws}%` }}
              className="bg-[#475569] h-full transition-all duration-300"
            />
            <div
              style={{ width: `${pctWinsB}%` }}
              className="bg-[#3b82f6] h-full transition-all duration-300"
            />
          </div>
        </div>

        {/* Lista dos Últimos Placares entre os Adversários */}
        <div className="space-y-2.5 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#78849e]">
            Histórico Recente de Placares Diretos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {h2h.recentMatches.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-[4px] bg-[#0c1018] border border-[#1c2436] space-y-2"
              >
                <div className="flex items-center justify-between text-[10px] text-[#78849e]">
                  <span>{m.competition}</span>
                  <span>{m.date}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-xs text-[#f4f6fb]">
                  <div className="flex items-center gap-1.5">
                    <ClubCrest clubName={m.homeClubName} size="sm" />
                    <span>{m.homeClubName}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-[4px] bg-[#161d2c] text-[#ffdc2b] font-extrabold tabular-nums">
                    {m.homeScore} × {m.awayScore}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span>{m.awayClubName}</span>
                    <ClubCrest clubName={m.awayClubName} size="sm" />
                  </div>
                </div>
                <p className="text-[11px] text-[#78849e] truncate">
                  ⚽ {m.scorersSummary}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: SÚMULA OFICIAL, AGENDAMENTO E PREMIAÇÃO POR DESEMPENHO */}
      <section
        id="match-submission"
        className="bg-[#111622] border border-[#222c40] rounded-[4px] p-5 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222c40] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#f4f6fb] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#ffdc2b]" />
              <span>
                Registrar Resultado, Artilharia & Distribuir Bônus Financeiro
              </span>
            </h2>
            <p className="text-xs text-[#78849e] mt-0.5">
              Regras de Caixa da Liga: Vitória{" "}
              <strong className="text-[#4ade80]">+40 Escudos</strong> • Empate{" "}
              <strong className="text-[#ffdc2b]">+15 Escudos</strong> • Bônus por
              Gol Marcado <strong className="text-[#60a5fa]">+5 Escudos/gol</strong>
            </p>
          </div>
          {defaultMode === "matches" && (
            <span className="px-2.5 py-1 rounded-[4px] bg-[#15a34a]/15 text-[#4ade80] border border-[#15a34a]/30 text-xs font-bold">
              Crédito Automático de Escudos no Caixa
            </span>
          )}
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-[4px] border text-xs font-semibold ${
              feedback.ok
                ? "bg-[#15a34a]/15 border-[#15a34a]/40 text-[#4ade80]"
                : "bg-[#dc2626]/15 border-[#dc2626]/40 text-[#f87171]"
            }`}
          >
            {feedback.text}
          </div>
        )}

        <form onSubmit={handleSubmitMatch} className="space-y-5">
          {/* Placar, Data Agendada e Comprovante */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-[4px] bg-[#0c1018] border border-[#1c2436]">
              <label className="block text-[11px] font-bold uppercase text-[#78849e] mb-1.5">
                Gols Mandante ({teamA.name})
              </label>
              <input
                type="number"
                min={0}
                max={20}
                value={homeScore}
                onChange={(e) => setHomeScore(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-[4px] bg-[#111622] border border-[#2c3852] text-lg font-extrabold text-[#ffdc2b] tabular-nums"
              />
              <div className="mt-2 text-[11px] text-[#4ade80] font-semibold flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" />
                <span>
                  Prêmio Previsto: +{previewHomePrize} Escudos
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-[4px] bg-[#0c1018] border border-[#1c2436]">
              <label className="block text-[11px] font-bold uppercase text-[#78849e] mb-1.5">
                Gols Visitante ({teamB.name})
              </label>
              <input
                type="number"
                min={0}
                max={20}
                value={awayScore}
                onChange={(e) => setAwayScore(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-[4px] bg-[#111622] border border-[#2c3852] text-lg font-extrabold text-[#60a5fa] tabular-nums"
              />
              <div className="mt-2 text-[11px] text-[#4ade80] font-semibold flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" />
                <span>
                  Prêmio Previsto: +{previewAwayPrize} Escudos
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-[4px] bg-[#0c1018] border border-[#1c2436]">
              <label className="block text-[11px] font-bold uppercase text-[#78849e] mb-1.5">
                <Calendar className="w-3 h-3 inline mr-1" />
                Agendamento da Partida
              </label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 rounded-[4px] bg-[#111622] border border-[#2c3852] text-xs text-[#f4f6fb]"
              />
            </div>

            <div className="p-3.5 rounded-[4px] bg-[#0c1018] border border-[#1c2436]">
              <label className="block text-[11px] font-bold uppercase text-[#78849e] mb-1.5">
                <Upload className="w-3 h-3 inline mr-1" />
                Comprovante / Print da Partida
              </label>
              <input
                type="url"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-[4px] bg-[#111622] border border-[#2c3852] text-xs text-[#f4f6fb]"
              />
            </div>
          </div>

          {/* Registro de Artilheiros da Súmula */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Artilheiros Mandante */}
            <div className="p-4 rounded-[4px] bg-[#0c1018] border border-[#1c2436] space-y-3">
              <div className="text-xs font-bold text-[#ffdc2b] uppercase">
                ⚽ Artilheiros — {teamA.name}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={newHomeScorerName}
                  onChange={(e) => setNewHomeScorerName(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded-[4px] bg-[#111622] border border-[#2c3852] text-xs text-[#f4f6fb]"
                >
                  {teamARoster.map((r) => (
                    <option
                      key={r.id}
                      value={r.athleteName}
                      className="bg-[#111622]"
                    >
                      {r.athleteName} (OVR {r.overall})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddHomeScorer}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] bg-[#161d2c] hover:bg-[#1e273b] border border-[#2c3852] text-xs font-bold text-[#ffdc2b] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Gol
                </button>
              </div>
              <div className="space-y-1.5">
                {homeScorers.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-[4px] bg-[#111622] text-xs"
                  >
                    <span className="font-semibold text-[#f4f6fb]">
                      {s.athleteName} ({s.goals} gol)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setHomeScorers((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      className="text-[#f87171] hover:opacity-80 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Artilheiros Visitante */}
            <div className="p-4 rounded-[4px] bg-[#0c1018] border border-[#1c2436] space-y-3">
              <div className="text-xs font-bold text-[#60a5fa] uppercase">
                ⚽ Artilheiros — {teamB.name}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={newAwayScorerName}
                  onChange={(e) => setNewAwayScorerName(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded-[4px] bg-[#111622] border border-[#2c3852] text-xs text-[#f4f6fb]"
                >
                  {teamBRoster.map((r) => (
                    <option
                      key={r.id}
                      value={r.athleteName}
                      className="bg-[#111622]"
                    >
                      {r.athleteName} (OVR {r.overall})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddAwayScorer}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] bg-[#161d2c] hover:bg-[#1e273b] border border-[#2c3852] text-xs font-bold text-[#60a5fa] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Gol
                </button>
              </div>
              <div className="space-y-1.5">
                {awayScorers.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-[4px] bg-[#111622] text-xs"
                  >
                    <span className="font-semibold text-[#f4f6fb]">
                      {s.athleteName} ({s.goals} gol)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setAwayScorers((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      className="text-[#f87171] hover:opacity-80 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-extrabold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Flame className="w-4 h-4" />
              <span>
                Homologar Súmula, Creditar Premiações & Atualizar Freguesômetro
              </span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
