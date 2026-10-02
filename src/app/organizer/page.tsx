import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import {
  getAllTournaments,
  getTournamentBySlug,
} from "@/lib/queries/tournaments";
import { OrganizerWizard } from "@/components/tournament/organizer-wizard";
import { MatchStatusBadge } from "@/components/tournament/status-badge";

export const dynamic = "force-dynamic";

export default async function OrganizerPage() {
  const { tournaments } = await getAllTournaments();
  const activeTournament = tournaments[0] ?? null;
  const data = activeTournament
    ? await getTournamentBySlug(activeTournament.slug)
    : null;
  const pendingMatches =
    data?.matches.filter(
      (m) => m.status === "awaiting_confirmation" || m.status === "disputed"
    ) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header do Painel Organizador */}
      <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#ffdc2b] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Diretoria da Liga & Arbitragem Oficial
          </span>
          <h1 className="text-2xl font-bold text-[#f4f6fb] mt-0.5">
            Central do Organizador & Mediação
          </h1>
          <p className="text-xs text-[#78849e] mt-1">
            Crie campeonatos, sorteie grupos e homologue placares ou W.O. com
            atualização automática na tabela.
          </p>
        </div>

        {activeTournament && (
          <Link
            href={`/tournaments/${activeTournament.slug}`}
            className="min-h-10 px-4 py-2 rounded-[4px] bg-[#161d2c] hover:bg-[#1d2639] border border-[#222c40] text-xs font-semibold text-[#f4f6fb] inline-flex items-center gap-2"
          >
            <span>Abrir {activeTournament.name}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#ffdc2b]" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Coluna 1: Wizard de Criação */}
        <OrganizerWizard />

        {/* Coluna 2: Fila de Mediação e Disputas */}
        <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-6 space-y-5">
          <div className="border-b border-[#222c40] pb-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#fb923c] font-semibold">
                Auditoria de Resultados
              </span>
              <h2 className="text-lg font-bold text-[#f4f6fb]">
                Fila de Mediação ({pendingMatches.length} pendentes)
              </h2>
            </div>
            <AlertTriangle className="w-4 h-4 text-[#fb923c]" />
          </div>

          <div className="space-y-3">
            {pendingMatches.length === 0 ? (
              <div className="p-6 rounded-[4px] bg-[#090c12] border border-[#222c40] text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-[#4ade80] mx-auto" />
                <p className="text-xs font-semibold text-[#f4f6fb]">
                  Nenhuma súmula pendente de mediação no momento.
                </p>
                <p className="text-[11px] text-[#78849e]">
                  Quando jogadores reportarem placares ou pedidos de W.O., eles
                  aparecerão aqui para homologação.
                </p>
              </div>
            ) : (
              pendingMatches.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-[4px] bg-[#090c12] border border-[#222c40] space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#ffdc2b]">
                      {m.label}
                    </span>
                    <MatchStatusBadge status={m.status} />
                  </div>

                  <div className="flex items-center justify-between text-sm font-bold text-[#f4f6fb] tabular-nums">
                    <span>
                      {m.homeNickname}{" "}
                      <span className="text-xs font-normal text-[#78849e]">
                        ({m.homeClub})
                      </span>
                    </span>
                    <span className="px-2.5 py-1 rounded-[2px] bg-[#161d2c] text-[#ffdc2b]">
                      {m.homeScore ?? 0} × {m.awayScore ?? 0}
                    </span>
                    <span>
                      {m.awayNickname}{" "}
                      <span className="text-xs font-normal text-[#78849e]">
                        ({m.awayClub})
                      </span>
                    </span>
                  </div>

                  {m.notes && (
                    <p className="text-xs text-[#b6c0d4] bg-[#161d2c] p-2.5 rounded-[4px]">
                      {m.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 text-xs">
                    {m.proofUrl ? (
                      <a
                        href={m.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#ffdc2b] hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Inspecionar Screenshot</span>
                      </a>
                    ) : (
                      <span className="text-[#78849e]">Sem anexo</span>
                    )}

                    {activeTournament && (
                      <Link
                        href={`/tournaments/${activeTournament.slug}`}
                        className="px-3 py-1.5 rounded-[4px] bg-[#ffdc2b] text-[#0e1312] font-bold text-xs"
                      >
                        Julgar no Match Hub →
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
