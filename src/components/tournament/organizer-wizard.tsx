"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { createTournamentAction } from "@/app/actions/tournament-actions";

export function OrganizerWizard() {
  const router = useRouter();
  const [name, setName] = useState("Copa Strike Arena — Semana #02");
  const [slug, setSlug] = useState("copa-strike-semana-02");
  const [game, setGame] = useState<"ea_fc" | "efootball">("ea_fc");
  const [platform, setPlatform] = useState<
    "ps5" | "xbox" | "pc" | "crossplay"
  >("crossplay");
  const [format, setFormat] = useState<
    | "round_robin"
    | "single_elimination"
    | "double_elimination"
    | "groups_playoffs"
  >("groups_playoffs");
  const [maxParticipants, setMaxParticipants] = useState(16);
  const [entryFeeBrl, setEntryFeeBrl] = useState(20);
  const [prizePoolBrl, setPrizePoolBrl] = useState(400);
  const [legsPerRound, setLegsPerRound] = useState<1 | 2>(2);
  const [finalTwoLegs, setFinalTwoLegs] = useState<boolean>(false);
  const [thirdPlaceMatch, setThirdPlaceMatch] = useState<boolean>(false);
  const [groupTurns, setGroupTurns] = useState<1 | 2>(1);
  const [qualifiedPerGroup, setQualifiedPerGroup] = useState<number>(2);
  const [rulesMarkdown, setRulesMarkdown] = useState(
    "1. Partidas de 6 minutos. 2. Check-in até 15 minutos antes do horário. 3. Obrigatório envio de print do placar na Match Hub."
  );

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleNameChange(val: string) {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const res = await createTournamentAction({
        name,
        slug,
        game,
        platform,
        format,
        maxParticipants,
        entryFeeBrl,
        prizePoolBrl,
        rulesMarkdown,
        legsPerRound,
        finalTwoLegs,
        thirdPlaceMatch,
        groupTurns,
        qualifiedPerGroup,
      });

      if (res.ok && res.slug) {
        setFeedback({
          type: "success",
          text: res.message ?? "Torneio criado!",
        });
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          text: res.error ?? "Falha ao criar torneio.",
        });
      }
    });
  }

  return (
    <div className="bg-[#111622] border border-[#222c40] rounded-[4px] p-6 space-y-5">
      <div className="border-b border-[#222c40] pb-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-[#ffdc2b] font-semibold">
            Wizard de Criação Rápida
          </span>
          <h2 className="text-lg font-bold text-[#f4f6fb]">
            Novo Campeonato / Liga
          </h2>
        </div>
        <Sparkles className="w-4 h-4 text-[#ffdc2b]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#f4f6fb]">
              Nome do Torneio
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full min-h-10 px-3 py-2 rounded-[4px] bg-[#161d2c] border border-[#222c40] text-xs text-[#f4f6fb] focus:border-[#ffdc2b] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#f4f6fb]">
              Slug da URL (/tournaments/...)
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full min-h-10 px-3 py-2 rounded-[4px] bg-[#161d2c] border border-[#222c40] text-xs text-[#ffdc2b] focus:border-[#ffdc2b] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#f4f6fb]">
              Jogo
            </label>
            <select
              value={game}
              onChange={(e) => setGame(e.target.value as "ea_fc" | "efootball")}
              className="w-full min-h-10 px-3 py-2 rounded-[4px] bg-[#161d2c] border border-[#222c40] text-xs text-[#f4f6fb]"
            >
              <option value="ea_fc">EA SPORTS FC 26</option>
              <option value="efootball">eFootball 2026</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#f4f6fb]">
              Plataforma
            </label>
            <select
              value={platform}
              onChange={(e) =>
                setPlatform(
                  e.target.value as "ps5" | "xbox" | "pc" | "crossplay"
                )
              }
              className="w-full min-h-10 px-3 py-2 rounded-[4px] bg-[#161d2c] border border-[#222c40] text-xs text-[#f4f6fb]"
            >
              <option value="crossplay">Crossplay (PS5 / Xbox / PC)</option>
              <option value="ps5">PlayStation 5</option>
              <option value="xbox">Xbox Series X|S</option>
              <option value="pc">PC</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#f4f6fb]">
              Formato da Chave
            </label>
            <select
              value={format}
              onChange={(e) =>
                setFormat(
                  e.target.value as
                    | "round_robin"
                    | "single_elimination"
                    | "double_elimination"
                    | "groups_playoffs"
                )
              }
              className="w-full min-h-10 px-3 py-2 rounded-[4px] bg-[#161d2c] border border-[#222c40] text-xs text-[#f4f6fb]"
            >
              <option value="groups_playoffs">Fase de Grupos + Playoffs</option>
              <option value="round_robin">Pontos Corridos (Liga)</option>
              <option value="single_elimination">Mata-Mata Simples</option>
              <option value="double_elimination">Eliminação Dupla</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#161d2c]/70 border border-[#222c40] rounded-[4px] p-3">
          {format !== "round_robin" && (
            <>
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#b6c0d4]">
                  Fases do Mata-Mata
                </label>
                <select
                  value={legsPerRound}
                  onChange={(e) =>
                    setLegsPerRound(Number(e.target.value) as 1 | 2)
                  }
                  className="w-full min-h-9 px-2.5 py-1.5 rounded-[4px] bg-[#111622] border border-[#222c40] text-xs text-[#ffdc2b] font-semibold"
                >
                  <option value={2}>Ida e Volta (2 jogos)</option>
                  <option value={1}>Jogo Único (1 jogo)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#b6c0d4]">
                  Grande Final
                </label>
                <select
                  value={finalTwoLegs ? "2" : "1"}
                  onChange={(e) => setFinalTwoLegs(e.target.value === "2")}
                  className="w-full min-h-9 px-2.5 py-1.5 rounded-[4px] bg-[#111622] border border-[#222c40] text-xs text-[#f4f6fb]"
                >
                  <option value="1">Jogo Único (Campo Neutro)</option>
                  <option value="2">Ida e Volta (2 jogos)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#b6c0d4]">
                  Disputa de 3º Lugar
                </label>
                <select
                  value={thirdPlaceMatch ? "yes" : "no"}
                  onChange={(e) => setThirdPlaceMatch(e.target.value === "yes")}
                  className="w-full min-h-9 px-2.5 py-1.5 rounded-[4px] bg-[#111622] border border-[#222c40] text-xs text-[#f4f6fb]"
                >
                  <option value="no">Não</option>
                  <option value="yes">Sim (Jogo Único)</option>
                </select>
              </div>
            </>
          )}

          {(format === "groups_playoffs" || format === "round_robin") && (
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-[#b6c0d4]">
                Turnos (Grupos/Liga)
              </label>
              <select
                value={groupTurns}
                onChange={(e) => setGroupTurns(Number(e.target.value) as 1 | 2)}
                className="w-full min-h-9 px-2.5 py-1.5 rounded-[4px] bg-[#111622] border border-[#222c40] text-xs text-[#f4f6fb]"
              >
                <option value={1}>Turno Único</option>
                <option value={2}>Turno e Returno (Ida e Volta)</option>
              </select>
            </div>
          )}

          {format === "groups_playoffs" && (
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-[#b6c0d4]">
                Classificados por Grupo
              </label>
              <select
                value={qualifiedPerGroup}
                onChange={(e) => setQualifiedPerGroup(Number(e.target.value))}
                className="w-full min-h-9 px-2.5 py-1.5 rounded-[4px] bg-[#111622] border border-[#222c40] text-xs text-[#f4f6fb]"
              >
                <option value={1}>Top 1 por grupo</option>
                <option value={2}>Top 2 por grupo</option>
                <option value={4}>Top 4 por grupo</option>
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 tabular-nums">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#f4f6fb]">
              Máx. Participantes
            </label>
            <input
              type="number"
              min={4}
              max={128}
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
              className="w-full min-h-10 px-3 py-2 rounded-[4px] bg-[#161d2c] border border-[#222c40] text-xs text-[#f4f6fb]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#f4f6fb]">
              Taxa de Inscrição (R$)
            </label>
            <input
              type="number"
              min={0}
              value={entryFeeBrl}
              onChange={(e) => setEntryFeeBrl(Number(e.target.value))}
              className="w-full min-h-10 px-3 py-2 rounded-[4px] bg-[#161d2c] border border-[#222c40] text-xs text-[#f4f6fb]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#f4f6fb]">
              Premiação Total (R$)
            </label>
            <input
              type="number"
              min={0}
              value={prizePoolBrl}
              onChange={(e) => setPrizePoolBrl(Number(e.target.value))}
              className="w-full min-h-10 px-3 py-2 rounded-[4px] bg-[#161d2c] border border-[#222c40] text-xs text-[#ffdc2b] font-bold"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#f4f6fb]">
            Regulamento Base (Markdown)
          </label>
          <textarea
            rows={3}
            value={rulesMarkdown}
            onChange={(e) => setRulesMarkdown(e.target.value)}
            className="w-full px-3 py-2 rounded-[4px] bg-[#161d2c] border border-[#222c40] text-xs text-[#f4f6fb]"
          />
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-[4px] text-xs flex items-center gap-2 border ${
              feedback.type === "success"
                ? "bg-[#15a34a]/15 border-[#15a34a]/40 text-[#4ade80]"
                : "bg-[#be123c]/20 border-[#be123c]/50 text-[#fb7185]"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full min-h-11 px-5 py-2.5 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>
            {isPending
              ? "Publicando torneio..."
              : "Criar e Publicar Torneio"}
          </span>
        </button>
      </form>
    </div>
  );
}
