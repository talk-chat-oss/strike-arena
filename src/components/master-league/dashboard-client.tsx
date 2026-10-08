"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Wallet,
  Users,
  TrendingUp,
  AlertTriangle,
  Gavel,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  ShieldAlert,
  Sparkles,
  Shield,
  Loader2,
} from "lucide-react";
import type {
  ClubTeamDTO,
  ContractRosterItemDTO,
  FinancialTransactionDTO,
} from "@/lib/master-league-data";
import {
  formatEscudos,
  getBallCategoryFromOverall,
  getBallCategoryMeta,
} from "@/lib/master-league-data";
import {
  updateContractSalaryAction,
  listAthleteOnAuctionAction,
  processSeasonPayrollAction,
} from "@/app/actions/master-league-actions";
import { ClubCrest } from "@/lib/club-crests";
import { CrestSwitcherModal } from "@/components/master-league/crest-switcher-modal";
import { TacticalPitchBuilder } from "@/components/master-league/tactical-pitch-builder";

interface DashboardClientProps {
  clubs: ClubTeamDTO[];
  contracts: ContractRosterItemDTO[];
  transactions: FinancialTransactionDTO[];
  initialClubId: string;
}

export function DashboardClient({
  clubs,
  contracts,
  transactions,
  initialClubId,
}: DashboardClientProps) {
  const [selectedClubId] = useState(initialClubId || clubs[0]?.id || "");
  const [editingContractId, setEditingContractId] = useState<string | null>(
    null
  );
  const [salaryInput, setSalaryInput] = useState<number>(35);
  const [auctionContractId, setAuctionContractId] = useState<string | null>(
    null
  );
  const [startingBidInput, setStartingBidInput] = useState<number>(100);
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeClub =
    clubs.find((c) => c.id === selectedClubId) ?? clubs[0] ?? null;

  const clubRoster = contracts
    .filter((c) => c.clubTeamId === activeClub?.id)
    .sort((a, b) => b.overall - a.overall);

  const clubTransactions = transactions.filter(
    (t) => t.clubTeamId === activeClub?.id
  );

  const payrollTotal = clubRoster.reduce((acc, r) => acc + r.salary, 0);
  const squadEstimatedValue = clubRoster.reduce(
    (acc, r) => acc + r.buyoutClause,
    0
  );

  function handleSaveSalary(contractId: string) {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateContractSalaryAction({
        contractId,
        newSalary: salaryInput,
      });
      setFeedback({
        ok: res.ok,
        text: res.ok ? res.message! : res.error!,
      });
      if (res.ok) setEditingContractId(null);
    });
  }

  function handleListOnAuction(contractId: string) {
    setFeedback(null);
    startTransition(async () => {
      const res = await listAthleteOnAuctionAction({
        contractId,
        startingBid: startingBidInput,
        durationMinutes: 45,
      });
      setFeedback({
        ok: res.ok,
        text: res.ok ? res.message! : res.error!,
      });
      if (res.ok) setAuctionContractId(null);
    });
  }

  function handleRunSeasonPayroll() {
    if (!activeClub) return;
    setFeedback(null);
    startTransition(async () => {
      const res = await processSeasonPayrollAction({
        clubTeamId: activeClub.id,
      });
      setFeedback({
        ok: res.ok,
        text: res.ok ? res.message! : res.error!,
      });
    });
  }

  if (!activeClub) {
    return (
      <div className="p-8 text-center text-[#9aa5b8]">
        Nenhum clube cadastrado na Master Liga.
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Bar: Clube + Treinador + Ações */}
      <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-3.5 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0">
            <ClubCrest clubName={activeClub.name} size="lg" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-extrabold text-[#f4f6fb] leading-tight truncate">
                {activeClub.name}{" "}
                <span className="text-xs sm:text-sm font-bold text-[#78849e]">
                  ({activeClub.acronym})
                </span>
              </h1>
              {activeClub.hasActiveLeaguePass ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-extrabold uppercase bg-[#15a34a]/20 text-[#4ade80] border border-[#15a34a]/40">
                  Passe Ativo ·{" "}
                  {activeClub.leaguePassExpiresAt
                    ? new Date(
                        activeClub.leaguePassExpiresAt
                      ).toLocaleDateString("pt-BR")
                    : "Vitalício"}
                </span>
              ) : (
                <Link
                  href="/store/strike-coins"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-extrabold uppercase bg-[#ffdc2b]/15 text-[#ffdc2b] border border-[#ffdc2b]/40 hover:bg-[#ffdc2b]/25 transition-colors"
                >
                  Ativar Passe de Liga →
                </Link>
              )}
              {activeClub.isDelinquent && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#dc2626]/20 text-[#f87171] border border-[#dc2626]/40">
                  <AlertTriangle className="w-3 h-3" />
                  INADIMPLENTE
                </span>
              )}
            </div>
            <p className="text-xs text-[#9aa5b8] mt-0.5">
              Treinador:{" "}
              <strong className="text-[#f4f6fb]">
                {activeClub.ownerNickname}
              </strong>
            </p>
          </div>
        </div>

        {/* Botões de Ação Compactos em 2x2 no Mobile */}
        <div className="grid grid-cols-2 xl:flex xl:items-center gap-2 w-full xl:w-auto shrink-0">
          <CrestSwitcherModal
            activeAccount={activeClub}
            allAccounts={clubs}
            onSuccessMessage={setFeedback}
            buttonClassName="w-full xl:w-auto h-10 sm:h-11 px-3 sm:px-4 rounded-[4px] bg-[#133865] hover:bg-[#1c4d8a] border border-[#ffdc2b]/50 text-[11px] sm:text-xs font-extrabold text-[#f4f6fb] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          />

          <button
            type="button"
            disabled={isPending}
            onClick={handleRunSeasonPayroll}
            className="w-full xl:w-auto h-10 sm:h-11 px-3 sm:px-4 rounded-[4px] bg-[#161d2c] hover:bg-[#1e273b] border border-[#2c3852] text-[11px] sm:text-xs font-extrabold text-[#f4f6fb] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ffdc2b] shrink-0" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <Banknote className="w-3.5 h-3.5 text-[#ffdc2b] shrink-0" />
                <span>Debitar Folha</span>
              </>
            )}
          </button>

          <Link
            href="/store/strike-coins"
            className="w-full xl:w-auto h-10 sm:h-11 px-3 sm:px-4 rounded-[4px] bg-[#15a34a]/20 hover:bg-[#15a34a]/30 border border-[#15a34a]/40 text-[#4ade80] text-[11px] sm:text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span>+ Striker Coins</span>
          </Link>

          <Link
            href="/auctions"
            className="w-full xl:w-auto h-10 sm:h-11 px-3 sm:px-4 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] text-[11px] sm:text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Gavel className="w-3.5 h-3.5 shrink-0" />
            <span>Central Leilões</span>
          </Link>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-[4px] border text-xs font-semibold flex items-center justify-between ${
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

      {/* 3 KPI Financial Cards in Striker Coins (Compact 3-col on Mobile too) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-2.5 sm:p-4">
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-[#78849e]">
            <span className="uppercase tracking-wider font-semibold truncate">
              Saldo
            </span>
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4ade80] shrink-0" />
          </div>
          <div
            className={`text-sm sm:text-2xl font-extrabold mt-1 sm:mt-2 tabular-nums truncate ${
              activeClub.balance < 0 ? "text-[#f87171]" : "text-[#4ade80]"
            }`}
          >
            {formatEscudos(activeClub.balance, false)}
            <span className="hidden sm:inline text-xs font-bold ml-1">
              Striker Coins
            </span>
          </div>
          <p className="hidden sm:block text-[11px] text-[#78849e] mt-1">
            Disponível para leilões, multas e folha salarial
          </p>
        </div>

        <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-2.5 sm:p-4">
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-[#78849e]">
            <span className="uppercase tracking-wider font-semibold truncate">
              Folha ({clubRoster.length})
            </span>
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ffdc2b] shrink-0" />
          </div>
          <div className="text-sm sm:text-2xl font-extrabold text-[#ffdc2b] mt-1 sm:mt-2 tabular-nums truncate">
            {formatEscudos(payrollTotal, false)}
            <span className="hidden sm:inline text-xs font-bold ml-1">
              Striker Coins
            </span>
          </div>
          <p className="hidden sm:block text-[11px] text-[#78849e] mt-1">
            {clubRoster.length} atletas • Saldo pós-folha:{" "}
            <strong
              className={
                activeClub.balance - payrollTotal < 0
                  ? "text-[#f87171]"
                  : "text-[#f4f6fb]"
              }
            >
              {formatEscudos(activeClub.balance - payrollTotal)}
            </strong>
          </p>
        </div>

        <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-2.5 sm:p-4">
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-[#78849e]">
            <span className="uppercase tracking-wider font-semibold truncate">
              Valor Elenco
            </span>
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#60a5fa] shrink-0" />
          </div>
          <div className="text-sm sm:text-2xl font-extrabold text-[#f4f6fb] mt-1 sm:mt-2 tabular-nums truncate">
            {formatEscudos(squadEstimatedValue, false)}
            <span className="hidden sm:inline text-xs font-bold ml-1">
              Striker Coins
            </span>
          </div>
          <p className="hidden sm:block text-[11px] text-[#78849e] mt-1">
            Soma de todas as Multas Rescisórias (10× Salário)
          </p>
        </div>
      </div>

      {/* CAMPINHO VIRTUAL DE ESCALAÇÃO TÁTICA */}
      <TacticalPitchBuilder
        club={activeClub}
        roster={clubRoster}
        onSavedFeedback={setFeedback}
      />

      {/* Main Grid: Tabela do Elenco (2/3) + Fluxo de Caixa (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabela do Elenco */}
        <div className="lg:col-span-2 bg-[#111622] border border-[#222c40] rounded-[4px] overflow-hidden">
          <div className="p-3.5 sm:p-4 border-b border-[#222c40] flex items-center justify-between gap-2">
            <div>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#f4f6fb] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ffdc2b] shrink-0" />
                <span>Elenco do Clube & Gestão de Salários / Multas</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-[#78849e] mt-0.5">
                Ajuste o salário para blindar seu craque contra multa rescisória
                (Multa = 10× Salário).
              </p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-[4px] bg-[#161d2c] text-[#b6c0d4] border border-[#222c40] shrink-0">
              {clubRoster.length} Atletas
            </span>
          </div>

          {/* Mobile Condensed List (Sem rolagem horizontal) */}
          <div className="md:hidden divide-y divide-[#1c2436]">
            {clubRoster.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#78849e]">
                Nenhum atleta contratado ainda. Visite o Mercado para montar seu
                time!
              </div>
            ) : (
              clubRoster.map((item) => {
                const isEditing = editingContractId === item.id;
                const isListing = auctionContractId === item.id;

                return (
                  <div key={item.id} className="p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.photoUrl}
                          alt={item.athleteName}
                          className="w-10 h-10 rounded-[5px] bg-gradient-to-b from-[#1e293b] to-[#090c12] border border-[#2c3852] object-contain object-bottom shrink-0 pt-0.5"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold text-[#f4f6fb] truncate flex items-center gap-1.5">
                            <span className="truncate">{item.athleteName}</span>
                            <span className="px-1.5 py-0.2 rounded-[2px] text-[10px] font-bold bg-[#161d2c] text-[#60a5fa] border border-[#222c40] shrink-0">
                              {item.position}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#78849e] flex items-center gap-2 mt-0.5">
                            <span>
                              Sal:{" "}
                              <strong className="text-[#f4f6fb]">
                                {formatEscudos(item.salary, false)}
                              </strong>
                            </span>
                            <span>•</span>
                            <span>
                              Multa:{" "}
                              <strong className="text-[#ffdc2b]">
                                {formatEscudos(item.buyoutClause, false)}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`inline-flex items-center justify-center min-w-[32px] h-7 px-1.5 rounded-[4px] font-extrabold text-xs tabular-nums ${getBallCategoryMeta(getBallCategoryFromOverall(item.overall)).overallBadgeClass}`}
                        >
                          {item.overall}
                        </span>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] text-[#9aa5b8]">
                          Novo Salário:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step={5}
                            min={10}
                            value={salaryInput}
                            onChange={(e) =>
                              setSalaryInput(Number(e.target.value))
                            }
                            className="w-20 px-2 py-1 rounded-[4px] bg-[#090c12] border border-[#ffdc2b] text-xs text-[#f4f6fb] text-right"
                          />
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleSaveSalary(item.id)}
                            className="px-2.5 py-1 rounded-[4px] bg-[#ffdc2b] text-[#0e1312] font-bold text-[11px] cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {isPending && editingContractId === item.id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Salvando...</span>
                              </>
                            ) : (
                              <span>Salvar</span>
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => setEditingContractId(null)}
                            className="px-2 py-1 rounded-[4px] bg-[#1d2639] text-[#9aa5b8] text-[11px] cursor-pointer disabled:opacity-50"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : isListing ? (
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] text-[#9aa5b8]">
                          Lance Inicial:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step={5}
                            min={50}
                            disabled={isPending}
                            value={startingBidInput}
                            onChange={(e) =>
                              setStartingBidInput(Number(e.target.value))
                            }
                            className="w-20 px-2 py-1 rounded-[4px] bg-[#090c12] border border-[#60a5fa] text-xs text-[#f4f6fb] text-right"
                          />
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleListOnAuction(item.id)}
                            className="px-2.5 py-1 rounded-[4px] bg-[#60a5fa] text-[#090c12] font-bold text-[11px] cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {isPending && auctionContractId === item.id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Abrindo...</span>
                              </>
                            ) : (
                              <span>Leiloar</span>
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => setAuctionContractId(null)}
                            className="px-2 py-1 rounded-[4px] bg-[#1d2639] text-[#9aa5b8] text-[11px] cursor-pointer disabled:opacity-50"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingContractId(item.id);
                            setAuctionContractId(null);
                            setSalaryInput(item.salary);
                          }}
                          className="h-8 px-2.5 rounded-[4px] bg-[#161d2c] hover:bg-[#1e273b] border border-[#2c3852] text-[11px] font-bold text-[#f4f6fb] inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <SlidersHorizontal className="w-3 h-3 text-[#ffdc2b]" />
                          <span>Ajustar Salário</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAuctionContractId(item.id);
                            setEditingContractId(null);
                            setStartingBidInput(
                              Math.max(100, Math.round(item.buyoutClause * 0.4))
                            );
                          }}
                          className="h-8 px-2.5 rounded-[4px] bg-[#133865]/50 hover:bg-[#133865] border border-[#1c4d8a] text-[11px] font-bold text-[#f4f6fb] inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Gavel className="w-3 h-3 text-[#60a5fa]" />
                          <span>Leiloar Atleta</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#222c40] bg-[#0c1018] text-[11px] font-bold uppercase text-[#78849e]">
                  <th className="py-3 px-4">Jogador</th>
                  <th className="py-3 px-3 text-center">Posição</th>
                  <th className="py-3 px-3 text-center">Overall</th>
                  <th className="py-3 px-3 text-right">
                    Salário (Striker Coins)
                  </th>
                  <th className="py-3 px-3 text-right">Multa Rescisória</th>
                  <th className="py-3 px-4 text-right">Ações de Gestão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c2436] text-xs">
                {clubRoster.map((item) => {
                  const isEditing = editingContractId === item.id;
                  const isListing = auctionContractId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#161d2c]/60 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.photoUrl}
                            alt={item.athleteName}
                            className="w-11 h-11 rounded-[6px] bg-gradient-to-b from-[#1e293b] to-[#090c12] border border-[#2c3852] object-contain object-bottom shrink-0 pt-0.5"
                          />
                          <div>
                            <div className="font-bold text-[#f4f6fb] flex items-center gap-1.5">
                              <span>{item.athleteName}</span>
                            </div>
                            <div className="text-[11px] text-[#78849e]">
                              {item.age} anos • Origem: {item.defaultTeam}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-[2px] font-bold text-[11px] bg-[#161d2c] text-[#60a5fa] border border-[#222c40]">
                          {item.position}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-7 rounded-[4px] font-extrabold text-xs tabular-nums ${
                            item.overall >= 90
                              ? "bg-[#ffdc2b] text-[#0e1312]"
                              : item.overall >= 85
                              ? "bg-[#15a34a]/25 text-[#4ade80] border border-[#15a34a]/40"
                              : "bg-[#1d2639] text-[#f4f6fb]"
                          }`}
                        >
                          {item.overall}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-semibold text-[#f4f6fb] tabular-nums">
                        {formatEscudos(item.salary)}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span className="font-bold text-[#ffdc2b] tabular-nums">
                          {formatEscudos(item.buyoutClause)}
                        </span>
                        <div className="text-[10px] text-[#78849e]">
                          Proteção 10×
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <input
                              type="number"
                              step={5}
                              min={10}
                              value={salaryInput}
                              onChange={(e) =>
                                setSalaryInput(Number(e.target.value))
                              }
                              className="w-24 px-2 py-1 rounded-[4px] bg-[#090c12] border border-[#ffdc2b] text-xs text-[#f4f6fb] text-right"
                            />
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleSaveSalary(item.id)}
                              className="px-2.5 py-1 rounded-[4px] bg-[#ffdc2b] text-[#0e1312] font-bold text-[11px] cursor-pointer"
                            >
                              Salvar
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingContractId(null)}
                              className="px-2 py-1 rounded-[4px] bg-[#1d2639] text-[#9aa5b8] text-[11px] cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : isListing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <input
                              type="number"
                              step={5}
                              min={50}
                              value={startingBidInput}
                              onChange={(e) =>
                                setStartingBidInput(Number(e.target.value))
                              }
                              className="w-24 px-2 py-1 rounded-[4px] bg-[#090c12] border border-[#60a5fa] text-xs text-[#f4f6fb] text-right"
                            />
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleListOnAuction(item.id)}
                              className="px-2.5 py-1 rounded-[4px] bg-[#60a5fa] text-[#090c12] font-bold text-[11px] cursor-pointer"
                            >
                              Leiloar
                            </button>
                            <button
                              type="button"
                              onClick={() => setAuctionContractId(null)}
                              className="px-2 py-1 rounded-[4px] bg-[#1d2639] text-[#9aa5b8] text-[11px] cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingContractId(item.id);
                                setAuctionContractId(null);
                                setSalaryInput(item.salary);
                              }}
                              className="inline-flex items-center justify-center gap-1.5 min-w-[130px] h-9 px-3 rounded-[4px] bg-[#161d2c] hover:bg-[#1e273b] border border-[#2c3852] text-[11px] font-bold text-[#f4f6fb] transition-colors cursor-pointer"
                            >
                              <SlidersHorizontal className="w-3 h-3 text-[#ffdc2b] shrink-0" />
                              <span>Ajustar Salário</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAuctionContractId(item.id);
                                setEditingContractId(null);
                                setStartingBidInput(
                                  Math.max(
                                    100,
                                    Math.round(item.buyoutClause * 0.4)
                                  )
                                );
                              }}
                              className="inline-flex items-center justify-center gap-1.5 min-w-[130px] h-9 px-3 rounded-[4px] bg-[#133865]/50 hover:bg-[#133865] border border-[#1c4d8a] text-[11px] font-bold text-[#f4f6fb] transition-colors cursor-pointer"
                            >
                              <Gavel className="w-3 h-3 text-[#60a5fa] shrink-0" />
                              <span>Leiloar Atleta</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Extrato Financeiro em Striker Coins */}
        <div className="bg-[#111622] border border-[#222c40] rounded-[4px] flex flex-col">
          <div className="p-4 border-b border-[#222c40] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#f4f6fb]">
                Extrato de Striker Coins do Clube
              </h2>
              <p className="text-xs text-[#78849e] mt-0.5">
                Recargas, Lances (Escrow), Prêmios, Multas e Salários
              </p>
            </div>
            <ShieldAlert className="w-4 h-4 text-[#ffdc2b]" />
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[480px]">
            {clubTransactions.length === 0 ? (
              <div className="text-xs text-[#78849e] py-8 text-center">
                Nenhuma movimentação de Striker Coins registrada para este
                clube.
              </div>
            ) : (
              clubTransactions.map((tx) => {
                const isPositive = tx.amount >= 0;
                return (
                  <div
                    key={tx.id}
                    className="p-3 rounded-[4px] bg-[#0c1018] border border-[#1c2436] flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`p-1.5 rounded-[4px] mt-0.5 ${
                          isPositive
                            ? "bg-[#15a34a]/15 text-[#4ade80]"
                            : "bg-[#dc2626]/15 text-[#f87171]"
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-[2px] bg-[#161d2c] text-[#9aa5b8] mb-1">
                          {tx.type
                            .replace(/_/g, " ")
                            .replace(/ESCUDOS/gi, "STRIKER COINS")}
                        </span>
                        <p className="text-xs text-[#f4f6fb] leading-snug">
                          {tx.description}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`text-xs font-bold whitespace-nowrap tabular-nums ${
                        isPositive ? "text-[#4ade80]" : "text-[#f87171]"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {formatEscudos(tx.amount)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
