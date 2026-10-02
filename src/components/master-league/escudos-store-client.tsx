"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Shield,
  Sparkles,
  CheckCircle2,
  QrCode,
  CreditCard,
  ArrowUpRight,
  Gavel,
  Wallet,
  History,
  Lock,
} from "lucide-react";
import type {
  ClubTeamDTO,
  EscudoPackageDTO,
  EscudoPurchaseDTO,
} from "@/lib/master-league-data";
import { formatEscudos, formatBrlFromCents } from "@/lib/master-league-data";
import { purchaseEscudosPackageAction } from "@/app/actions/master-league-actions";
import { ClubCrest } from "@/lib/club-crests";

interface EscudosStoreClientProps {
  clubs: ClubTeamDTO[];
  packages: EscudoPackageDTO[];
  purchases: EscudoPurchaseDTO[];
  initialClubId: string;
}

export function EscudosStoreClient({
  clubs,
  packages,
  purchases,
  initialClubId,
}: EscudosStoreClientProps) {
  const [selectedClubId, setSelectedClubId] = useState(
    initialClubId || clubs[0]?.id || ""
  );
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CARTAO">("PIX");
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeClub =
    clubs.find((c) => c.id === selectedClubId) ?? clubs[0] ?? null;

  function handleBuyPackage(pkg: EscudoPackageDTO) {
    if (!activeClub) return;
    setFeedback(null);
    startTransition(async () => {
      const res = await purchaseEscudosPackageAction({
        clubTeamId: activeClub.id,
        packageId: pkg.id,
        paymentMethod,
      });
      setFeedback({
        ok: res.ok,
        text: res.ok ? res.message! : res.error!,
      });
    });
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner da Loja de Escudos */}
      <div className="bg-gradient-to-r from-[#111622] via-[#132038] to-[#111622] border border-[#ffdc2b]/40 rounded-[4px] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[2px] bg-[#ffdc2b] text-[#0e1312] text-[11px] font-extrabold uppercase">
            <Shield className="w-3.5 h-3.5" />
            <span>MOEDA OFICIAL FECHADA DA LIGA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f4f6fb]">
            Loja Oficial de Escudos • Strike Arena
          </h1>
          <p className="text-xs sm:text-sm text-[#b6c0d4] leading-relaxed">
            Os <strong className="text-[#ffdc2b]">Escudos</strong> são a moeda
            exclusiva utilizada pelos clubes para disputar{" "}
            <strong>Leilões de Craques Bola Preta</strong>, pagar{" "}
            <strong>Multas Rescisórias à vista</strong> e quitar a{" "}
            <strong>Folha Salarial</strong> da temporada.
          </p>
        </div>

        {/* Carteira do Clube Selecionado */}
        {activeClub && (
          <div className="bg-[#090c12] border border-[#2c3852] rounded-[4px] p-4 min-w-[290px] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-[#78849e]">
                Carteira do Clube Destino
              </span>
              <Wallet className="w-4 h-4 text-[#ffdc2b]" />
            </div>

            <div className="flex items-center gap-2.5">
              <ClubCrest clubName={activeClub.name} size="md" />
              <select
                value={selectedClubId}
                onChange={(e) => {
                  setSelectedClubId(e.target.value);
                  setFeedback(null);
                }}
                className="w-full bg-[#111622] border border-[#222c40] rounded-[4px] px-2.5 py-1.5 text-xs font-bold text-[#f4f6fb] focus:border-[#ffdc2b] focus:outline-none cursor-pointer"
              >
                {clubs.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#111622]">
                    {c.name} ({c.ownerNickname})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-[#1c2436] flex items-center justify-between">
              <span className="text-xs text-[#9aa5b8]">Saldo Atual:</span>
              <span className="text-lg font-extrabold text-[#4ade80] tabular-nums">
                {formatEscudos(activeClub.balance)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Feedback de Confirmação de Pagamento */}
      {feedback && (
        <div
          className={`p-4 rounded-[4px] border text-xs sm:text-sm font-bold flex items-center justify-between ${
            feedback.ok
              ? "bg-[#15a34a]/15 border-[#15a34a]/50 text-[#4ade80]"
              : "bg-[#dc2626]/15 border-[#dc2626]/50 text-[#f87171]"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback.text}</span>
          </div>
          <Link
            href="/auctions"
            className="px-3 py-1.5 rounded-[4px] bg-[#ffdc2b] text-[#0e1312] text-xs font-extrabold whitespace-nowrap ml-4"
          >
            Usar nos Leilões →
          </Link>
        </div>
      )}

      {/* Seletor de Método de Pagamento */}
      <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#b6c0d4]">
          <Lock className="w-4 h-4 text-[#4ade80]" />
          <span>
            Liberação automática e instantânea após confirmação do pagamento:
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPaymentMethod("PIX")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-[4px] text-xs font-bold cursor-pointer transition-colors ${
              paymentMethod === "PIX"
                ? "bg-[#ffdc2b] text-[#0e1312]"
                : "bg-[#090c12] text-[#9aa5b8] border border-[#222c40]"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>PIX Instantâneo</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("CARTAO")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-[4px] text-xs font-bold cursor-pointer transition-colors ${
              paymentMethod === "CARTAO"
                ? "bg-[#ffdc2b] text-[#0e1312]"
                : "bg-[#090c12] text-[#9aa5b8] border border-[#222c40]"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Cartão de Crédito</span>
          </button>
        </div>
      </div>

      {/* 3 Cards de Pacotes Promocionais de Escudos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const unitPriceBrl = (
            pkg.priceBrlCents /
            100 /
            pkg.escudosAmount
          ).toFixed(2);

          return (
            <div
              key={pkg.id}
              className={`relative rounded-[4px] p-6 flex flex-col justify-between transition-all ${
                pkg.isFeatured
                  ? "bg-gradient-to-b from-[#1a243b] to-[#111622] border-2 border-[#ffdc2b] shadow-[0_0_25px_rgba(255,220,43,0.12)]"
                  : "bg-[#111622] border border-[#222c40]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-[2px] text-[10px] font-extrabold uppercase ${
                      pkg.isFeatured
                        ? "bg-[#ffdc2b] text-[#0e1312]"
                        : "bg-[#161d2c] text-[#60a5fa] border border-[#222c40]"
                    }`}
                  >
                    {pkg.badgeLabel || "PACOTE OFICIAL"}
                  </span>
                  <Shield className="w-5 h-5 text-[#ffdc2b]" />
                </div>

                <h2 className="text-lg font-bold text-[#f4f6fb] mt-4">
                  {pkg.name}
                </h2>

                {/* Quantidade de Escudos */}
                <div className="mt-3 p-4 rounded-[4px] bg-[#090c12] border border-[#1c2436] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#78849e]">
                      Crédito Imediato
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#ffdc2b] tabular-nums mt-0.5">
                      +{pkg.escudosAmount}{" "}
                      <span className="text-sm font-bold">Escudos</span>
                    </div>
                  </div>
                  <Sparkles className="w-6 h-6 text-[#ffdc2b]" />
                </div>

                {/* Preço em Reais (R$) */}
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-[#78849e] block">
                      Valor do Pacote:
                    </span>
                    <span className="text-2xl font-extrabold text-[#4ade80] tabular-nums">
                      {formatBrlFromCents(pkg.priceBrlCents)}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#9aa5b8] tabular-nums">
                    R$ {unitPriceBrl} / Escudo
                  </span>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-[#b6c0d4] border-t border-[#1c2436] pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80] shrink-0" />
                    <span>
                      Disponível na hora para lances em leilões (5 em 5 Escudos)
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80] shrink-0" />
                    <span>
                      Válido para pagamento de Multas Rescisórias e Salários
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80] shrink-0" />
                    <span>
                      Comprovante auditável no Fluxo de Caixa do clube
                    </span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={() => handleBuyPackage(pkg)}
                className={`mt-6 w-full py-3 px-4 rounded-[4px] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 ${
                  pkg.isFeatured
                    ? "bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312]"
                    : "bg-[#161d2c] hover:bg-[#ffdc2b] text-[#f4f6fb] hover:text-[#0e1312] border border-[#2c3852]"
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>
                  Comprar {pkg.escudosAmount} Escudos por{" "}
                  {formatBrlFromCents(pkg.priceBrlCents)}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Log Transacional Auditável de Compras de Escudos */}
      <div className="bg-[#111622] border border-[#222c40] rounded-[4px] overflow-hidden">
        <div className="p-4 border-b border-[#222c40] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#ffdc2b]" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#f4f6fb]">
                Histórico Auditável de Recargas de Escudos
              </h2>
              <p className="text-xs text-[#78849e]">
                Registro transparente de todas as confirmações de pacotes na
                liga
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#ffdc2b] hover:underline"
          >
            <span>Ver Extrato do Clube</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222c40] bg-[#0c1018] text-[11px] font-bold uppercase text-[#78849e]">
                <th className="py-3 px-4">Clube Beneficiário</th>
                <th className="py-3 px-3">Pacote Adquirido</th>
                <th className="py-3 px-3 text-center">Método</th>
                <th className="py-3 px-3 text-right">Valor Pago (R$)</th>
                <th className="py-3 px-3 text-right">Escudos Creditados</th>
                <th className="py-3 px-4 text-right">Referência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2436] text-xs">
              {purchases.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-[#78849e] text-xs"
                  >
                    Selecione um dos pacotes acima para testar a confirmação
                    instantânea de Escudos.
                  </td>
                </tr>
              ) : (
                purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-[#161d2c]/60">
                    <td className="py-3 px-4 font-bold text-[#f4f6fb]">
                      <div className="flex items-center gap-2">
                        <ClubCrest clubName={p.clubName} size="sm" />
                        <span>{p.clubName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#b6c0d4]">
                      {p.packageName}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-[2px] bg-[#161d2c] text-[#60a5fa] font-bold text-[10px]">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-[#f4f6fb] tabular-nums">
                      {formatBrlFromCents(p.amountPaidBrlCents)}
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-[#4ade80] tabular-nums">
                      +{formatEscudos(p.escudosCredited)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-[#78849e]">
                      {p.externalReference || "CONFIRMADO"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
