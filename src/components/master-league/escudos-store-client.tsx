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
  Trophy,
  CalendarClock,
  QrCode,
  AlertTriangle,
} from "lucide-react";
import type {
  ClubTeamDTO,
  EscudoPackageDTO,
  EscudoPurchaseDTO,
} from "@/lib/master-league-data";
import { formatEscudos, formatBrlFromCents } from "@/lib/master-league-data";
import {
  createStripeCheckoutSessionAction,
  createLeaguePassStripeCheckoutAction,
  setClubLeaguePassExpiryAction,
} from "@/app/actions/master-league-actions";
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
  const [loadingPassMode, setLoadingPassMode] = useState<string | null>(null);
  const [adminTargetClubId, setAdminTargetClubId] = useState<string>(
    initialClubId || clubs[0]?.id || ""
  );
  const [adminPlanType, setAdminPlanType] = useState<
    "MONTHLY_PIX" | "RECURRING_STRIPE" | "ADMIN_GRANTED" | "REVOKE"
  >("MONTHLY_PIX");
  const [adminExpiryDate, setAdminExpiryDate] = useState<string>(() => {
    const d = new Date(Date.now() + 30 * 86400000);
    return d.toISOString().slice(0, 10);
  });
  const [isPending, startTransition] = useTransition();

  const activeClub =
    clubs.find((c) => c.id === selectedClubId) ?? clubs[0] ?? null;

  const hasPass = Boolean(activeClub?.hasActiveLeaguePass);
  const formattedPassExpiry = activeClub?.leaguePassExpiresAt
    ? new Date(activeClub.leaguePassExpiresAt).toLocaleDateString("pt-BR")
    : null;

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

  function handleBuyLeaguePass(
    billingMode: "RECURRING_STRIPE" | "MONTHLY_PIX"
  ) {
    if (!activeClub) return;
    setFeedback(null);
    setLoadingPassMode(billingMode);

    startTransition(async () => {
      const originUrl =
        typeof window !== "undefined" ? window.location.origin : undefined;

      const res = await createLeaguePassStripeCheckoutAction({
        clubTeamId: activeClub.id,
        billingMode,
        returnPath: "/store/strike-coins",
        originUrl,
      });

      if (res.ok && res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }

      setLoadingPassMode(null);
      setFeedback({
        ok: false,
        text:
          res.error ||
          "Não foi possível iniciar o pagamento do Passe de Liga na Stripe.",
      });
    });
  }

  function handleAdminSavePassExpiry(e: React.FormEvent) {
    e.preventDefault();
    if (!adminTargetClubId) return;
    setFeedback(null);

    startTransition(async () => {
      const res = await setClubLeaguePassExpiryAction({
        clubTeamId: adminTargetClubId,
        planType: adminPlanType,
        customExpiresAtIso:
          adminPlanType === "REVOKE"
            ? undefined
            : `${adminExpiryDate}T23:59:59.000Z`,
      });

      setFeedback({
        ok: res.ok,
        text: res.ok ? res.message! : res.error!,
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
            Loja Oficial de Striker Coins & Passe de Liga
          </h1>
          <p className="text-xs sm:text-sm text-[#b6c0d4] leading-relaxed">
            No ato da inscrição você ganha{" "}
            <strong className="text-[#4ade80]">500 Striker Coins</strong>! Para
            disputar os torneios da Master League, mantenha seu{" "}
            <strong className="text-[#ffdc2b]">
              Passe de Liga (R$ 30,00/mês)
            </strong>{" "}
            em dia (assinatura mensal recorrente ou pagamento via PIX todo mês
            com vencimento estipulado).
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

      {/* =====================================================================
       * SEÇÃO OFICIAL: PASSE DE LIGA DA MASTER LEAGUE (R$ 30,00 / MÊS)
       * Regra: Só pode jogar torneios quem tiver o Passe de Liga ativo
       * ===================================================================== */}
      <div className="bg-gradient-to-b from-[#162038] to-[#111622] border-2 border-[#ffdc2b] rounded-[4px] p-6 space-y-6 shadow-[0_0_30px_rgba(255,220,43,0.1)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-[#222c40] pb-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[2px] bg-[#ffdc2b] text-[#0e1312] text-[10px] font-extrabold uppercase">
                <Trophy className="w-3.5 h-3.5" />
                OBRIGATÓRIO PARA DISPUTAR TORNEIOS
              </span>
              {hasPass ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[2px] bg-[#15a34a]/20 border border-[#15a34a]/50 text-[#4ade80] text-[10px] font-extrabold uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  PASSE DE LIGA ATIVO · VENCIMENTO: {formattedPassExpiry}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[2px] bg-[#dc2626]/20 border border-[#dc2626]/50 text-[#f87171] text-[10px] font-extrabold uppercase">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  PASSE PENDENTE / VENCIDO — ATIVE PARA JOGAR TORNEIOS
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#f4f6fb]">
              Passe de Liga Oficial Master League — R$ 30,00 / mês
            </h2>
            <p className="text-xs sm:text-sm text-[#b6c0d4] leading-relaxed">
              Na Master League,{" "}
              <strong className="text-[#ffdc2b]">
                só pode jogar torneios quem tiver o Passe de Liga ativo
              </strong>
              . Você pode escolher entre{" "}
              <strong>Assinatura Mensal Recorrente (R$ 30,00/mês)</strong> na
              Stripe ou <strong>Pagamento Mensal / PIX todo mês (R$ 30,00)</strong>{" "}
              com data de vencimento estipulada de 30 dias.
            </p>
          </div>

          <div className="bg-[#090c12] border border-[#ffdc2b]/50 rounded-[4px] p-4 min-w-[260px] text-right tabular-nums shrink-0">
            <span className="text-[10px] uppercase tracking-wider text-[#78849e] block font-bold">
              Valor Oficial do Passe de Liga
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#ffdc2b] mt-0.5">
              R$ 30,00{" "}
              <span className="text-xs font-bold text-[#9aa5b8]">/ mês</span>
            </p>
            <div className="text-[11px] text-[#4ade80] font-bold mt-1 flex items-center justify-end gap-1">
              <CalendarClock className="w-3.5 h-3.5" />
              <span>
                {hasPass
                  ? `Vencimento estipulado: ${formattedPassExpiry}`
                  : "Validade de 30 dias por ciclo mensal"}
              </span>
            </div>
          </div>
        </div>

        {/* 2 Opções de Contratação do Passe de Liga: Recorrente vs Mensal / PIX */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-[4px] bg-[#090c12] border border-[#2c3852] flex flex-col justify-between gap-4">
            <div className="space-y-1.5">
              <span className="px-2 py-0.5 rounded-[2px] bg-[#635bff]/20 border border-[#635bff]/50 text-[#a5b4fc] text-[10px] font-extrabold uppercase">
                OPÇÃO 1 · RENOVAÇÃO AUTOMÁTICA
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-[#f4f6fb]">
                Assinatura Mensal Recorrente (R$ 30,00 / mês)
              </h3>
              <p className="text-xs text-[#9aa5b8]">
                Cobrança recorrente automática via Stripe todo mês. Seu Passe de
                Liga permanece sempre ativo sem risco de perder o vencimento.
              </p>
            </div>

            <button
              type="button"
              disabled={isPending || !activeClub}
              onClick={() => handleBuyLeaguePass("RECURRING_STRIPE")}
              className="w-full h-11 px-4 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] text-xs font-extrabold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>
                {isPending && loadingPassMode === "RECURRING_STRIPE"
                  ? "Abrindo Assinatura na Stripe..."
                  : "Assinar Passe Recorrente (R$ 30,00/mês)"}
              </span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>

          <div className="p-4 rounded-[4px] bg-[#090c12] border border-[#2c3852] flex flex-col justify-between gap-4">
            <div className="space-y-1.5">
              <span className="px-2 py-0.5 rounded-[2px] bg-[#15a34a]/20 border border-[#15a34a]/50 text-[#4ade80] text-[10px] font-extrabold uppercase">
                OPÇÃO 2 · MENSALIDADE AVULSA / PIX TODO MÊS
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-[#f4f6fb]">
                Passe Mensal 30 Dias / PIX (R$ 30,00)
              </h3>
              <p className="text-xs text-[#9aa5b8]">
                Pagamento mensal avulso de R$ 30,00 com vencimento estipulado
                para 30 dias. Renove todo mês até a data de vencimento para
                continuar jogando os torneios.
              </p>
            </div>

            <button
              type="button"
              disabled={isPending || !activeClub}
              onClick={() => handleBuyLeaguePass("MONTHLY_PIX")}
              className="w-full h-11 px-4 rounded-[4px] bg-[#133865] hover:bg-[#1c4d8a] border border-[#ffdc2b]/60 text-[#f4f6fb] text-xs font-extrabold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <QrCode className="w-4 h-4 text-[#ffdc2b] shrink-0" />
              <span>
                {isPending && loadingPassMode === "MONTHLY_PIX"
                  ? "Abrindo Checkout Mensal..."
                  : "Pagar Mensalidade 30 Dias (R$ 30,00)"}
              </span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>
        </div>

        {/* Controle de Vencimento Estipulado (PIX Mensal / Diretoria da Liga) */}
        <form
          onSubmit={handleAdminSavePassExpiry}
          className="p-4 rounded-[4px] bg-[#090c12]/90 border border-[#222c40] space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#ffdc2b]">
              <CalendarClock className="w-4 h-4 shrink-0" />
              <span>
                Controle de Vencimento do Passe de Liga (Confirmação PIX Mensal /
                Diretoria)
              </span>
            </div>
            <span className="text-[11px] text-[#78849e]">
              Estipule a data de vencimento mensal de qualquer competidor
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-[11px] text-[#9aa5b8] mb-1">
                Clube / Competidor
              </label>
              <select
                value={adminTargetClubId}
                onChange={(e) => setAdminTargetClubId(e.target.value)}
                className="w-full h-10 px-3 rounded-[4px] bg-[#111622] border border-[#222c40] text-xs text-[#f4f6fb]"
              >
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.ownerNickname} — {c.name} (
                    {c.hasActiveLeaguePass ? "ATIVO" : "SEM PASSE"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#9aa5b8] mb-1">
                Modalidade do Passe (R$ 30,00)
              </label>
              <select
                value={adminPlanType}
                onChange={(e) =>
                  setAdminPlanType(
                    e.target.value as
                      | "MONTHLY_PIX"
                      | "RECURRING_STRIPE"
                      | "ADMIN_GRANTED"
                      | "REVOKE"
                  )
                }
                className="w-full h-10 px-3 rounded-[4px] bg-[#111622] border border-[#222c40] text-xs text-[#f4f6fb]"
              >
                <option value="MONTHLY_PIX">PIX Mensal (R$ 30,00 / mês)</option>
                <option value="RECURRING_STRIPE">
                  Assinatura Recorrente Stripe
                </option>
                <option value="ADMIN_GRANTED">Liberado pela Diretoria</option>
                <option value="REVOKE">Revogar / Vencido</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#9aa5b8] mb-1">
                Data de Vencimento Estipulada
              </label>
              <input
                type="date"
                disabled={adminPlanType === "REVOKE"}
                value={adminExpiryDate}
                onChange={(e) => setAdminExpiryDate(e.target.value)}
                className="w-full h-10 px-3 rounded-[4px] bg-[#111622] border border-[#222c40] text-xs text-[#f4f6fb] disabled:opacity-40"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-10 px-4 rounded-[4px] bg-[#15a34a] hover:bg-[#16a34a] text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Estipular Vencimento</span>
            </button>
          </div>
        </form>
      </div>

      {/* Barra Oficial do Gateway Único: STRIPE CHECKOUT */}
      <div className="bg-[#111622] border border-[#635bff]/40 rounded-[4px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs text-[#b6c0d4]">
          <div className="w-9 h-9 rounded-[4px] bg-[#635bff]/20 border border-[#635bff]/50 flex items-center justify-center text-[#a5b4fc] shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-[#f4f6fb] flex items-center gap-2">
              <span>Pacotes Avulsos de Striker Coins via STRIPE</span>
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
