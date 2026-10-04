"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";
import {
  Sparkles,
  Save,
  RotateCcw,
  Wand2,
  ArrowLeftRight,
  UserPlus,
  X,
  Check,
  Shield,
  Users,
  Info,
} from "lucide-react";
import type {
  ClubTeamDTO,
  ContractRosterItemDTO,
} from "@/lib/master-league-data";
import { saveClubTacticalLineupAction } from "@/app/actions/master-league-actions";

interface SlotDef {
  key: string;
  label: string;
  preferredPositions: string[];
  x: number; // % horizontal (0 = left, 100 = right)
  y: number; // % vertical (0 = top/attack, 100 = bottom/GK)
}

interface FormationDef {
  id: string;
  name: string;
  shortLabel: string;
  slots: SlotDef[];
}

export const TACTICAL_FORMATIONS: FormationDef[] = [
  {
    id: "4-3-3",
    name: "4-3-3 Ofensivo",
    shortLabel: "4-3-3",
    slots: [
      { key: "GK", label: "GOL", preferredPositions: ["GOL"], x: 50, y: 88 },
      { key: "LB", label: "LE", preferredPositions: ["LE", "ZAG"], x: 16, y: 69 },
      { key: "LCB", label: "ZAG", preferredPositions: ["ZAG", "VOL"], x: 38, y: 72 },
      { key: "RCB", label: "ZAG", preferredPositions: ["ZAG", "VOL"], x: 62, y: 72 },
      { key: "RB", label: "LD", preferredPositions: ["LD", "ZAG"], x: 84, y: 69 },
      { key: "CDM", label: "VOL", preferredPositions: ["VOL", "MC"], x: 50, y: 52 },
      { key: "LCM", label: "MC", preferredPositions: ["MC", "MEI", "VOL"], x: 29, y: 43 },
      { key: "RCM", label: "MEI", preferredPositions: ["MEI", "MC", "VOL"], x: 71, y: 43 },
      { key: "LW", label: "PE", preferredPositions: ["PE", "MEI", "ATA"], x: 20, y: 20 },
      { key: "ST", label: "ATA", preferredPositions: ["ATA", "PE", "PD"], x: 50, y: 14 },
      { key: "RW", label: "PD", preferredPositions: ["PD", "MEI", "ATA"], x: 80, y: 20 },
    ],
  },
  {
    id: "4-4-2",
    name: "4-4-2 Clássico",
    shortLabel: "4-4-2",
    slots: [
      { key: "GK", label: "GOL", preferredPositions: ["GOL"], x: 50, y: 88 },
      { key: "LB", label: "LE", preferredPositions: ["LE", "ZAG"], x: 16, y: 70 },
      { key: "LCB", label: "ZAG", preferredPositions: ["ZAG", "VOL"], x: 38, y: 73 },
      { key: "RCB", label: "ZAG", preferredPositions: ["ZAG", "VOL"], x: 62, y: 73 },
      { key: "RB", label: "LD", preferredPositions: ["LD", "ZAG"], x: 84, y: 70 },
      { key: "LM", label: "PE", preferredPositions: ["PE", "MEI", "LE", "MC"], x: 17, y: 44 },
      { key: "LCM", label: "VOL", preferredPositions: ["VOL", "MC"], x: 39, y: 48 },
      { key: "RCM", label: "MC", preferredPositions: ["MC", "MEI", "VOL"], x: 61, y: 48 },
      { key: "RM", label: "PD", preferredPositions: ["PD", "MEI", "LD", "MC"], x: 83, y: 44 },
      { key: "LST", label: "ATA", preferredPositions: ["ATA", "PE", "MEI"], x: 37, y: 17 },
      { key: "RST", label: "ATA", preferredPositions: ["ATA", "PD", "MEI"], x: 63, y: 17 },
    ],
  },
  {
    id: "4-2-3-1",
    name: "4-2-3-1 Moderno",
    shortLabel: "4-2-3-1",
    slots: [
      { key: "GK", label: "GOL", preferredPositions: ["GOL"], x: 50, y: 88 },
      { key: "LB", label: "LE", preferredPositions: ["LE", "ZAG"], x: 16, y: 71 },
      { key: "LCB", label: "ZAG", preferredPositions: ["ZAG", "VOL"], x: 38, y: 74 },
      { key: "RCB", label: "ZAG", preferredPositions: ["ZAG", "VOL"], x: 62, y: 74 },
      { key: "RB", label: "LD", preferredPositions: ["LD", "ZAG"], x: 84, y: 71 },
      { key: "LCDM", label: "VOL", preferredPositions: ["VOL", "MC"], x: 37, y: 54 },
      { key: "RCDM", label: "VOL", preferredPositions: ["MC", "VOL"], x: 63, y: 54 },
      { key: "LAM", label: "PE", preferredPositions: ["PE", "MEI", "ATA"], x: 20, y: 33 },
      { key: "CAM", label: "MEI", preferredPositions: ["MEI", "MC", "ATA"], x: 50, y: 35 },
      { key: "RAM", label: "PD", preferredPositions: ["PD", "MEI", "ATA"], x: 80, y: 33 },
      { key: "ST", label: "ATA", preferredPositions: ["ATA", "PE", "PD"], x: 50, y: 14 },
    ],
  },
  {
    id: "3-5-2",
    name: "3-5-2 Controle",
    shortLabel: "3-5-2",
    slots: [
      { key: "GK", label: "GOL", preferredPositions: ["GOL"], x: 50, y: 88 },
      { key: "LCB", label: "ZAG", preferredPositions: ["ZAG", "LE"], x: 26, y: 72 },
      { key: "CCB", label: "ZAG", preferredPositions: ["ZAG", "VOL"], x: 50, y: 74 },
      { key: "RCB", label: "ZAG", preferredPositions: ["ZAG", "LD"], x: 74, y: 72 },
      { key: "LWB", label: "LE", preferredPositions: ["LE", "PE", "MC"], x: 15, y: 46 },
      { key: "LCDM", label: "VOL", preferredPositions: ["VOL", "MC"], x: 36, y: 52 },
      { key: "CAM", label: "MEI", preferredPositions: ["MEI", "MC"], x: 50, y: 37 },
      { key: "RCDM", label: "MC", preferredPositions: ["MC", "VOL"], x: 64, y: 52 },
      { key: "RWB", label: "LD", preferredPositions: ["LD", "PD", "MC"], x: 85, y: 46 },
      { key: "LST", label: "ATA", preferredPositions: ["ATA", "PE", "MEI"], x: 37, y: 16 },
      { key: "RST", label: "ATA", preferredPositions: ["ATA", "PD", "MEI"], x: 63, y: 16 },
    ],
  },
  {
    id: "4-1-2-1-2",
    name: "4-1-2-1-2 Losango",
    shortLabel: "4-1-2-1-2",
    slots: [
      { key: "GK", label: "GOL", preferredPositions: ["GOL"], x: 50, y: 88 },
      { key: "LB", label: "LE", preferredPositions: ["LE", "ZAG"], x: 16, y: 71 },
      { key: "LCB", label: "ZAG", preferredPositions: ["ZAG", "VOL"], x: 38, y: 74 },
      { key: "RCB", label: "ZAG", preferredPositions: ["ZAG", "VOL"], x: 62, y: 74 },
      { key: "RB", label: "LD", preferredPositions: ["LD", "ZAG"], x: 84, y: 71 },
      { key: "CDM", label: "VOL", preferredPositions: ["VOL", "MC"], x: 50, y: 57 },
      { key: "LCM", label: "MC", preferredPositions: ["MC", "PE", "MEI"], x: 27, y: 44 },
      { key: "RCM", label: "MC", preferredPositions: ["MC", "PD", "MEI"], x: 73, y: 44 },
      { key: "CAM", label: "MEI", preferredPositions: ["MEI", "MC", "ATA"], x: 50, y: 31 },
      { key: "LST", label: "ATA", preferredPositions: ["ATA", "PE"], x: 37, y: 15 },
      { key: "RST", label: "ATA", preferredPositions: ["ATA", "PD"], x: 63, y: 15 },
    ],
  },
];

