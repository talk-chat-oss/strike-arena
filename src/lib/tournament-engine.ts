/**
 * Motor de torneios (funções puras, sem I/O).
 * Defaults adotados: desempate direto nos pênaltis (sem gols fora), final jogo único (configurável).
 */

export type KnockoutStage =
  | "round_of_32"
  | "round_of_16"
  | "quarterfinal"
  | "semifinal"
  | "final";

export const STAGE_LABELS: Record<KnockoutStage | "third_place", string> = {
  round_of_32: "16-avos de Final",
  round_of_16: "Oitavas de Final",
  quarterfinal: "Quartas de Final",
  semifinal: "Semifinal",
  final: "Final",
  third_place: "Disputa de 3º Lugar",
};

export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface RoundRobinFixture {
  round: number;
  home: string;
  away: string;
}

/** Algoritmo do círculo. `turns` = 1 (turno único) ou 2 (returno com mandos invertidos). */
export function roundRobin(ids: string[], turns: 1 | 2 = 1): RoundRobinFixture[] {
  const list: (string | null)[] = [...ids];
  if (list.length < 2) return [];
  if (list.length % 2 === 1) list.push(null);
  const n = list.length;
  const rounds = n - 1;
  const fixtures: RoundRobinFixture[] = [];
  let rotation = [...list];

  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < n / 2; i++) {
      const a = rotation[i];
      const b = rotation[n - 1 - i];
      if (a === null || b === null) continue;
      // alterna mandos para balancear
      const swap = (r + i) % 2 === 1;
      fixtures.push({
        round: r + 1,
        home: swap ? b : a,
        away: swap ? a : b,
      });
    }
    const [fixed, ...rest] = rotation;
    rest.unshift(rest.pop() as string | null);
    rotation = [fixed, ...rest];
  }

  if (turns === 2) {
    const second = fixtures.map((f) => ({
      round: f.round + rounds,
      home: f.away,
      away: f.home,
    }));
    return [...fixtures, ...second];
  }
  return fixtures;
}

export function nextPowerOfTwo(n: number): number {
  let size = 2;
  while (size < n) size *= 2;
  return size;
}

/** Ordem padrão de seeds na chave (1 x último, 2 x penúltimo...). */
export function seedOrder(size: number): number[] {
  let order = [1, 2];
  while (order.length < size) {
    const total = order.length * 2;
    order = order.flatMap((s) => [s, total + 1 - s]);
  }
  return order;
}

export function stageForTeamsInRound(teams: number): KnockoutStage {
  switch (teams) {
    case 2:
      return "final";
    case 4:
      return "semifinal";
    case 8:
      return "quarterfinal";
    case 16:
      return "round_of_16";
    case 32:
      return "round_of_32";
    default:
      throw new Error(`Chave não suportada para ${teams} equipes na rodada.`);
  }
}

export interface BracketTie {
  stage: KnockoutStage;
  round: number; // 1 = primeira rodada
  slot: number; // 1..N dentro da rodada
  home: string | null;
  away: string | null;
}

/**
 * Monta a chave completa. `seeds` já ordenados (índice 0 = seed 1).
 * Byes: seeds sem adversário avançam direto para a rodada seguinte.
 */
export function buildBracket(seeds: string[]): BracketTie[] {
  if (seeds.length < 2) throw new Error("Mínimo de 2 participantes para a chave.");
  const size = nextPowerOfTwo(seeds.length);
  if (size > 32) throw new Error("Chave suporta no máximo 32 participantes.");
  const order = seedOrder(size);
  const totalRounds = Math.log2(size);

  const ties: BracketTie[] = [];
  for (let r = 1; r <= totalRounds; r++) {
    const teamsInRound = size / 2 ** (r - 1);
    const count = teamsInRound / 2;
    for (let s = 1; s <= count; s++) {
      ties.push({
        stage: stageForTeamsInRound(teamsInRound),
        round: r,
        slot: s,
        home: null,
        away: null,
      });
    }
  }
  const find = (round: number, slot: number) =>
    ties.find((t) => t.round === round && t.slot === slot)!;

  // Rodada 1
  for (let s = 1; s <= size / 2; s++) {
    const t = find(1, s);
    const homeSeed = order[(s - 1) * 2];
    const awaySeed = order[(s - 1) * 2 + 1];
    t.home = seeds[homeSeed - 1] ?? null;
    t.away = seeds[awaySeed - 1] ?? null;
  }
  // Byes: propaga seeds sem adversário
  for (let s = 1; s <= size / 2; s++) {
    const t = find(1, s);
    if ((t.home === null) !== (t.away === null)) {
      const advancing = (t.home ?? t.away) as string;
      const parent = find(2, Math.ceil(s / 2));
      if (s % 2 === 1) parent.home = advancing;
      else parent.away = advancing;
    }
  }
  return ties;
}

