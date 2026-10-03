"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Shield,
  Sparkles,
  CheckCircle2,
  CreditCard,
  ArrowUpRight,
  Wallet,
  History,
  Lock,
  ExternalLink,
} from "lucide-react";
import type {
  ClubTeamDTO,
  EscudoPackageDTO,
  EscudoPurchaseDTO,
} from "@/lib/master-league-data";
import { formatEscudos, formatBrlFromCents } from "@/lib/master-league-data";
import { createStripeCheckoutSessionAction } from "@/app/actions/master-league-actions";
import { ClubCrest } from "@/lib/club-crests";
import { CrestSwitcherModal } from "@/components/master-league/crest-switcher-modal";

interface EscudosStoreClientProps {
  clubs: ClubTeamDTO[];
  packages: EscudoPackageDTO[];
  purchases: EscudoPurchaseDTO[];
  initialClubId: string;
  initialFeedback?: {
    ok: boolean;
    text: string;
  } | null;
}

export function EscudosStoreClient({
  clubs,
  packages,
  purchases,
  initialClubId,
  initialFeedback = null,
}: EscudosStoreClientProps) {
  const [selectedClubId] = useState(
    initialClubId || clubs[0]?.id || ""
  );
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(initialFeedback);
  const [loadingPkgId, setLoadingPkgId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeClub =
    clubs.find((c) => c.id === selectedClubId) ?? clubs[0] ?? null;

  function handleBuyPackageWithStripe(pkg: EscudoPackageDTO) {
    if (!activeClub) return;
    setFeedback(null);
    setLoadingPkgId(pkg.id);

    startTransition(async () => {
      const originUrl =
        typeof window !== "undefined" ? window.location.origin : undefined;

      const res = await createStripeCheckoutSessionAction({
        clubTeamId: activeClub.id,
        packageId: pkg.id,
        originUrl,
      });

      if (res.ok && res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }

      setLoadingPkgId(null);
      setFeedback({
        ok: false,
        text: res.error || "Não foi possível redirecionar para a Stripe.",
      });
    });
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner da Loja de Striker Coins */}
      <div className="bg-gradient-to-r from-[#111622] via-[#132038] to-[#111622] border border-[#ffdc2b]/40 rounded-[4px] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[2px] bg-[#ffdc2b] text-[#0e1312] text-[11px] font-extrabold uppercase">
              <Shield className="w-3.5 h-3.5" />
              <span>MOEDA OFICIAL DO JOGO: STRIKER COINS</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[2px] bg-[#15a34a]/20 border border-[#15a34a]/40 text-[#4ade80] text-[11px] font-extrabold uppercase">
              BÔNUS DE INSCRIÇÃO: +500 STRIKER COINS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f4f6fb]">
            Loja Oficial de Striker Coins • Strike Arena
          </h1>
          <p className="text-xs sm:text-sm text-[#b6c0d4] leading-relaxed">
            No ato da inscrição você ganha{" "}
            <strong className="text-[#4ade80]">500 Striker Coins</strong>! As{" "}
            <strong className="text-[#ffdc2b]">Striker Coins</strong> servem
            para disputar <strong>Leilões de Craques Bola Preta</strong>, pagar{" "}
            <strong>Multas Rescisórias à vista</strong> e quitar a{" "}
            <strong>Folha Salarial</strong>, independentemente de qual escudo de
            time você escolher usar na temporada.
          </p>
        </div>

        {/* Resumo do Clube & Saldo */}
        {activeClub && (
          <div className="bg-[#090c12] border border-[#2c3852] rounded-[4px] p-4 min-w-[290px] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-[#78849e]">
                Treinador: {activeClub.ownerNickname}
              </span>
              <Wallet className="w-4 h-4 text-[#ffdc2b]" />
            </div>

            <div className="flex items-center justify-between gap-2.5 p-2.5 rounded-[4px] bg-[#111622] border border-[#222c40]">
              <div className="flex items-center gap-2.5 min-w-0">
                <ClubCrest clubName={activeClub.name} size="md" />
                <div className="min-w-0">
                  <div className="text-[10px] text-[#78849e] uppercase font-bold">
                    Clube Atual:
                  </div>
                  <div className="text-xs font-extrabold text-[#f4f6fb] truncate">
                    {activeClub.name} ({activeClub.acronym})
                  </div>
                </div>
              </div>
              <CrestSwitcherModal
                activeAccount={activeClub}
                allAccounts={clubs}
                onSuccessMessage={setFeedback}
                compactButton
                buttonClassName="h-9 px-3 rounded-[4px] bg-[#133865] hover:bg-[#1c4d8a] border border-[#ffdc2b]/50 text-[11px] font-extrabold text-[#f4f6fb] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              />
            </div>

            <div className="pt-2 border-t border-[#1c2436] flex items-center justify-between">
              <span className="text-xs text-[#9aa5b8]">Saldo Disponível:</span>
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
          className={`p-4 rounded-[4px] border text-xs sm:text-sm font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            feedback.ok
              ? "bg-[#15a34a]/15 border-[#15a34a]/50 text-[#4ade80]"
              : "bg-[#dc2626]/15 border-[#dc2626]/50 text-[#f87171]"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback.text}</span>
          </div>
          {feedback.ok && (
            <Link
              href="/auctions"
              className="w-full sm:w-auto h-10 px-4 rounded-[4px] bg-[#ffdc2b] text-[#0e1312] text-xs font-extrabold inline-flex items-center justify-center whitespace-nowrap"
            >
              Usar nos Leilões →
            </Link>
          )}
        </div>
      )}

      {/* Barra Oficial do Gateway Único: STRIPE CHECKOUT */}
      <div className="bg-[#111622] border border-[#635bff]/40 rounded-[4px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs text-[#b6c0d4]">
          <div className="w-9 h-9 rounded-[4px] bg-[#635bff]/20 border border-[#635bff]/50 flex items-center justify-center text-[#a5b4fc] shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-[#f4f6fb] flex items-center gap-2">
              <span>Meio de Pagamento Único e Oficial: STRIPE</span>
              <span className="px-2 py-0.5 rounded-[2px] bg-[#15a34a]/20 text-[#4ade80] text-[10px] font-extrabold uppercase">
                SSL 256-BITS ATIVO
              </span>
            </div>
            <p className="text-[11px] text-[#78849e] mt-0.5">
              Ao escolher um pacote abaixo, você será redirecionado ao ambiente
              seguro oficial da Stripe para concluir o pagamento com liberação
              automática de Striker Coins.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-[4px] bg-[#635bff] text-white text-xs font-extrabold whitespace-nowrap shrink-0">
          <CreditCard className="w-4 h-4 shrink-0" />
          <span>Powered by Stripe</span>
        </div>
      </div>

      {/* 4 Cards de Pacotes Oficiais de Striker Coins */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {packages.map((pkg) => {
          const unitPriceBrl = (
            pkg.priceBrlCents /
            100 /
            pkg.escudosAmount
          ).toFixed(2);
          const isThisPkgLoading = isPending && loadingPkgId === pkg.id;

          return (
            <div
              key={pkg.id}
              className={`relative rounded-[4px] p-5 flex flex-col justify-between transition-all ${
                pkg.isFeatured
                  ? "bg-gradient-to-b from-[#1a243b] to-[#111622] border-2 border-[#ffdc2b] shadow-[0_0_25px_rgba(255,220,43,0.12)]"
                  : "bg-[#111622] border border-[#222c40]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-[2px] text-[10px] font-extrabold uppercase ${
                      pkg.isFeatured
                        ? "bg-[#ffdc2b] text-[#0e1312]"
                        : "bg-[#161d2c] text-[#60a5fa] border border-[#222c40]"
                    }`}
                  >
                    {pkg.badgeLabel || "PACOTE OFICIAL"}
                  </span>
                  <Shield className="w-4 h-4 text-[#ffdc2b]" />
                </div>

                <h2 className="text-base font-bold text-[#f4f6fb] mt-3">
                  {pkg.name}
                </h2>

                {/* Quantidade de Striker Coins */}
                <div className="mt-3 p-3.5 rounded-[4px] bg-[#090c12] border border-[#1c2436] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#78849e]">
                      Crédito Imediato via Stripe
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-[#ffdc2b] tabular-nums mt-0.5">
                      +{pkg.escudosAmount}{" "}
                      <span className="text-xs font-bold">Striker Coins</span>
                    </div>
                  </div>
                  <Sparkles className="w-5 h-5 text-[#ffdc2b] shrink-0" />
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
                    R$ {unitPriceBrl} / moeda
                  </span>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-[#b6c0d4] border-t border-[#1c2436] pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80] shrink-0" />
                    <span>
                      Disponível na hora para lances em leilões (5 em 5 Striker Coins)
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
                      Checkout oficial criptografado pela Stripe
                    </span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={() => handleBuyPackageWithStripe(pkg)}
                className={`mt-6 w-full h-11 px-4 rounded-[4px] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap ${
                  pkg.isFeatured
                    ? "bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312]"
                    : "bg-[#635bff] hover:bg-[#5249e5] text-white"
                }`}
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                <span>
                  {isThisPkgLoading
                    ? "Abrindo Checkout Stripe..."
                    : `Pagar • ${formatBrlFromCents(pkg.priceBrlCents)}`}
                </span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Log Transacional Auditável de Compras de Striker Coins */}
      <div className="bg-[#111622] border border-[#222c40] rounded-[4px] overflow-hidden">
        <div className="p-4 border-b border-[#222c40] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#ffdc2b]" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#f4f6fb]">
                Histórico Auditável de Recargas de Striker Coins (Stripe)
              </h2>
              <p className="text-xs text-[#78849e]">
                Registro transparente de todas as confirmações de pacotes via
                Stripe na liga
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
                <th className="py-3 px-3 text-center">Gateway Oficial</th>
                <th className="py-3 px-3 text-right">Valor Pago (R$)</th>
                <th className="py-3 px-3 text-right">Striker Coins Creditadas</th>
                <th className="py-3 px-4 text-right">Referência Stripe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2436] text-xs">
              {purchases.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-[#78849e] text-xs"
                  >
                    Selecione um dos pacotes acima para adquirir Striker Coins via
                    Stripe Checkout Oficial.
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
                      <span className="px-2 py-0.5 rounded-[2px] bg-[#635bff]/20 border border-[#635bff]/40 text-[#a5b4fc] font-extrabold text-[10px]">
                        STRIPE
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-[#f4f6fb] tabular-nums">
                      {formatBrlFromCents(p.amountPaidBrlCents)}
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-[#4ade80] tabular-nums">
                      +{formatEscudos(p.escudosCredited)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-[#78849e]">
                      {p.externalReference || "STRIPE-CONFIRMED"}
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
