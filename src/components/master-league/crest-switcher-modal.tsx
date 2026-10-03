"use client";

import { useState, useMemo, useTransition } from "react";
import {
  Shield,
  Search,
  CheckCircle2,
  Lock,
  RefreshCw,
  X,
  Wallet,
  Users,
} from "lucide-react";
import {
  ALL_CLUB_CRESTS_LIST,
  ClubCrest,
  type ClubVisual,
} from "@/lib/club-crests";
import {
  formatEscudos,
  type ClubTeamDTO,
} from "@/lib/master-league-data";
import { switchAccountCrestAction } from "@/app/actions/master-league-actions";

interface CrestSwitcherModalProps {
  activeAccount: ClubTeamDTO;
  allAccounts: ClubTeamDTO[];
  onSuccessMessage?: (msg: { ok: boolean; text: string }) => void;
  buttonClassName?: string;
  compactButton?: boolean;
}

export function CrestSwitcherModal({
  activeAccount,
  allAccounts,
  onSuccessMessage,
  buttonClassName,
  compactButton = false,
}: CrestSwitcherModalProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"FREE" | "ALL" | "TAKEN">(
    "FREE"
  );
  const [localFeedback, setLocalFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [pendingCrestName, setPendingCrestName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Mapa de escudos já em uso por outras contas na liga (exceto a própria conta ativa)
  const usedCrestOwnerByLowerName = useMemo(() => {
    const map = new Map<string, { ownerNickname: string; accountId: string }>();
    for (const acc of allAccounts) {
      map.set(acc.name.trim().toLowerCase(), {
        ownerNickname: acc.ownerNickname,
        accountId: acc.id,
      });
    }
    return map;
  }, [allAccounts]);

  const filteredCrests = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_CLUB_CRESTS_LIST.filter((club) => {
      const usedInfo = usedCrestOwnerByLowerName.get(
        club.name.trim().toLowerCase()
      );
      const isTakenByOther = Boolean(
        usedInfo && usedInfo.accountId !== activeAccount.id
      );

      if (statusFilter === "FREE" && isTakenByOther) return false;
      if (statusFilter === "TAKEN" && !isTakenByOther) return false;

      if (q) {
        return (
          club.name.toLowerCase().includes(q) ||
          club.shortName.toLowerCase().includes(q) ||
          club.country.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, statusFilter, usedCrestOwnerByLowerName, activeAccount.id]);

  const freeCount = useMemo(() => {
    return ALL_CLUB_CRESTS_LIST.filter((club) => {
      const usedInfo = usedCrestOwnerByLowerName.get(
        club.name.trim().toLowerCase()
      );
      return !usedInfo || usedInfo.accountId === activeAccount.id;
    }).length;
  }, [usedCrestOwnerByLowerName, activeAccount.id]);

  const takenCount = ALL_CLUB_CRESTS_LIST.length - freeCount;

  function handleSelectCrest(club: ClubVisual) {
    setLocalFeedback(null);
    setPendingCrestName(club.name);

    startTransition(async () => {
      const res = await switchAccountCrestAction({
        clubTeamId: activeAccount.id,
        newClubName: club.name,
        newAcronym: club.shortName,
      });

      setPendingCrestName(null);
      const fb = {
        ok: res.ok,
        text: res.ok ? res.message! : res.error!,
      };
      setLocalFeedback(fb);
      if (onSuccessMessage) {
        onSuccessMessage(fb);
      }
      if (res.ok) {
        setOpen(false);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setLocalFeedback(null);
          setOpen(true);
        }}
        className={
          buttonClassName ||
          "w-full sm:w-auto h-11 px-4 rounded-[4px] bg-[#133865] hover:bg-[#1c4d8a] border border-[#ffdc2b]/50 text-xs font-extrabold text-[#f4f6fb] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
        }
      >
        <RefreshCw className="w-3.5 h-3.5 text-[#ffdc2b] shrink-0" />
        <span>Trocar Escudo</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-[#0b0f18] border border-[#2c3852] rounded-[4px] shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="p-4 sm:p-5 border-b border-[#222c40] bg-[#111622] flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#ffdc2b] text-[#0e1312] text-[10px] font-extrabold uppercase">
                  <Shield className="w-3 h-3" />
                  <span>CATÁLOGO GLOBAL DE ESCUDOS & UNIFORMES</span>
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#f4f6fb]">
                  Trocar Escudo / Time Representado pela Conta{" "}
                  <span className="text-[#ffdc2b]">
                    {activeAccount.ownerNickname}
                  </span>
                </h2>
                <p className="text-xs text-[#9aa5b8]">
                  Escolha qualquer escudo livre abaixo (ex:{" "}
                  <strong className="text-[#f4f6fb]">Boca Juniors</strong>,{" "}
                  <strong className="text-[#f4f6fb]">Parma</strong>,{" "}
                  <strong className="text-[#f4f6fb]">Liverpool</strong>,{" "}
                  <strong className="text-[#f4f6fb]">Flamengo</strong>). Seu{" "}
                  <strong className="text-[#4ade80]">
                    Saldo Global da Conta ({formatEscudos(activeAccount.balance)})
                  </strong>{" "}
                  e seus{" "}
                  <strong className="text-[#ffdc2b]">
                    {activeAccount.rosterCount} jogadores contratados
                  </strong>{" "}
                  permanecem 100% na sua conta!
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-[4px] bg-[#161d2c] hover:bg-[#1e273b] border border-[#2c3852] flex items-center justify-center text-[#b6c0d4] hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Resumo da Conta Global + Barra de Busca e Filtros */}
            <div className="p-4 border-b border-[#222c40] bg-[#0e131f] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-[4px] bg-[#111622] border border-[#222c40]">
                <div className="flex items-center gap-2.5">
                  <ClubCrest clubName={activeAccount.name} size="md" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#78849e]">
                      Conta Oficial: {activeAccount.ownerNickname}
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-[#f4f6fb]">
                      Escudo Atual:{" "}
                      <span className="text-[#ffdc2b]">
                        {activeAccount.name} ({activeAccount.acronym})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-[#4ade80] font-extrabold">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Saldo Global: {formatEscudos(activeAccount.balance)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#b6c0d4] font-bold">
                    <Users className="w-3.5 h-3.5 text-[#ffdc2b]" />
                    <span>{activeAccount.rosterCount} Atletas</span>
                  </div>
                </div>
              </div>

              {localFeedback && (
                <div
                  className={`p-3 rounded-[4px] border text-xs font-bold ${
                    localFeedback.ok
                      ? "bg-[#15a34a]/15 border-[#15a34a]/50 text-[#4ade80]"
                      : "bg-[#dc2626]/15 border-[#dc2626]/50 text-[#f87171]"
                  }`}
                >
                  {localFeedback.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 text-[#78849e] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar escudo (ex: Boca Juniors, Parma, Liverpool, Real Madrid...)"
                    className="w-full h-10 pl-9 pr-3 rounded-[4px] bg-[#090c12] border border-[#222c40] text-xs text-[#f4f6fb] focus:border-[#ffdc2b] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-6 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("FREE")}
                    className={`h-10 px-2.5 rounded-[4px] text-[11px] font-extrabold cursor-pointer transition-colors whitespace-nowrap ${
                      statusFilter === "FREE"
                        ? "bg-[#15a34a] text-[#090c12]"
                        : "bg-[#090c12] text-[#4ade80] border border-[#15a34a]/40 hover:bg-[#161d2c]"
                    }`}
                  >
                    Livres ({freeCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("ALL")}
                    className={`h-10 px-2.5 rounded-[4px] text-[11px] font-extrabold cursor-pointer transition-colors whitespace-nowrap ${
                      statusFilter === "ALL"
                        ? "bg-[#ffdc2b] text-[#0e1312]"
                        : "bg-[#090c12] text-[#b6c0d4] border border-[#222c40] hover:bg-[#161d2c]"
                    }`}
                  >
                    Todos ({ALL_CLUB_CRESTS_LIST.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("TAKEN")}
                    className={`h-10 px-2.5 rounded-[4px] text-[11px] font-extrabold cursor-pointer transition-colors whitespace-nowrap ${
                      statusFilter === "TAKEN"
                        ? "bg-[#dc2626] text-white"
                        : "bg-[#090c12] text-[#f87171] border border-[#dc2626]/40 hover:bg-[#161d2c]"
                    }`}
                  >
                    Em Uso ({takenCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Grid de Escudos Oficiais */}
            <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[55vh]">
              {filteredCrests.map((club) => {
                const usedInfo = usedCrestOwnerByLowerName.get(
                  club.name.trim().toLowerCase()
                );
                const isCurrentCrest =
                  usedInfo?.accountId === activeAccount.id ||
                  activeAccount.name.trim().toLowerCase() ===
                    club.name.trim().toLowerCase();
                const isTakenByOther = Boolean(
                  usedInfo && usedInfo.accountId !== activeAccount.id
                );
                const isSwitchingThis =
                  isPending && pendingCrestName === club.name;

                return (
                  <div
                    key={club.name}
                    className={`p-3 rounded-[4px] border flex items-center justify-between gap-3 transition-colors ${
                      isCurrentCrest
                        ? "bg-[#ffdc2b]/10 border-[#ffdc2b]"
                        : isTakenByOther
                        ? "bg-[#090c12]/60 border-[#222c40] opacity-70"
                        : "bg-[#111622] hover:bg-[#161d2c] border-[#222c40] hover:border-[#ffdc2b]/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ClubCrest clubName={club.name} size="md" />
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-[#f4f6fb] truncate">
                          {club.name}
                        </div>
                        <div className="text-[10px] text-[#78849e] truncate">
                          {isCurrentCrest ? (
                            <span className="text-[#ffdc2b] font-bold">
                              ★ Seu Escudo Atual
                            </span>
                          ) : isTakenByOther ? (
                            <span className="text-[#f87171] font-bold">
                              Em uso por {usedInfo?.ownerNickname}
                            </span>
                          ) : (
                            <span className="text-[#4ade80] font-bold">
                              ✓ Disponível ({club.shortName})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isCurrentCrest ? (
                      <span className="h-9 px-2.5 rounded-[4px] bg-[#ffdc2b] text-[#0e1312] text-[10px] font-extrabold inline-flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ativo</span>
                      </span>
                    ) : isTakenByOther ? (
                      <span className="h-9 px-2.5 rounded-[4px] bg-[#161d2c] border border-[#2c3852] text-[#78849e] text-[10px] font-bold inline-flex items-center gap-1 shrink-0">
                        <Lock className="w-3 h-3" />
                        <span>Ocupado</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleSelectCrest(club)}
                        className="h-9 px-3 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] text-[11px] font-extrabold inline-flex items-center justify-center cursor-pointer transition-colors shrink-0 disabled:opacity-50"
                      >
                        {isSwitchingThis ? "Trocando..." : "Escolher"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