export function isBye(tie: BracketTie): boolean {
  return tie.round === 1 && (tie.home === null) !== (tie.away === null);
}

export interface LegResult {
  leg: number;
  home: string | null;
  away: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homePenalties: number | null;
  awayPenalties: number | null;
  done: boolean;
}

export interface TieResolution {
  winner: string | null;
  loser: string | null;
  decidedBy: "aggregate" | "extra_match" | "penalties" | null;
  needsExtraMatch: boolean;
  needsPenalties: boolean;
  pending: boolean;
}

/**
 * Resolve confronto eliminatório:
 * - Soma gols da Ida + Volta (sem gol fora).
 * - Se Ida + Volta (2 jogos) empatarem nos gols e não houver pênaltis na Volta,
 *   sinaliza `needsExtraMatch: true` para gerar o 3º Jogo Extra (Prorrogação + Pênaltis).
 * - Se já houver o 3º Jogo Extra (ou Jogo Único) e empatar no tempo/prorrogação,
 *   decide nos pênaltis (`homePenalties` / `awayPenalties`).
 */
export function resolveTie(
  legs: LegResult[],
  expectedLegs: 1 | 2 = 2
): TieResolution {
  const ordered = [...legs].sort((a, b) => a.leg - b.leg);
  const none: TieResolution = {
    winner: null,
    loser: null,
    decidedBy: null,
    needsExtraMatch: false,
    needsPenalties: false,
    pending: true,
  };
  if (ordered.length === 0 || ordered.some((l) => !l.done)) return none;
  if (ordered.length < expectedLegs) return none;

  const a = ordered[0].home;
  const b = ordered[0].away;
  if (!a || !b) return none;

  // Se houver 3º jogo extra (leg === 3), ele decide o confronto (gols na prorrogação ou pênaltis)
  const extraLeg = ordered.find((l) => l.leg === 3);
  if (extraLeg) {
    const hs = extraLeg.homeScore ?? 0;
    const as = extraLeg.awayScore ?? 0;
    if (hs !== as) {
      const winner = hs > as ? extraLeg.home : extraLeg.away;
      return {
        winner,
        loser: winner === a ? b : a,
        decidedBy: "extra_match",
        needsExtraMatch: false,
        needsPenalties: false,
        pending: false,
      };
    }
    const hp = extraLeg.homePenalties;
    const ap = extraLeg.awayPenalties;
    if (hp === null || ap === null || hp === ap) {
      return { ...none, pending: false, needsPenalties: true };
    }
    const winner = hp > ap ? extraLeg.home : extraLeg.away;
    return {
      winner,
      loser: winner === a ? b : a,
      decidedBy: "penalties",
      needsExtraMatch: false,
      needsPenalties: false,
      pending: false,
    };
  }

  let goalsA = 0;
  let goalsB = 0;
  for (const l of ordered) {
    const hs = l.homeScore ?? 0;
    const as = l.awayScore ?? 0;
    if (l.home === a) {
      goalsA += hs;
      goalsB += as;
    } else {
      goalsA += as;
      goalsB += hs;
    }
  }
  if (goalsA !== goalsB) {
    const winner = goalsA > goalsB ? a : b;
    return {
      winner,
      loser: winner === a ? b : a,
      decidedBy: "aggregate",
      needsExtraMatch: false,
      needsPenalties: false,
      pending: false,
    };
  }

  const last = ordered[ordered.length - 1];
  const hp = last.homePenalties;
  const ap = last.awayPenalties;
  if (hp !== null && ap !== null && hp !== ap) {
    const winner = hp > ap ? last.home : last.away;
    return {
      winner,
      loser: winner === a ? b : a,
      decidedBy: "penalties",
      needsExtraMatch: false,
      needsPenalties: false,
      pending: false,
    };
  }

  // Ida e Volta empatadas em gols: gera 3º Jogo Extra (Prorrogação + Pênaltis)
  if (expectedLegs === 2 && ordered.length === 2) {
    return {
      ...none,
      pending: false,
      needsExtraMatch: true,
    };
  }

  return { ...none, pending: false, needsPenalties: true };
}

