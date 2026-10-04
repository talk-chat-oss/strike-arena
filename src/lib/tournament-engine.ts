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
  decidedBy: "aggregate" | "penalties" | null;
  needsPenalties: boolean;
  pending: boolean;
}

/** Resolve confronto de 1 ou 2 pernas. Empate no agregado -> pênaltis na última perna. */
export function resolveTie(legs: LegResult[]): TieResolution {
  const ordered = [...legs].sort((a, b) => a.leg - b.leg);
  const none: TieResolution = {
    winner: null,
    loser: null,
    decidedBy: null,
    needsPenalties: false,
    pending: true,
  };
  if (ordered.length === 0 || ordered.some((l) => !l.done)) return none;

  const a = ordered[0].home;
  const b = ordered[0].away;
  if (!a || !b) return none;

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
      needsPenalties: false,
      pending: false,
    };
  }

  const last = ordered[ordered.length - 1];
  const hp = last.homePenalties;
  const ap = last.awayPenalties;
  if (hp === null || ap === null || hp === ap) {
    return { ...none, pending: false, needsPenalties: true };
  }
  const winner = hp > ap ? last.home : last.away;
  return {
    winner,
    loser: winner === a ? b : a,
    decidedBy: "penalties",
    needsPenalties: false,
    pending: false,
  };
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
