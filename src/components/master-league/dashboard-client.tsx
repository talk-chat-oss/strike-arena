"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Wallet,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Gavel,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  ShieldAlert,
  Sparkles,
  Shield,
} from "lucide-react";
import type {
  ClubTeamDTO,
  ContractRosterItemDTO,
  FinancialTransactionDTO,
} from "@/lib/master-league-data";
import { formatEscudos } from "@/lib/master-league-data";
import {
  updateContractSalaryAction,
  listAthleteOnAuctionAction,
  processSeasonPayrollAction,
} from "@/app/actions/master-league-actions";
import { ClubCrest } from "@/lib/club-crests";

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
  const [selectedClubId, setSelectedClubId] = useState(
    initialClubId || clubs[0]?.id || ""
  );
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
    <div className="space-y-6">
      {/* Top Bar: Seletor de Clube (Simulador de Treinador) + Ações Financeiras em Escudos */}
      <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <ClubCrest clubName={activeClub.name} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-[#ffdc2b] text-[#0e1312]">
                MEU CLUBE • MASTER LIGA
              </span>
              <span className="text-xs text-[#78849e]">
                Treinador:{" "}
                <strong className="text-[#f4f6fb]">
                  {activeClub.ownerNickname}
                </strong>
              </span>
              {activeClub.isDelinquent ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#dc2626]/20 text-[#f87171] border border-[#dc2626]/40">
                  <AlertTriangle className="w-3 h-3" />
                  CLUBE INADIMPLENTE (PUNIÇÃO ATIVA)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#15a34a]/20 text-[#4ade80] border border-[#15a34a]/30">
                  <CheckCircle2 className="w-3 h-3" />
                  FAIR PLAY FINANCEIRO REGULAR
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#f4f6fb] mt-1">
              {activeClub.name}{" "}
              <span className="text-sm font-normal text-[#78849e]">
                ({activeClub.acronym})
              </span>
            </h1>
          </div>
        </div>

        {/* Seletor rápido de Clube + Botões de Ação */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-[#090c12] border border-[#222c40] rounded-[4px] px-2.5 py-1.5">
            <span className="text-[11px] text-[#78849e] uppercase font-semibold">
              Visão do Clube:
            </span>
            <select
              value={selectedClubId}
              onChange={(e) => {
                setSelectedClubId(e.target.value);
                setFeedback(null);
              }}
              className="bg-transparent text-xs font-bold text-[#ffdc2b] focus:outline-none cursor-pointer"
            >
              {clubs.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#111622]">
                  {c.name} ({c.ownerNickname})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={handleRunSeasonPayroll}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[4px] bg-[#161d2c] hover:bg-[#1e273b] border border-[#2c3852] text-xs font-semibold text-[#f4f6fb] transition-colors cursor-pointer disabled:opacity-50"
          >
            <Banknote className="w-3.5 h-3.5 text-[#ffdc2b]" />
            <span>Debitar Folha Salarial</span>
          </button>

          <Link
            href="/store/escudos"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[4px] bg-[#15a34a]/20 hover:bg-[#15a34a]/30 border border-[#15a34a]/40 text-[#4ade80] text-xs font-bold transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>+ Recarregar Escudos</span>
          </Link>

          <Link
            href="/auctions"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] text-xs font-bold transition-colors"
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>Central de Leilões</span>
          </Link>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-[4px] border text-xs font-semibold flex items-center justify-between ${
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

      {/* 3 KPI Financial Cards in Escudos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-4">
          <div className="flex items-center justify-between text-xs text-[#78849e]">
            <span className="uppercase tracking-wider font-semibold">
              1. Saldo Disponível (Moeda Oficial)
            </span>
            <Wallet className="w-4 h-4 text-[#4ade80]" />
          </div>
          <div
            className={`text-2xl font-bold mt-2 tabular-nums ${
              activeClub.balance < 0 ? "text-[#f87171]" : "text-[#4ade80]"
            }`}
          >
            {formatEscudos(activeClub.balance)}
          </div>
          <p className="text-[11px] text-[#78849e] mt-1">
            Livre para Lances em Leilões (5 em 5 Escudos) e Multas Rescisórias
          </p>
        </div>

        <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-4">
          <div className="flex items-center justify-between text-xs text-[#78849e]">
            <span className="uppercase tracking-wider font-semibold">
              2. Folha Salarial Total / Ciclo
            </span>
            <Users className="w-4 h-4 text-[#ffdc2b]" />
          </div>
          <div className="text-2xl font-bold text-[#ffdc2b] mt-2 tabular-nums">
            {formatEscudos(payrollTotal)}
          </div>
          <p className="text-[11px] text-[#78849e] mt-1">
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

        <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-4">
          <div className="flex items-center justify-between text-xs text-[#78849e]">
            <span className="uppercase tracking-wider font-semibold">
              3. Valor Estimado do Elenco
            </span>
            <TrendingUp className="w-4 h-4 text-[#60a5fa]" />
          </div>
          <div className="text-2xl font-bold text-[#f4f6fb] mt-2 tabular-nums">
            {formatEscudos(squadEstimatedValue)}
          </div>
          <p className="text-[11px] text-[#78849e] mt-1">
            Soma de todas as Multas Rescisórias (10× Salário em Escudos)
          </p>
        </div>
      </div>

      {/* Main Grid: Tabela do Elenco (2/3) + Fluxo de Caixa (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabela do Elenco */}
        <div className="lg:col-span-2 bg-[#111622] border border-[#222c40] rounded-[4px] overflow-hidden">
          <div className="p-4 border-b border-[#222c40] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#f4f6fb] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ffdc2b]" />
                <span>Elenco do Clube & Gestão de Salários / Multas</span>
              </h2>
              <p className="text-xs text-[#78849e] mt-0.5">
                Ajuste o salário em Escudos para blindar seu craque contra
                transferência por multa rescisória (Multa = 10× Salário).
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-[4px] bg-[#161d2c] text-[#b6c0d4] border border-[#222c40]">
              {clubRoster.length} Atletas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#222c40] bg-[#0c1018] text-[11px] font-bold uppercase text-[#78849e]">
                  <th className="py-3 px-4">Jogador</th>
                  <th className="py-3 px-3 text-center">Posição</th>
                  <th className="py-3 px-3 text-center">Overall</th>
                  <th className="py-3 px-3 text-right">Salário (Escudos)</th>
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
                              {item.ballType === "BOLA_PRETA" && (
                                <span
                                  title="Craque Bola Preta"
                                  className="w-2.5 h-2.5 rounded-full bg-black border border-[#ffdc2b] inline-block"
                                />
                              )}
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
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingContractId(item.id);
                                setAuctionContractId(null);
                                setSalaryInput(item.salary);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#161d2c] hover:bg-[#1e273b] border border-[#2c3852] text-[11px] font-medium text-[#f4f6fb] transition-colors cursor-pointer"
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
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#133865]/50 hover:bg-[#133865] border border-[#1c4d8a] text-[11px] font-medium text-[#f4f6fb] transition-colors cursor-pointer"
                            >
                              <Gavel className="w-3 h-3 text-[#60a5fa]" />
                              <span>Leiloar</span>
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

        {/* Extrato Financeiro em Escudos */}
        <div className="bg-[#111622] border border-[#222c40] rounded-[4px] flex flex-col">
          <div className="p-4 border-b border-[#222c40] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#f4f6fb]">
                Extrato de Escudos do Clube
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
                Nenhuma movimentação de Escudos registrada para este clube.
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
                          {tx.type.replace(/_/g, " ")}
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