function computeAutoLineup(
  formation: FormationDef,
  roster: ContractRosterItemDTO[]
): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  const usedAthleteIds = new Set<string>();
  const sortedRoster = [...roster].sort((a, b) => b.overall - a.overall);

  // Pass 1: exact primary position match (index 0 of preferredPositions)
  for (const slot of formation.slots) {
    const primaryPos = slot.preferredPositions[0];
    const match = sortedRoster.find(
      (p) => !usedAthleteIds.has(p.athleteId) && p.position === primaryPos
    );
    if (match) {
      result[slot.key] = match.athleteId;
      usedAthleteIds.add(match.athleteId);
    }
  }

  // Pass 2: secondary compatible positions
  for (const slot of formation.slots) {
    if (result[slot.key]) continue;
    const match = sortedRoster.find(
      (p) =>
        !usedAthleteIds.has(p.athleteId) &&
        slot.preferredPositions.includes(p.position)
    );
    if (match) {
      result[slot.key] = match.athleteId;
      usedAthleteIds.add(match.athleteId);
    }
  }

  // Pass 3: fill any remaining empty slot with highest overall available player
  for (const slot of formation.slots) {
    if (result[slot.key]) continue;
    const match = sortedRoster.find((p) => !usedAthleteIds.has(p.athleteId));
    if (match) {
      result[slot.key] = match.athleteId;
      usedAthleteIds.add(match.athleteId);
    } else {
      result[slot.key] = null;
    }
  }

  return result;
}

function getShortPlayerName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName;
  const last = parts[parts.length - 1];
  if (last.toLowerCase() === "jr." || last.toLowerCase() === "júnior") {
    return `${parts[0]} ${last}`;
  }
  if (fullName.length <= 13) return fullName;
  return last.length >= 3 ? last : `${parts[0][0]}. ${last}`;
}

interface TacticalPitchBuilderProps {
  club: ClubTeamDTO;
  roster: ContractRosterItemDTO[];
  onSavedFeedback?: (fb: { ok: boolean; text: string }) => void;
}