export interface StandingEntry {
  participantId: string;
  points: number;
  wins: number;
  goalDifference: number;
  goalsFor: number;
}

export interface DirectMatchEntry {
  homeParticipantId: string;
  awayParticipantId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  stage?: string;
}

/**
 * Ordena a classificação conforme regra oficial KSN YNUI:
 * 1º Pontos -> 2º Vitórias -> 3º Saldo de Gols -> 4º Gols Feitos -> 5º Confronto Direto (H2H).
 */
export function sortStandingsWithTiebreakers<T extends StandingEntry>(
  rows: T[],
  matches: DirectMatchEntry[]
): (T & { tiedCompletely?: boolean })[] {
  const completedGroupMatches = matches.filter(
    (m) =>
      (!m.stage || m.stage === "group") &&
      (m.status === "completed" || m.status === "walkover") &&
      m.homeScore !== null &&
      m.awayScore !== null
  );

  function compareH2H(aId: string, bId: string): number {
    let ptsA = 0,
      ptsB = 0,
      winsA = 0,
      winsB = 0,
      gfA = 0,
      gfB = 0;
    for (const m of completedGroupMatches) {
      const isAB =
        m.homeParticipantId === aId && m.awayParticipantId === bId;
      const isBA =
        m.homeParticipantId === bId && m.awayParticipantId === aId;
      if (!isAB && !isBA) continue;
      const goalsA = isAB ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
      const goalsB = isAB ? (m.awayScore ?? 0) : (m.homeScore ?? 0);
      gfA += goalsA;
      gfB += goalsB;
      if (goalsA > goalsB) {
        ptsA += 3;
        winsA += 1;
      } else if (goalsB > goalsA) {
        ptsB += 3;
        winsB += 1;
      } else {
        ptsA += 1;
        ptsB += 1;
      }
    }
    const gdA = gfA - gfB;
    const gdB = gfB - gfA;
    return ptsB - ptsA || winsB - winsA || gdB - gdA || gfB - gfA;
  }

  const sorted = [...rows].sort((a, b) => {
    const basic =
      b.points - a.points ||
      b.wins - a.wins ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor;
    if (basic !== 0) return basic;
    return compareH2H(a.participantId, b.participantId);
  });

  return sorted.map((row, idx) => {
    const prev = sorted[idx - 1];
    const next = sorted[idx + 1];
    const eq = (x?: T) =>
      Boolean(
        x &&
          x.points === row.points &&
          x.wins === row.wins &&
          x.goalDifference === row.goalDifference &&
          x.goalsFor === row.goalsFor &&
          compareH2H(row.participantId, x.participantId) === 0 &&
          row.points > 0
      );
    return {
      ...row,
      tiedCompletely: eq(prev) || eq(next),
    };
  });
}

/** Participantes que se classificam dos grupos, com cruzamento olímpico via seedOrder. */
export function crossGroupSeeds(
  groupsRanked: string[][],
  qualifiedPerGroup: number
): string[] {
  const seeds: string[] = [];
  for (let pos = 0; pos < qualifiedPerGroup; pos++) {
    for (const g of groupsRanked) {
      if (g[pos]) seeds.push(g[pos]);
    }
  }
  return seeds;
}

