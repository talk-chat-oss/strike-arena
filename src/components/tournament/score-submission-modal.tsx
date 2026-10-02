"use client";

import { useState, useTransition } from "react";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Image as ImageIcon,
  X,
  Send,
} from "lucide-react";
import type { MockMatch } from "@/db/mock-data";
import { SPOOKY_SUPER_ADMIN_ID } from "@/db/mock-data";
import { submitMatchScoreAction } from "@/app/actions/tournament-actions";

interface ScoreSubmissionPanelProps {
  tournamentSlug: string;
  matches: MockMatch[];
  selectedMatchId?: string;
  onClose?: () => void;
  isModal?: boolean;
}

const PRESET_PROOFS = [
  {
    label: "Print Placar EA FC 26 (PS5 Share)",
    url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
  },
  {
    label: "Print Tela Final eFootball / Xbox",
    url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
  },
];

export function ScoreSubmissionPanel({
  tournamentSlug,
  matches,
  selectedMatchId,
  onClose,
  isModal = false,
}: ScoreSubmissionPanelProps) {
  const [matchId, setMatchId] = useState<string>(
    selectedMatchId ??
      matches.find((m) => m.status !== "completed")?.id ??
      matches[0]?.id ??
      ""
  );

  const activeMatch = matches.find((m) => m.id === matchId) ?? matches[0];

  const [homeScore, setHomeScore] = useState<number>(
    activeMatch?.homeScore ?? 2
  );
  const [awayScore, setAwayScore] = useState<number>(
    activeMatch?.awayScore ?? 1
  );
  const [proofUrl, setProofUrl] = useState<string>(
    activeMatch?.proofUrl ?? PRESET_PROOFS[0].url
  );
  const [notes, setNotes] = useState<string>(activeMatch?.notes ?? "");
  const [requestWalkover, setRequestWalkover] = useState<boolean>(false);
  const [actAsSuperAdmin, setActAsSuperAdmin] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  function handleMatchChange(newId: string) {
    setMatchId(newId);
    const found = matches.find((m) => m.id === newId);
    if (found) {
      setHomeScore(found.homeScore ?? 0);
      setAwayScore(found.awayScore ?? 0);
      setProofUrl(found.proofUrl ?? PRESET_PROOFS[0].url);
      setNotes(found.notes ?? "");
    }
    setFeedback(null);
  }

  function handleFileSimulation(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Simula upload para bucket Supabase Storage / CDN gerando URL verificável
    setProofUrl(
      `https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&file=${encodeURIComponent(
        file.name
      )}`
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeMatch) return;

    setFeedback(null);
    startTransition(async () => {
      const res = await submitMatchScoreAction({
        matchId: activeMatch.id,
        tournamentSlug,
        homeScore: requestWalkover ? 3 : homeScore,
        awayScore: requestWalkover ? 0 : awayScore,
        proofUrl,
        notes,
        requestWalkover,
        actorUserId: actAsSuperAdmin
          ? SPOOKY_SUPER_ADMIN_ID
          : "20000000-0000-4000-8000-000000000001",
      });

      if (res.ok) {
        setFeedback({
          type: "success",
          text: res.message ?? "Placar enviado com sucesso!",
        });
      } else {
        setFeedback({
          type: "error",
          text: res.error ?? "Erro ao registrar placar.",
        });
      }
    });
  }

  if (!activeMatch) return null;

  return (
    <div
      className={`bg-[#111622] border border-[#222c40] rounded-[4px] p-5 sm:p-6 ${
        isModal ? "w-full max-w-xl mx-auto" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4 pb-4 mb-5 border-b border-[#222c40]">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#ffdc2b] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffdc2b]" />
            Match Hub · Submissão de Resultado
          </span>
          <h3 className="text-base sm:text-lg font-bold text-[#f4f6fb] mt-0.5">
            Reportar Placar e Comprovante
          </h3>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela de envio de placar"
            className="w-8 h-8 rounded-[4px] bg-[#161d2c] hover:bg-[#1d2639] text-[#b6c0d4] inline-flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Seletor da Partida */}
        <div className="space-y-1.5">
          <label
            htmlFor="match-select"
            className="block text-xs font-semibold text-[#f4f6fb]"
          >
            Confronto Selecionado
          </label>
          <select
            id="match-select"
            value={activeMatch.id}
            onChange={(e) => handleMatchChange(e.target.value)}
            className="w-full min-h-11 px-3.5 py-2.5 rounded-[4px] bg-[#161d2c] border border-[#222c40] text-xs sm:text-sm text-[#f4f6fb] focus:border-[#ffdc2b] focus:outline-none"
          >
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                [{m.label}] {m.homeNickname} ({m.homeClub}) vs {m.awayNickname}{" "}
                ({m.awayClub}) —{" "}
                {m.homeScore !== null ? `${m.homeScore}×${m.awayScore}` : "vs"}
              </option>
            ))}
          </select>
        </div>

        {/* Placar Mandante vs Visitante */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3 p-4 rounded-[4px] bg-[#090c12] border border-[#222c40]">
          {/* Mandante */}
          <div className="flex items-center justify-between sm:flex-col sm:items-start gap-2">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#78849e] block">
                Mandante
              </span>
              <p className="text-sm font-bold text-[#f4f6fb]">
                {activeMatch.homeNickname}
              </p>
              <p className="text-xs text-[#78849e]">{activeMatch.homeClub}</p>
            </div>
            <input
              type="number"
              min={0}
              max={30}
              disabled={requestWalkover}
              aria-label={`Gols de ${activeMatch.homeNickname}`}
              value={requestWalkover ? 3 : homeScore}
              onChange={(e) => setHomeScore(Number(e.target.value))}
              className="w-20 h-12 text-center text-xl font-bold tabular-nums rounded-[4px] bg-[#161d2c] border border-[#222c40] text-[#ffdc2b] focus:border-[#ffdc2b] focus:outline-none"
            />
          </div>

          <div className="text-center font-bold text-xs text-[#78849e] py-1">
            VS
          </div>

          {/* Visitante */}
          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
            <div className="sm:text-right">
              <span className="text-[10px] uppercase tracking-wider text-[#78849e] block">
                Visitante
              </span>
              <p className="text-sm font-bold text-[#f4f6fb]">
                {activeMatch.awayNickname}
              </p>
              <p className="text-xs text-[#78849e]">{activeMatch.awayClub}</p>
            </div>
            <input
              type="number"
              min={0}
              max={30}
              disabled={requestWalkover}
              aria-label={`Gols de ${activeMatch.awayNickname}`}
              value={requestWalkover ? 0 : awayScore}
              onChange={(e) => setAwayScore(Number(e.target.value))}
              className="w-20 h-12 text-center text-xl font-bold tabular-nums rounded-[4px] bg-[#161d2c] border border-[#222c40] text-[#ffdc2b] focus:border-[#ffdc2b] focus:outline-none"
            />
          </div>
        </div>

        {/* Upload / URL do Comprovante (Screenshot) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="proof-url"
              className="text-xs font-semibold text-[#f4f6fb] flex items-center gap-1.5"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#ffdc2b]" />
              <span>Comprovante do Placar (Screenshot / Print)</span>
            </label>
            <span className="text-[11px] text-[#78849e]">
              PNG, JPG ou Link (até 8 MB)
            </span>
          </div>

          {/* Dropzone / File Input */}
          <label className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-[4px] bg-[#161d2c] border border-dashed border-[#222c40] hover:border-[#ffdc2b] cursor-pointer transition-colors text-center">
            <UploadCloud className="w-6 h-6 text-[#ffdc2b]" />
            <span className="text-xs font-semibold text-[#f4f6fb]">
              Arraste o print da tela final ou clique para selecionar arquivo
            </span>
            <span className="text-[11px] text-[#78849e]">
              O print deve exibir o placar final e as IDs (PSN / Xbox / EA ID)
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSimulation}
              className="sr-only"
            />
          </label>

          <input
            id="proof-url"
            type="url"
            required
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            placeholder="https://..."
            className="w-full min-h-10 px-3 py-2 rounded-[4px] bg-[#161d2c] border border-[#222c40] text-xs text-[#f4f6fb] focus:border-[#ffdc2b] focus:outline-none"
          />

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-[#78849e]">Exemplos rápidos:</span>
            {PRESET_PROOFS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setProofUrl(preset.url)}
                className="px-2 py-1 rounded-[2px] bg-[#1d2639] hover:bg-[#222c40] text-[11px] text-[#b6c0d4] transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Observações da Partida */}
        <div className="space-y-1.5">
          <label
            htmlFor="match-notes"
            className="block text-xs font-semibold text-[#f4f6fb]"
          >
            Resumo / Observações (Artilharia, conexão ou pedido de W.O.)
          </label>
          <textarea
            id="match-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Gols: Vini Jr (2x). Partida sem lag."
            className="w-full px-3 py-2 rounded-[4px] bg-[#161d2c] border border-[#222c40] text-xs text-[#f4f6fb] focus:border-[#ffdc2b] focus:outline-none"
          />
        </div>

        {/* Opções Operacionais (W.O. e Modo Super-Admin SPOOKY) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <label className="flex items-start gap-2.5 p-3 rounded-[4px] bg-[#161d2c] border border-[#222c40] cursor-pointer">
            <input
              type="checkbox"
              checked={requestWalkover}
              onChange={(e) => setRequestWalkover(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#ffdc2b]"
            />
            <span className="text-xs">
              <strong className="block text-[#f4f6fb]">
                Solicitar W.O. (3×0)
              </strong>
              <span className="text-[11px] text-[#78849e]">
                Adversário ausente após 15 min de tolerância.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-[4px] bg-[#133865]/30 border border-[#1c4d8a] cursor-pointer">
            <input
              type="checkbox"
              checked={actAsSuperAdmin}
              onChange={(e) => setActAsSuperAdmin(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#ffdc2b]"
            />
            <span className="text-xs">
              <strong className="flex items-center gap-1 text-[#ffdc2b]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Homologar como SPOOKY
              </strong>
              <span className="text-[11px] text-[#b6c0d4]">
                Aprova o placar na hora e recalcula a tabela no PostgreSQL.
              </span>
            </span>
          </label>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            role="status"
            className={`flex items-start gap-2.5 p-3.5 rounded-[4px] text-xs border ${
              feedback.type === "success"
                ? "bg-[#15a34a]/15 border-[#15a34a]/40 text-[#4ade80]"
                : "bg-[#be123c]/20 border-[#be123c]/50 text-[#fb7185]"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 px-4 py-2.5 rounded-[4px] bg-[#161d2c] hover:bg-[#1d2639] border border-[#222c40] text-xs font-medium text-[#b6c0d4]"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="min-h-11 px-5 py-2.5 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] disabled:opacity-50 text-[#0e1312] font-bold text-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {isPending
                ? "Gravando no PostgreSQL..."
                : actAsSuperAdmin
                ? "Salvar e Homologar Placar"
                : "Enviar Placar com Comprovante"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