export function TacticalPitchBuilder({
  club,
  roster,
  onSavedFeedback,
}: TacticalPitchBuilderProps) {
  const storageKey = `strike_arena_lineup_${club.id}`;

  const [formationId, setFormationId] = useState<string>(
    club.tacticalLineup?.formation || "4-3-3"
  );
  const [slotsMap, setSlotsMap] = useState<Record<string, string | null>>({});
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);
  const [pickerModalSlotKey, setPickerModalSlotKey] = useState<string | null>(
    null
  );
  const [isPending, startTransition] = useTransition();
  const [localSavedMessage, setLocalSavedMessage] = useState<string | null>(
    null
  );

  const activeFormation = useMemo(
    () =>
      TACTICAL_FORMATIONS.find((f) => f.id === formationId) ||
      TACTICAL_FORMATIONS[0],
    [formationId]
  );

  const rosterByAthleteId = useMemo(() => {
    const map = new Map<string, ContractRosterItemDTO>();
    for (const item of roster) {
      map.set(item.athleteId, item);
    }
    return map;
  }, [roster]);

  // Load initial lineup from DB or localStorage, or auto-fill if empty
  useEffect(() => {
    let loadedFormation = club.tacticalLineup?.formation || "4-3-3";
    let loadedSlots: Record<string, string | null> | null =
      club.tacticalLineup?.slots &&
      Object.keys(club.tacticalLineup.slots).length > 0
        ? club.tacticalLineup.slots
        : null;

    if (!loadedSlots && typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.formation) loadedFormation = parsed.formation;
          if (parsed?.slots && Object.keys(parsed.slots).length > 0) {
            loadedSlots = parsed.slots;
          }
        }
      } catch {
        // ignore storage errors
      }
    }

    const targetFormation =
      TACTICAL_FORMATIONS.find((f) => f.id === loadedFormation) ||
      TACTICAL_FORMATIONS[0];

    setFormationId(targetFormation.id);

    // Filter out any athleteIds that are no longer in the club's roster
    if (loadedSlots) {
      const validIds = new Set(roster.map((r) => r.athleteId));
      const cleaned: Record<string, string | null> = {};
      let validCount = 0;
      for (const slot of targetFormation.slots) {
        const aid = loadedSlots[slot.key];
        if (aid && validIds.has(aid)) {
          cleaned[slot.key] = aid;
          validCount++;
        } else {
          cleaned[slot.key] = null;
        }
      }
      if (validCount > 0) {
        setSlotsMap(cleaned);
        setSelectedSlotKey(null);
        return;
      }
    }

    // Auto-lineup by default if club has players and no saved lineup yet
    if (roster.length > 0) {
      setSlotsMap(computeAutoLineup(targetFormation, roster));
    } else {
      setSlotsMap({});
    }
    setSelectedSlotKey(null);
  }, [club.id, club.tacticalLineup, roster, storageKey]);

  function persistLocal(
    nextFormationId: string,
    nextSlots: Record<string, string | null>
  ) {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({
            formation: nextFormationId,
            slots: nextSlots,
            updatedAt: new Date().toISOString(),
          })
        );
      } catch {
        // ignore
      }
    }
  }

  function handleFormationChange(newFormationId: string) {
    const nextFormation =
      TACTICAL_FORMATIONS.find((f) => f.id === newFormationId) ||
      TACTICAL_FORMATIONS[0];

    // Re-run smart auto-assignment using currently starting players first, then bench
    const currentStarterIds = new Set(
      Object.values(slotsMap).filter((x): x is string => Boolean(x))
    );
    const startersFirst = [
      ...roster.filter((r) => currentStarterIds.has(r.athleteId)),
      ...roster.filter((r) => !currentStarterIds.has(r.athleteId)),
    ];

    const remapped = computeAutoLineup(nextFormation, startersFirst);
    setFormationId(nextFormation.id);
    setSlotsMap(remapped);
    setSelectedSlotKey(null);
    persistLocal(nextFormation.id, remapped);
  }

  function handleAutoLineup() {
    const next = computeAutoLineup(activeFormation, roster);
    setSlotsMap(next);
    setSelectedSlotKey(null);
    persistLocal(activeFormation.id, next);
    setLocalSavedMessage("⚡ Força Máxima escalada automaticamente!");
    setTimeout(() => setLocalSavedMessage(null), 3500);
  }

  function handleClearPitch() {
    const empty: Record<string, string | null> = {};
    for (const s of activeFormation.slots) {
      empty[s.key] = null;
    }
    setSlotsMap(empty);
    setSelectedSlotKey(null);
    persistLocal(activeFormation.id, empty);
  }

  function handleSlotClick(slotKey: string) {
    // If no slot is currently selected:
    if (!selectedSlotKey) {
      const hasPlayer = Boolean(slotsMap[slotKey]);
      if (!hasPlayer) {
        // Empty slot clicked -> open player picker modal directly
        setPickerModalSlotKey(slotKey);
      } else {
        // Select this slot for quick swap OR open picker
        setSelectedSlotKey(slotKey);
      }
      return;
    }

    // Clicking the same slot again opens the player picker modal to swap with bench/any player
    if (selectedSlotKey === slotKey) {
      setPickerModalSlotKey(slotKey);
      setSelectedSlotKey(null);
      return;
    }

    // Clicking another slot swaps the two slots on the pitch!
    const next = { ...slotsMap };
    const temp = next[selectedSlotKey] ?? null;
    next[selectedSlotKey] = next[slotKey] ?? null;
    next[slotKey] = temp;
    setSlotsMap(next);
    setSelectedSlotKey(null);
    persistLocal(activeFormation.id, next);
  }

  function handleAssignAthleteToSlot(slotKey: string, athleteId: string | null) {
    const next = { ...slotsMap };

    if (athleteId) {
      // If this athlete is already in another slot, swap them
      const existingSlotKey = Object.keys(next).find(
        (k) => next[k] === athleteId
      );
      if (existingSlotKey && existingSlotKey !== slotKey) {
        next[existingSlotKey] = next[slotKey] ?? null;
      }
    }

    next[slotKey] = athleteId;
    setSlotsMap(next);
    setPickerModalSlotKey(null);
    setSelectedSlotKey(null);
    persistLocal(activeFormation.id, next);
  }

  function handleBenchPlayerClick(athleteId: string) {
    // If a slot on the pitch is selected, put this bench player right into that slot!
    if (selectedSlotKey) {
      handleAssignAthleteToSlot(selectedSlotKey, athleteId);
      return;
    }
    // Otherwise, if there's an empty slot matching their position (or any empty slot), fill it
    const athlete = rosterByAthleteId.get(athleteId);
    if (!athlete) return;

    const emptyCompatibleSlot =
      activeFormation.slots.find(
        (s) =>
          !slotsMap[s.key] && s.preferredPositions.includes(athlete.position)
      ) || activeFormation.slots.find((s) => !slotsMap[s.key]);

    if (emptyCompatibleSlot) {
      handleAssignAthleteToSlot(emptyCompatibleSlot.key, athleteId);
    } else {
      // All 11 slots full: select a compatible slot or open picker hint
      const compatibleSlot =
        activeFormation.slots.find(
          (s) => s.preferredPositions[0] === athlete.position
        ) ||
        activeFormation.slots.find((s) =>
          s.preferredPositions.includes(athlete.position)
        ) ||
        activeFormation.slots[0];

      if (compatibleSlot) {
        handleAssignAthleteToSlot(compatibleSlot.key, athleteId);
      }
    }
  }

  function handleSaveLineupToServer() {
    persistLocal(activeFormation.id, slotsMap);
    startTransition(async () => {
      const res = await saveClubTacticalLineupAction({
        clubTeamId: club.id,
        formation: activeFormation.id,
        slots: slotsMap,
      });
      if (res.ok) {
        setLocalSavedMessage(res.message || "Escalação salva com sucesso!");
        onSavedFeedback?.({ ok: true, text: res.message! });
        setTimeout(() => setLocalSavedMessage(null), 4000);
      } else {
        onSavedFeedback?.({
          ok: false,
          text: res.error || "Erro ao salvar escalação.",
        });
      }
    });
  }

  const assignedAthleteIds = useMemo(() => {
    const set = new Set<string>();
    for (const slot of activeFormation.slots) {
      const aid = slotsMap[slot.key];
      if (aid && rosterByAthleteId.has(aid)) {
        set.add(aid);
      }
    }
    return set;
  }, [activeFormation.slots, slotsMap, rosterByAthleteId]);

  const startersList = useMemo(() => {
    return activeFormation.slots
      .map((s) => {
        const aid = slotsMap[s.key];
        return aid ? rosterByAthleteId.get(aid) || null : null;
      })
      .filter((x): x is ContractRosterItemDTO => Boolean(x));
  }, [activeFormation.slots, slotsMap, rosterByAthleteId]);

  const benchList = useMemo(() => {
    return roster.filter((r) => !assignedAthleteIds.has(r.athleteId));
  }, [roster, assignedAthleteIds]);

  const teamAverageOvr = useMemo(() => {
    if (startersList.length === 0) return 0;
    const sum = startersList.reduce((acc, p) => acc + p.overall, 0);
    return Math.round(sum / startersList.length);
  }, [startersList]);

  const pickerSlotDef = useMemo(() => {
    if (!pickerModalSlotKey) return null;
    return (
      activeFormation.slots.find((s) => s.key === pickerModalSlotKey) || null
    );
  }, [pickerModalSlotKey, activeFormation.slots]);

  return (
    <div className="bg-[#111622] border border-[#222c40] rounded-[4px] overflow-hidden">
      {/* Top Header of Tactical Pitch */}
      <div className="p-3.5 sm:p-4 border-b border-[#222c40] flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#0c1018]">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#f4f6fb] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80] animate-pulse" />
                <span>Campinho Virtual • Escalação Tática</span>
              </h2>
              <span className="px-2 py-0.5 rounded-[3px] text-[11px] font-extrabold bg-[#ffdc2b] text-[#0e1312] tabular-nums">
                OVR Time: {teamAverageOvr || "—"}
              </span>
              <span
                className={`px-2 py-0.5 rounded-[3px] text-[11px] font-bold border tabular-nums ${
                  startersList.length === 11
                    ? "bg-[#15a34a]/20 text-[#4ade80] border-[#15a34a]/40"
                    : "bg-[#161d2c] text-[#b6c0d4] border-[#2c3852]"
                }`}
              >
                {startersList.length}/11 Titulares
              </span>
            </div>
            <p className="text-[11px] text-[#78849e] mt-0.5">
              Toque em qualquer posição no gramado para escalar, trocar de lugar
              ou substituir pelos reservas do seu elenco.
            </p>
          </div>
        </div>

        {/* Controls: Formation Selector + Auto-Lineup + Save */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Formation Pills */}
          <div className="flex items-center bg-[#111622] p-1 rounded-[4px] border border-[#222c40] overflow-x-auto max-w-full">
            {TACTICAL_FORMATIONS.map((f) => {
              const active = f.id === activeFormation.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleFormationChange(f.id)}
                  className={`px-2.5 py-1.5 rounded-[3px] text-[11px] font-extrabold whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? "bg-[#ffdc2b] text-[#0e1312]"
                      : "text-[#9aa5b8] hover:text-[#f4f6fb]"
                  }`}
                >
                  {f.shortLabel}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAutoLineup}
            disabled={roster.length === 0}
            className="h-9 px-3 rounded-[4px] bg-[#161d2c] hover:bg-[#1e273b] border border-[#2c3852] text-[11px] font-extrabold text-[#f4f6fb] inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
            title="Escalar automaticamente os melhores jogadores por posição"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#ffdc2b]" />
            <span>Auto-Escalar</span>
          </button>

          <button
            type="button"
            onClick={handleClearPitch}
            disabled={startersList.length === 0}
            className="h-9 px-2.5 rounded-[4px] bg-[#161d2c] hover:bg-[#1e273b] border border-[#2c3852] text-[11px] font-bold text-[#9aa5b8] hover:text-[#f87171] inline-flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
            title="Limpar campo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar</span>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={handleSaveLineupToServer}
            className="h-9 px-3.5 rounded-[4px] bg-[#15a34a] hover:bg-[#16a34a]/90 text-white text-[11px] font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isPending ? "Salvando..." : "Salvar Time"}</span>
          </button>
        </div>
      </div>

      {/* Status / Swap Helper Bar */}
      {(selectedSlotKey || localSavedMessage) && (
        <div className="px-4 py-2 bg-[#133865]/40 border-b border-[#1c4d8a] flex items-center justify-between gap-2 text-xs">
          {selectedSlotKey ? (
            <div className="flex items-center gap-2 text-[#f4f6fb] font-semibold">
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#ffdc2b] shrink-0" />
              <span>
                Posição{" "}
                <strong className="text-[#ffdc2b]">
                  {
                    activeFormation.slots.find((s) => s.key === selectedSlotKey)
                      ?.label
                  }
                </strong>{" "}
                selecionada: toque em outro jogador do campo/reserva para{" "}
                <strong>trocar</strong>, ou toque novamente nele para{" "}
                <strong>abrir a lista</strong>.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#4ade80] font-bold">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{localSavedMessage}</span>
            </div>
          )}
          {selectedSlotKey && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setPickerModalSlotKey(selectedSlotKey);
                  setSelectedSlotKey(null);
                }}
                className="px-2.5 py-1 rounded-[3px] bg-[#ffdc2b] text-[#0e1312] font-extrabold text-[11px] cursor-pointer"
              >
                Trocar Atleta
              </button>
              <button
                type="button"
                onClick={() => setSelectedSlotKey(null)}
                className="text-[#9aa5b8] hover:text-white text-[11px] underline cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Content: Pitch on Left (or Top on Mobile) + Bench / Squad Selector on Right */}
      <div className="p-3 sm:p-5 grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* SOCCER PITCH (7 cols on XL) */}
        <div className="xl:col-span-7 flex flex-col items-center">
          <div
            className="relative w-full max-w-[560px] aspect-[3/4] sm:aspect-[4/4.6] rounded-[8px] overflow-hidden border-2 border-[#2a4d37] shadow-2xl select-none"
            style={{
              background:
                "repeating-linear-gradient(180deg, #14532d 0%, #14532d 10%, #166534 10%, #166534 20%)",
            }}
          >
            {/* Subtle radial vignette for stadium spotlight */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, transparent 55%, rgba(6, 20, 12, 0.55) 100%)",
              }}
            />

            {/* Field White Lines SVG */}
            <svg
              viewBox="0 0 300 400"
              className="absolute inset-0 w-full h-full pointer-events-none opacity-45"
              preserveAspectRatio="none"
            >
              {/* Outer boundary */}
              <rect
                x="12"
                y="12"
                width="276"
                height="376"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
              />
              {/* Halfway line */}
              <line
                x1="12"
                y1="200"
                x2="288"
                y2="200"
                stroke="#ffffff"
                strokeWidth="2"
              />
              {/* Center circle & spot */}
              <circle
                cx="150"
                cy="200"
                r="38"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <circle cx="150" cy="200" r="3" fill="#ffffff" />

              {/* Top Penalty Area (Attack) */}
              <rect
                x="68"
                y="12"
                width="164"
                height="58"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
              />
              {/* Top Goal Area */}
              <rect
                x="106"
                y="12"
                width="88"
                height="22"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
              />
              {/* Top Penalty Spot & Arc */}
              <circle cx="150" cy="52" r="2.5" fill="#ffffff" />
              <path
                d="M 118 70 A 34 34 0 0 0 182 70"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
              />

              {/* Bottom Penalty Area (Defense / GK) */}
              <rect
                x="68"
                y="330"
                width="164"
                height="58"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
              />
              {/* Bottom Goal Area */}
              <rect
                x="106"
                y="366"
                width="88"
                height="22"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
              />
              {/* Bottom Penalty Spot & Arc */}
              <circle cx="150" cy="348" r="2.5" fill="#ffffff" />
              <path
                d="M 118 330 A 34 34 0 0 1 182 330"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
              />

              {/* Corner Arcs */}
              <path
                d="M 12 22 A 10 10 0 0 0 22 12"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <path
                d="M 278 12 A 10 10 0 0 0 288 22"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <path
                d="M 12 378 A 10 10 0 0 1 22 388"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <path
                d="M 278 388 A 10 10 0 0 1 288 378"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </svg>

            {/* Watermark Formation & Club */}
            <div className="absolute top-3.5 left-4 pointer-events-none flex items-center gap-1.5 opacity-80">
              <span className="px-2 py-0.5 rounded-[3px] bg-black/50 backdrop-blur-xs border border-white/15 text-[10px] font-extrabold text-white uppercase tracking-wider">
                {club.acronym} • {activeFormation.name}
              </span>
            </div>

            {/* 11 POSITIONAL SLOTS */}
            {activeFormation.slots.map((slot) => {
              const athleteId = slotsMap[slot.key] ?? null;
              const player = athleteId
                ? rosterByAthleteId.get(athleteId) ?? null
                : null;
              const isSelected = selectedSlotKey === slot.key;
              const isOutPosition =
                player && !slot.preferredPositions.includes(player.position);

              return (
                <button
                  key={slot.key}
                  type="button"
                  onClick={() => handleSlotClick(slot.key)}
                  style={{
                    left: `${slot.x}%`,
                    top: `${slot.y}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer transition-transform duration-150 ${
                    isSelected
                      ? "scale-110 z-30"
                      : "hover:scale-105 z-20"
                  }`}
                >
                  {player ? (
                    <>
                      {/* Player Card Avatar on Pitch */}
                      <div
                        className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#1e293b] to-[#090c12] border-2 shadow-lg flex items-center justify-center overflow-visible ${
                          isSelected
                            ? "border-[#ffdc2b] ring-4 ring-[#ffdc2b]/40"
                            : player.overall >= 90
                            ? "border-[#ffdc2b]"
                            : player.overall >= 85
                            ? "border-[#4ade80]"
                            : "border-[#60a5fa]"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={player.photoUrl}
                          alt={player.athleteName}
                          className="w-full h-full rounded-full object-contain object-bottom pt-0.5"
                        />

                        {/* OVR Pill Top-Right */}
                        <span
                          className={`absolute -top-1.5 -right-1.5 min-w-[22px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center shadow-md tabular-nums ${
                            player.overall >= 90
                              ? "bg-[#ffdc2b] text-[#090c12]"
                              : player.overall >= 85
                              ? "bg-[#15a34a] text-white"
                              : "bg-[#1e293b] text-white border border-white/30"
                          }`}
                        >
                          {player.overall}
                        </span>

                        {/* Position Badge Top-Left */}
                        <span
                          className={`absolute -top-1.5 -left-1.5 px-1 h-[16px] rounded-[3px] text-[8px] font-extrabold uppercase flex items-center justify-center shadow ${
                            isOutPosition
                              ? "bg-[#f59e0b] text-[#090c12]"
                              : "bg-[#090c12]/90 text-[#60a5fa] border border-[#2c3852]"
                          }`}
                          title={
                            isOutPosition
                              ? `Improvisado (${player.position} atuando em ${slot.label})`
                              : `Posição: ${slot.label}`
                          }
                        >
                          {slot.label}
                        </span>
                      </div>

                      {/* Player Name Plate */}
                      <div
                        className={`mt-1 px-1.5 py-0.5 rounded-[3px] max-w-[82px] sm:max-w-[96px] truncate text-[10px] sm:text-[11px] font-extrabold leading-tight shadow-md border ${
                          isSelected
                            ? "bg-[#ffdc2b] text-[#090c12] border-[#ffdc2b]"
                            : "bg-[#090c12]/90 text-[#f4f6fb] border-white/15"
                        }`}
                      >
                        {getShortPlayerName(player.athleteName)}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Empty Slot on Pitch */}
                      <div
                        className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 border-dashed flex flex-col items-center justify-center transition-colors shadow-md ${
                          isSelected
                            ? "bg-[#ffdc2b]/30 border-[#ffdc2b] text-[#ffdc2b]"
                            : "bg-[#090c12]/65 hover:bg-[#090c12]/85 border-white/40 text-white/85"
                        }`}
                      >
                        <UserPlus className="w-3.5 h-3.5 mb-0.5 opacity-80" />
                        <span className="text-[9px] font-extrabold uppercase leading-none">
                          {slot.label}
                        </span>
                      </div>
                      <span className="mt-1 px-1.5 py-0.5 rounded-[3px] bg-black/60 text-[9px] font-bold text-white/80">
                        Escalar
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* BENCH / RESERVES & SQUAD STATUS (5 cols on XL) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          {/* Quick Summary Card */}
          <div className="bg-[#0c1018] border border-[#1c2436] rounded-[4px] p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#f4f6fb] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#ffdc2b]" />
                <span>Resumo da Escalação</span>
              </span>
              <span className="text-[11px] font-bold text-[#9aa5b8]">
                Formação:{" "}
                <strong className="text-[#ffdc2b]">
                  {activeFormation.name}
                </strong>
              </span>
            </div>

            {roster.length === 0 ? (
              <div className="p-4 rounded-[4px] bg-[#111622] border border-[#222c40] text-center space-y-2">
                <p className="text-xs text-[#9aa5b8]">
                  Seu clube ainda não possui jogadores contratados para montar o
                  time no campinho.
                </p>
                <Link
                  href="/transfers"
                  className="inline-flex items-center justify-center h-9 px-4 rounded-[4px] bg-[#ffdc2b] text-[#090c12] font-extrabold text-xs"
                >
                  Ir para o Mercado Contratar →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-[4px] bg-[#111622] border border-[#1c2436]">
                  <div className="text-[10px] font-bold uppercase text-[#78849e]">
                    Titulares
                  </div>
                  <div className="text-base font-black text-[#4ade80] tabular-nums mt-0.5">
                    {startersList.length}/11
                  </div>
                </div>
                <div className="p-2 rounded-[4px] bg-[#111622] border border-[#1c2436]">
                  <div className="text-[10px] font-bold uppercase text-[#78849e]">
                    Reservas
                  </div>
                  <div className="text-base font-black text-[#60a5fa] tabular-nums mt-0.5">
                    {benchList.length}
                  </div>
                </div>
                <div className="p-2 rounded-[4px] bg-[#111622] border border-[#1c2436]">
                  <div className="text-[10px] font-bold uppercase text-[#78849e]">
                    Força (OVR)
                  </div>
                  <div className="text-base font-black text-[#ffdc2b] tabular-nums mt-0.5">
                    {teamAverageOvr || "—"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Banco de Reservas / Suplentes */}
          <div className="bg-[#0c1018] border border-[#1c2436] rounded-[4px] overflow-hidden flex flex-col">
            <div className="p-3 border-b border-[#1c2436] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#f4f6fb] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#60a5fa]" />
                  <span>Banco de Reservas ({benchList.length})</span>
                </h3>
                <p className="text-[11px] text-[#78849e]">
                  {selectedSlotKey
                    ? "Toque em um reserva abaixo para colocá-lo na posição selecionada"
                    : "Toque em um reserva para escalá-lo no time titular"}
                </p>
              </div>
            </div>

            <div className="p-2.5 space-y-1.5 max-h-[340px] overflow-y-auto">
              {benchList.length === 0 ? (
                <div className="py-6 px-3 text-center text-xs text-[#78849e]">
                  {roster.length <= 11
                    ? "Todos os jogadores do seu elenco já estão escalados em campo! Contrate mais atletas no Mercado para ter reservas."
                    : "Nenhum jogador no banco de reservas."}
                </div>
              ) : (
                benchList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleBenchPlayerClick(item.athleteId)}
                    className="p-2 rounded-[4px] bg-[#111622] hover:bg-[#161d2c] border border-[#1c2436] hover:border-[#2c3852] flex items-center justify-between gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.photoUrl}
                        alt={item.athleteName}
                        className="w-9 h-9 rounded-[4px] bg-[#090c12] border border-[#2c3852] object-contain object-bottom shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#f4f6fb] truncate">
                          {item.athleteName}
                        </div>
                        <div className="text-[10px] text-[#78849e] flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded-[2px] bg-[#161d2c] text-[#60a5fa] font-bold">
                            {item.position}
                          </span>
                          <span>• {item.defaultTeam}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`w-7 h-6 rounded-[3px] font-extrabold text-[11px] flex items-center justify-center tabular-nums ${
                          item.overall >= 90
                            ? "bg-[#ffdc2b] text-[#090c12]"
                            : item.overall >= 85
                            ? "bg-[#15a34a]/25 text-[#4ade80] border border-[#15a34a]/40"
                            : "bg-[#1d2639] text-[#f4f6fb]"
                        }`}
                      >
                        {item.overall}
                      </span>
                      <span className="px-2 py-1 rounded-[3px] bg-[#161d2c] border border-[#2c3852] text-[10px] font-extrabold text-[#ffdc2b]">
                        Escalar
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Instruction Footer */}
          <div className="p-3 rounded-[4px] bg-[#161d2c]/60 border border-[#222c40] flex items-start gap-2 text-[11px] text-[#9aa5b8]">
            <Info className="w-4 h-4 text-[#ffdc2b] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#f4f6fb]">Dica Tática:</strong> Você pode
              tocar em dois jogadores dentro do campo para inverter a posição
              deles instantaneamente, ou tocar duas vezes no mesmo jogador para
              escolher qualquer atleta do elenco.
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE ESCOLHA DE JOGADOR PARA A POSIÇÃO */}
      {pickerSlotDef && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-[#2c3852] rounded-[6px] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#222c40] flex items-center justify-between bg-[#0c1018]">
              <div>
                <h3 className="text-sm font-extrabold uppercase text-[#f4f6fb] flex items-center gap-2">
                  <span>Escalar Posição:</span>
                  <span className="px-2 py-0.5 rounded-[3px] bg-[#ffdc2b] text-[#090c12]">
                    {pickerSlotDef.label}
                  </span>
                </h3>
                <p className="text-[11px] text-[#78849e] mt-0.5">
                  Posições ideais:{" "}
                  {pickerSlotDef.preferredPositions.join(", ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickerModalSlotKey(null)}
                className="p-1.5 rounded-[4px] bg-[#161d2c] text-[#9aa5b8] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 max-h-[65vh] overflow-y-auto space-y-1.5">
              {slotsMap[pickerSlotDef.key] && (
                <button
                  type="button"
                  onClick={() =>
                    handleAssignAthleteToSlot(pickerSlotDef.key, null)
                  }
                  className="w-full p-2.5 rounded-[4px] bg-[#dc2626]/15 hover:bg-[#dc2626]/25 border border-[#dc2626]/40 text-xs font-bold text-[#f87171] flex items-center justify-center gap-2 cursor-pointer mb-2"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remover Jogador desta Posição (Mandar p/ Reserva)</span>
                </button>
              )}

              {roster.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#78849e]">
                  Nenhum jogador contratado no elenco.
                </div>
              ) : (
                [...roster]
                  .sort((a, b) => {
                    const aCompat = pickerSlotDef.preferredPositions.includes(
                      a.position
                    )
                      ? 1
                      : 0;
                    const bCompat = pickerSlotDef.preferredPositions.includes(
                      b.position
                    )
                      ? 1
                      : 0;
                    if (aCompat !== bCompat) return bCompat - aCompat;
                    return b.overall - a.overall;
                  })
                  .map((item) => {
                    const isCurrentInThisSlot =
                      slotsMap[pickerSlotDef.key] === item.athleteId;
                    const isStarterElsewhere =
                      !isCurrentInThisSlot &&
                      assignedAthleteIds.has(item.athleteId);
                    const isCompatible =
                      pickerSlotDef.preferredPositions.includes(item.position);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          handleAssignAthleteToSlot(
                            pickerSlotDef.key,
                            item.athleteId
                          )
                        }
                        className={`w-full p-2.5 rounded-[4px] border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                          isCurrentInThisSlot
                            ? "bg-[#ffdc2b]/15 border-[#ffdc2b]"
                            : "bg-[#0c1018] hover:bg-[#161d2c] border-[#1c2436]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.photoUrl}
                            alt={item.athleteName}
                            className="w-10 h-10 rounded-[4px] bg-[#111622] border border-[#2c3852] object-contain object-bottom shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold text-[#f4f6fb] truncate flex items-center gap-1.5">
                              <span>{item.athleteName}</span>
                              {isCurrentInThisSlot && (
                                <span className="px-1.5 py-0.2 rounded-[2px] bg-[#ffdc2b] text-[#090c12] text-[9px] font-black uppercase">
                                  Atual
                                </span>
                              )}
                              {isStarterElsewhere && (
                                <span className="px-1.5 py-0.2 rounded-[2px] bg-[#161d2c] text-[#9aa5b8] text-[9px] font-bold uppercase">
                                  Em campo
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#78849e] flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`px-1.5 py-0.2 rounded-[2px] font-bold ${
                                  isCompatible
                                    ? "bg-[#15a34a]/20 text-[#4ade80]"
                                    : "bg-[#161d2c] text-[#60a5fa]"
                                }`}
                              >
                                {item.position}
                              </span>
                              <span>
                                {isCompatible
                                  ? "• Posição compatível"
                                  : "• Improvisado"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`w-8 h-7 rounded-[3px] font-extrabold text-xs flex items-center justify-center tabular-nums ${
                              item.overall >= 90
                                ? "bg-[#ffdc2b] text-[#090c12]"
                                : item.overall >= 85
                                ? "bg-[#15a34a]/25 text-[#4ade80] border border-[#15a34a]/40"
                                : "bg-[#1d2639] text-[#f4f6fb]"
                            }`}
                          >
                            {item.overall}
                          </span>
                        </div>
                      </button>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
