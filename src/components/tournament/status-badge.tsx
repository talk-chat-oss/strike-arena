import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Calendar,
  Radio,
} from "lucide-react";

type MatchStatus =
  | "scheduled"
  | "awaiting_confirmation"
  | "completed"
  | "disputed"
  | "walkover";

type TournamentStatus = "draft" | "open" | "in_progress" | "completed";

export function MatchStatusBadge({ status }: { status: MatchStatus }) {
  switch (status) {
    case "completed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#15a34a]/15 text-[#4ade80] border border-[#15a34a]/40">
          <CheckCircle2 className="w-3 h-3 shrink-0" />
          <span>Encerrada</span>
        </span>
      );
    case "awaiting_confirmation":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f97316]/15 text-[#fb923c] border border-[#f97316]/40">
          <Clock className="w-3 h-3 shrink-0" />
          <span>Aguardando Confirmação</span>
        </span>
      );
    case "disputed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#be123c]/20 text-[#fb7185] border border-[#be123c]/50">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span>Contestada / Auditoria</span>
        </span>
      );
    case "walkover":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#be123c]/20 text-[#fb7185] border border-[#be123c]/50">
          <ShieldAlert className="w-3 h-3 shrink-0" />
          <span>Decidida por W.O.</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#1d2639] text-[#b6c0d4] border border-[#222c40]">
          <Calendar className="w-3 h-3 shrink-0" />
          <span>Agendada</span>
        </span>
      );
  }
}

export function TournamentStatusBadge({
  status,
}: {
  status: TournamentStatus;
}) {
  switch (status) {
    case "in_progress":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ffdc2b] text-[#0e1312]">
          <Radio className="w-3 h-3 shrink-0" />
          <span>EM ANDAMENTO</span>
        </span>
      );
    case "open":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#15a34a]/15 text-[#4ade80] border border-[#15a34a]/40">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
          <span>Inscrições Abertas</span>
        </span>
      );
    case "completed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#1d2639] text-[#b6c0d4] border border-[#222c40]">
          <CheckCircle2 className="w-3 h-3 shrink-0" />
          <span>Concluído</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#1d2639] text-[#78849e] border border-[#222c40]">
          <span>Rascunho</span>
        </span>
      );
  }
}
