export interface MockProfile {
  id: string;
  nickname: string;
  email: string;
  role: "player" | "organizer" | "super_admin";
  psnId: string | null;
  xboxGamertag: string | null;
  eaId: string | null;
  konamiId: string | null;
  discordHandle: string;
  avatarUrl: string | null;
}

export interface MockGroup {
  id: string;
  tournamentId: string;
  name: string;
  code: "A" | "B";
  displayOrder: number;
}

export interface MockParticipant {
  id: string;
  tournamentId: string;
  userId: string;
  groupId: string;
  groupCode: "A" | "B";
  seed: number;
  nickname: string;
  platformHandle: string;
  clubName: string;
  checkinStatus: "pending" | "checked_in" | "eliminated" | "disqualified";
}

export interface MockStanding {
  id: string;
  tournamentId: string;
  groupId: string;
  groupCode: "A" | "B";
  participantId: string;
  nickname: string;
  clubName: string;
  platformHandle: string;
  points: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface MockMatch {
  id: string;
  tournamentId: string;
  groupId: string | null;
  groupCode: "A" | "B" | null;
  stage:
    | "group"
    | "round_of_32"
    | "round_of_16"
    | "quarterfinal"
    | "semifinal"
    | "third_place"
    | "final";
  round: number;
  bracketPosition: number | null;
  leg?: number;
  label: string;
  homeParticipantId: string;
  awayParticipantId: string;
  homeNickname: string;
  homeClub: string;
  awayNickname: string;
  awayClub: string;
  homeScore: number | null;
  awayScore: number | null;
  homePenalties?: number | null;
  awayPenalties?: number | null;
  winnerParticipantId: string | null;
  proofUrl: string | null;
  notes: string | null;
  status:
    | "scheduled"
    | "awaiting_confirmation"
    | "completed"
    | "disputed"
    | "walkover";
  scheduledAt: string;
  playedAt: string | null;
}

export interface MockTournament {
  id: string;
  name: string;
  slug: string;
  organizerId: string;
  organizerNickname: string;
  format:
    | "round_robin"
    | "single_elimination"
    | "double_elimination"
    | "groups_playoffs";
  game: "ea_fc" | "efootball";
  platform: "ps5" | "xbox" | "pc" | "crossplay";
  status: "draft" | "open" | "in_progress" | "completed";
  maxParticipants: number;
  currentParticipants: number;
  entryFeeBrl: number;
  prizePoolBrl: number;
  bannerUrl: string;
  rulesMarkdown: string;
  startsAt: string;
  legsPerRound?: number;
  finalTwoLegs?: boolean;
  thirdPlaceMatch?: boolean;
  groupTurns?: number;
  qualifiedPerGroup?: number;
}

// ============================================================================
// SUPER-ADMIN (SPOOKY) & 8 PARTICIPANTES
// ============================================================================

export const SPOOKY_SUPER_ADMIN_ID = "80193776-6790-457c-906d-ed45ea16df9f";
export const MAIN_TOURNAMENT_ID = "11111111-2222-4333-8444-555555555501";
export const GROUP_A_ID = "aaaa1111-2222-4333-8444-555555555501";
export const GROUP_B_ID = "bbbb1111-2222-4333-8444-555555555502";

export const MOCK_PROFILES: MockProfile[] = [
  {
    id: SPOOKY_SUPER_ADMIN_ID,
    nickname: "SPOOKY",
    email: "spooky@strikearena.gg",
    role: "super_admin",
    psnId: "SPOOKY_BR_PRO",
    xboxGamertag: "SPOOKY X",
    eaId: "SPOOKY_EAFC",
    konamiId: "SPOOKY_EFB",
    discordHandle: "spooky#0001",
    avatarUrl: null,
  },
  {
    id: "20000000-0000-4000-8000-000000000001",
    nickname: "ViniTactical",
    email: "vini@strikearena.gg",
    role: "player",
    psnId: "ViniTactical_PS",
    xboxGamertag: null,
    eaId: "ViniTactical99",
    konamiId: "Vini_EFB",
    discordHandle: "vinitactical",
    avatarUrl: null,
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    nickname: "KauanStrike",
    email: "kauan@strikearena.gg",
    role: "player",
    psnId: "KauanStrike_BR",
    xboxGamertag: "KauanStrikeX",
    eaId: "KauanStrike",
    konamiId: null,
    discordHandle: "kauanstrike",
    avatarUrl: null,
  },
  {
    id: "20000000-0000-4000-8000-000000000003",
    nickname: "LipeGoat10",
    email: "lipe@strikearena.gg",
    role: "player",
    psnId: null,
    xboxGamertag: "LipeGoat10_XB",
    eaId: "LipeGoat10",
    konamiId: "Lipe10_PRO",
    discordHandle: "lipegoat10",
    avatarUrl: null,
  },
  {
    id: "20000000-0000-4000-8000-000000000004",
    nickname: "RafaSkills",
    email: "rafa@strikearena.gg",
    role: "player",
    psnId: "RafaSkills_09",
    xboxGamertag: null,
    eaId: "RafaSkills09",
    konamiId: null,
    discordHandle: "rafaskills",
    avatarUrl: null,
  },
  {
    id: "20000000-0000-4000-8000-000000000005",
    nickname: "MatheusPro",
    email: "matheus@strikearena.gg",
    role: "player",
    psnId: "MatheusPro_FC",
    xboxGamertag: "MatheusProXB",
    eaId: "MatheusProFC",
    konamiId: "Matheus_EF",
    discordHandle: "matheuspro",
    avatarUrl: null,
  },
  {
    id: "20000000-0000-4000-8000-000000000006",
    nickname: "GuiMetaFC",
    email: "gui@strikearena.gg",
    role: "player",
    psnId: "GuiMeta_PS5",
    xboxGamertag: null,
    eaId: "GuiMetaFC",
    konamiId: null,
    discordHandle: "guimetafc",
    avatarUrl: null,
  },
  {
    id: "20000000-0000-4000-8000-000000000007",
    nickname: "DuduR10",
    email: "dudu@strikearena.gg",
    role: "player",
    psnId: null,
    xboxGamertag: "DuduR10_SeriesX",
    eaId: "DuduR10_BR",
    konamiId: "DuduR10",
    discordHandle: "dudur10",
    avatarUrl: null,
  },
  {
    id: "20000000-0000-4000-8000-000000000008",
    nickname: "PedroClutch",
    email: "pedro@strikearena.gg",
    role: "player",
    psnId: "PedroClutch_7",
    xboxGamertag: null,
    eaId: "PedroClutch7",
    konamiId: "PedroClutch",
    discordHandle: "pedroclutch",
    avatarUrl: null,
  },
];

export const MOCK_TOURNAMENTS: MockTournament[] = [
  {
    id: MAIN_TOURNAMENT_ID,
    name: "Strike Arena Cup — EA FC 26 Elite Series",
    slug: "strike-cup-eafc26-elite",
    organizerId: SPOOKY_SUPER_ADMIN_ID,
    organizerNickname: "SPOOKY",
    format: "groups_playoffs",
    game: "ea_fc",
    platform: "crossplay",
    status: "in_progress",
    maxParticipants: 8,
    currentParticipants: 8,
    entryFeeBrl: 25,
    prizePoolBrl: 500,
    bannerUrl: "/banners/strike-cup-eafc.jpg",
    startsAt: "2026-10-02T20:00:00-03:00",
    rulesMarkdown: `### Regulamento Oficial — Strike Arena Cup #01
1. **Formato:** 8 participantes divididos em 2 grupos (Grupo A e Grupo B) em turno único. Os **2 melhores de cada grupo** avançam às Semifinais.
2. **Duração da Partida:** 6 minutos por tempo | Velocidade: Normal | Elencos: Online (95 Overall Uniforme ou Ultimate Team S1).
3. **Check-in e Tolerância:** Check-in obrigatório até 15 minutos antes da rodada. Atraso superior a 15 minutos na Match Hub gera **W.O. (3x0)** mediante print da sala e horário.
4. **Envio de Placar:** O vencedor deve anexar o link/comprovante da tela final de estatísticas contendo o placar e IDs visíveis.
5. **Desempate na Fase de Grupos:** 1º Pontos (PTS) | 2º Saldo de Gols (SG) | 3º Gols Pró (GP) | 4º Confronto Direto.`,
  },
  {
    id: "11111111-2222-4333-8444-555555555502",
    name: "Liga Nacional eFootball 2026 — Divisão Pro",
    slug: "liga-efootball-pro-s1",
    organizerId: SPOOKY_SUPER_ADMIN_ID,
    organizerNickname: "SPOOKY",
    format: "round_robin",
    game: "efootball",
    platform: "ps5",
    status: "open",
    maxParticipants: 16,
    currentParticipants: 12,
    entryFeeBrl: 15,
    prizePoolBrl: 350,
    bannerUrl: "/banners/efootball-liga.jpg",
    startsAt: "2026-10-05T21:00:00-03:00",
    rulesMarkdown:
      "Pontos corridos em turno único para jogadores de eFootball no PS5. Dream Team liberado com teto de força coletiva 3150.",
  },
  {
    id: "11111111-2222-4333-8444-555555555503",
    name: "Corujão Strike Arena — Mata-Mata Relâmpago",
    slug: "copa-relampago-crossplay",
    organizerId: SPOOKY_SUPER_ADMIN_ID,
    organizerNickname: "SPOOKY",
    format: "single_elimination",
    game: "ea_fc",
    platform: "crossplay",
    status: "open",
    maxParticipants: 32,
    currentParticipants: 24,
    entryFeeBrl: 10,
    prizePoolBrl: 250,
    bannerUrl: "/banners/corujao-strike.jpg",
    startsAt: "2026-10-03T23:00:00-03:00",
    rulesMarkdown:
      "Eliminatória simples (jogo único até a semifinal, final MD3). Check-in imediato às 22h45.",
  },
];

export const MOCK_GROUPS: MockGroup[] = [
  {
    id: GROUP_A_ID,
    tournamentId: MAIN_TOURNAMENT_ID,
    name: "Grupo A",
    code: "A",
    displayOrder: 1,
  },
  {
    id: GROUP_B_ID,
    tournamentId: MAIN_TOURNAMENT_ID,
    name: "Grupo B",
    code: "B",
    displayOrder: 2,
  },
];

export const MOCK_PARTICIPANTS: MockParticipant[] = [
  // GRUPO A
  {
    id: "30000000-0000-4000-8000-000000000001",
    tournamentId: MAIN_TOURNAMENT_ID,
    userId: "20000000-0000-4000-8000-000000000001",
    groupId: GROUP_A_ID,
    groupCode: "A",
    seed: 1,
    nickname: "ViniTactical",
    platformHandle: "PSN: ViniTactical_PS",
    clubName: "Real Madrid",
    checkinStatus: "checked_in",
  },
  {
    id: "30000000-0000-4000-8000-000000000002",
    tournamentId: MAIN_TOURNAMENT_ID,
    userId: "20000000-0000-4000-8000-000000000002",
    groupId: GROUP_A_ID,
    groupCode: "A",
    seed: 2,
    nickname: "KauanStrike",
    platformHandle: "PSN: KauanStrike_BR",
    clubName: "Manchester City",
    checkinStatus: "checked_in",
  },
  {
    id: "30000000-0000-4000-8000-000000000003",
    tournamentId: MAIN_TOURNAMENT_ID,
    userId: "20000000-0000-4000-8000-000000000003",
    groupId: GROUP_A_ID,
    groupCode: "A",
    seed: 3,
    nickname: "LipeGoat10",
    platformHandle: "XBOX: LipeGoat10_XB",
    clubName: "Arsenal",
    checkinStatus: "checked_in",
  },
  {
    id: "30000000-0000-4000-8000-000000000004",
    tournamentId: MAIN_TOURNAMENT_ID,
    userId: "20000000-0000-4000-8000-000000000004",
    groupId: GROUP_A_ID,
    groupCode: "A",
    seed: 4,
    nickname: "RafaSkills",
    platformHandle: "PSN: RafaSkills_09",
    clubName: "Paris Saint-Germain",
    checkinStatus: "checked_in",
  },
  // GRUPO B
  {
    id: "30000000-0000-4000-8000-000000000005",
    tournamentId: MAIN_TOURNAMENT_ID,
    userId: "20000000-0000-4000-8000-000000000005",
    groupId: GROUP_B_ID,
    groupCode: "B",
    seed: 5,
    nickname: "MatheusPro",
    platformHandle: "EA: MatheusProFC",
    clubName: "Bayern München",
    checkinStatus: "checked_in",
  },
  {
    id: "30000000-0000-4000-8000-000000000006",
    tournamentId: MAIN_TOURNAMENT_ID,
    userId: "20000000-0000-4000-8000-000000000006",
    groupId: GROUP_B_ID,
    groupCode: "B",
    seed: 6,
    nickname: "GuiMetaFC",
    platformHandle: "PSN: GuiMeta_PS5",
    clubName: "FC Barcelona",
    checkinStatus: "checked_in",
  },
  {
    id: "30000000-0000-4000-8000-000000000007",
    tournamentId: MAIN_TOURNAMENT_ID,
    userId: "20000000-0000-4000-8000-000000000007",
    groupId: GROUP_B_ID,
    groupCode: "B",
    seed: 7,
    nickname: "DuduR10",
    platformHandle: "XBOX: DuduR10_SeriesX",
    clubName: "Liverpool",
    checkinStatus: "checked_in",
  },
  {
    id: "30000000-0000-4000-8000-000000000008",
    tournamentId: MAIN_TOURNAMENT_ID,
    userId: "20000000-0000-4000-8000-000000000008",
    groupId: GROUP_B_ID,
    groupCode: "B",
    seed: 8,
    nickname: "PedroClutch",
    platformHandle: "PSN: PedroClutch_7",
    clubName: "Inter de Milão",
    checkinStatus: "pending",
  },
];

export const MOCK_STANDINGS: MockStanding[] = [
  // GRUPO A
  {
    id: "40000000-0000-4000-8000-000000000001",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: GROUP_A_ID,
    groupCode: "A",
    participantId: "30000000-0000-4000-8000-000000000001",
    nickname: "ViniTactical",
    clubName: "Real Madrid",
    platformHandle: "PSN: ViniTactical_PS",
    points: 7,
    matchesPlayed: 3,
    wins: 2,
    draws: 1,
    losses: 0,
    goalsFor: 8,
    goalsAgainst: 3,
    goalDifference: 5,
  },
  {
    id: "40000000-0000-4000-8000-000000000002",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: GROUP_A_ID,
    groupCode: "A",
    participantId: "30000000-0000-4000-8000-000000000002",
    nickname: "KauanStrike",
    clubName: "Manchester City",
    platformHandle: "PSN: KauanStrike_BR",
    points: 6,
    matchesPlayed: 3,
    wins: 2,
    draws: 0,
    losses: 1,
    goalsFor: 6,
    goalsAgainst: 4,
    goalDifference: 2,
  },
  {
    id: "40000000-0000-4000-8000-000000000003",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: GROUP_A_ID,
    groupCode: "A",
    participantId: "30000000-0000-4000-8000-000000000003",
    nickname: "LipeGoat10",
    clubName: "Arsenal",
    platformHandle: "XBOX: LipeGoat10_XB",
    points: 4,
    matchesPlayed: 3,
    wins: 1,
    draws: 1,
    losses: 1,
    goalsFor: 5,
    goalsAgainst: 5,
    goalDifference: 0,
  },
  {
    id: "40000000-0000-4000-8000-000000000004",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: GROUP_A_ID,
    groupCode: "A",
    participantId: "30000000-0000-4000-8000-000000000004",
    nickname: "RafaSkills",
    clubName: "Paris Saint-Germain",
    platformHandle: "PSN: RafaSkills_09",
    points: 0,
    matchesPlayed: 3,
    wins: 0,
    draws: 0,
    losses: 3,
    goalsFor: 2,
    goalsAgainst: 9,
    goalDifference: -7,
  },
  // GRUPO B
  {
    id: "40000000-0000-4000-8000-000000000005",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: GROUP_B_ID,
    groupCode: "B",
    participantId: "30000000-0000-4000-8000-000000000005",
    nickname: "MatheusPro",
    clubName: "Bayern München",
    platformHandle: "EA: MatheusProFC",
    points: 6,
    matchesPlayed: 2,
    wins: 2,
    draws: 0,
    losses: 0,
    goalsFor: 7,
    goalsAgainst: 2,
    goalDifference: 5,
  },
  {
    id: "40000000-0000-4000-8000-000000000006",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: GROUP_B_ID,
    groupCode: "B",
    participantId: "30000000-0000-4000-8000-000000000006",
    nickname: "GuiMetaFC",
    clubName: "FC Barcelona",
    platformHandle: "PSN: GuiMeta_PS5",
    points: 3,
    matchesPlayed: 2,
    wins: 1,
    draws: 0,
    losses: 1,
    goalsFor: 4,
    goalsAgainst: 3,
    goalDifference: 1,
  },
  {
    id: "40000000-0000-4000-8000-000000000007",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: GROUP_B_ID,
    groupCode: "B",
    participantId: "30000000-0000-4000-8000-000000000007",
    nickname: "DuduR10",
    clubName: "Liverpool",
    platformHandle: "XBOX: DuduR10_SeriesX",
    points: 3,
    matchesPlayed: 2,
    wins: 1,
    draws: 0,
    losses: 1,
    goalsFor: 3,
    goalsAgainst: 4,
    goalDifference: -1,
  },
  {
    id: "40000000-0000-4000-8000-000000000008",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: GROUP_B_ID,
    groupCode: "B",
    participantId: "30000000-0000-4000-8000-000000000008",
    nickname: "PedroClutch",
    clubName: "Inter de Milão",
    platformHandle: "PSN: PedroClutch_7",
    points: 0,
    matchesPlayed: 2,
    wins: 0,
    draws: 0,
    losses: 2,
    goalsFor: 1,
    goalsAgainst: 6,
    goalDifference: -5,
  },
];

export const MOCK_MATCHES: MockMatch[] = [
  // GRUPO A - RODADA 1
  {
    id: "50000000-0000-4000-8000-000000000001",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: GROUP_A_ID,
    groupCode: "A",
    stage: "group",
    round: 1,
    bracketPosition: null,
    label: "Grupo A · Rodada 1",
    homeParticipantId: "30000000-0000-4000-8000-000000000001",
    awayParticipantId: "30000000-0000-4000-8000-000000000002",
    homeNickname: "ViniTactical",
    homeClub: "Real Madrid",
    awayNickname: "KauanStrike",
    awayClub: "Manchester City",
    homeScore: 2,
    awayScore: 1,
    winnerParticipantId: "30000000-0000-4000-8000-000000000001",
    proofUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
    notes: "Gol da vitória aos 89' com Bellingham. Print verificado.",
    status: "completed",
    scheduledAt: "2026-10-02T20:00:00-03:00",
    playedAt: "2026-10-02T20:18:00-03:00",
  },
  {
    id: "50000000-0000-4000-8000-000000000002",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: GROUP_A_ID,
    groupCode: "A",
    stage: "group",
    round: 1,
    bracketPosition: null,
    label: "Grupo A · Rodada 1",
    homeParticipantId: "30000000-0000-4000-8000-000000000003",
    awayParticipantId: "30000000-0000-4000-8000-000000000004",
    homeNickname: "LipeGoat10",
    homeClub: "Arsenal",
    awayNickname: "RafaSkills",
    awayClub: "Paris Saint-Germain",
    homeScore: 3,
    awayScore: 1,
    winnerParticipantId: "30000000-0000-4000-8000-000000000003",
    proofUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
    notes: "Hat-trick de Saka.",
    status: "completed",
    scheduledAt: "2026-10-02T20:00:00-03:00",
    playedAt: "2026-10-02T20:20:00-03:00",
  },
  // GRUPO A - RODADA 2
  {
    id: "50000000-0000-4000-8000-000000000003",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: GROUP_A_ID,
    groupCode: "A",
    stage: "group",
    round: 2,
    bracketPosition: null,
    label: "Grupo A · Rodada 2",
    homeParticipantId: "30000000-0000-4000-8000-000000000001",
    awayParticipantId: "30000000-0000-4000-8000-000000000003",
    homeNickname: "ViniTactical",
    homeClub: "Real Madrid",
    awayNickname: "LipeGoat10",
    awayClub: "Arsenal",
    homeScore: 2,
    awayScore: 2,
    winnerParticipantId: null,
    proofUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
    notes: "Empate equilibrado.",
    status: "completed",
    scheduledAt: "2026-10-02T20:30:00-03:00",
    playedAt: "2026-10-02T20:49:00-03:00",
  },
  {
    id: "50000000-0000-4000-8000-000000000004",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: GROUP_A_ID,
    groupCode: "A",
    stage: "group",
    round: 2,
    bracketPosition: null,
    label: "Grupo A · Rodada 2",
    homeParticipantId: "30000000-0000-4000-8000-000000000002",
    awayParticipantId: "30000000-0000-4000-8000-000000000004",
    homeNickname: "KauanStrike",
    homeClub: "Manchester City",
    awayNickname: "RafaSkills",
    awayClub: "Paris Saint-Germain",
    homeScore: 3,
    awayScore: 1,
    winnerParticipantId: "30000000-0000-4000-8000-000000000002",
    proofUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
    notes: "Domínio no meio-campo.",
    status: "completed",
    scheduledAt: "2026-10-02T20:30:00-03:00",
    playedAt: "2026-10-02T20:52:00-03:00",
  },
  // GRUPO A - RODADA 3
  {
    id: "50000000-0000-4000-8000-000000000005",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: GROUP_A_ID,
    groupCode: "A",
    stage: "group",
    round: 3,
    bracketPosition: null,
    label: "Grupo A · Rodada 3",
    homeParticipantId: "30000000-0000-4000-8000-000000000004",
    awayParticipantId: "30000000-0000-4000-8000-000000000001",
    homeNickname: "RafaSkills",
    homeClub: "Paris Saint-Germain",
    awayNickname: "ViniTactical",
    awayClub: "Real Madrid",
    homeScore: 0,
    awayScore: 4,
    winnerParticipantId: "30000000-0000-4000-8000-000000000001",
    proofUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
    notes: "ViniTactical garante 1º lugar do Grupo A.",
    status: "completed",
    scheduledAt: "2026-10-02T21:00:00-03:00",
    playedAt: "2026-10-02T21:18:00-03:00",
  },
  {
    id: "50000000-0000-4000-8000-000000000006",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: GROUP_A_ID,
    groupCode: "A",
    stage: "group",
    round: 3,
    bracketPosition: null,
    label: "Grupo A · Rodada 3",
    homeParticipantId: "30000000-0000-4000-8000-000000000002",
    awayParticipantId: "30000000-0000-4000-8000-000000000003",
    homeNickname: "KauanStrike",
    homeClub: "Manchester City",
    awayNickname: "LipeGoat10",
    awayClub: "Arsenal",
    homeScore: 2,
    awayScore: 0,
    winnerParticipantId: "30000000-0000-4000-8000-000000000002",
    proofUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
    notes: "KauanStrike avança em 2º do Grupo A.",
    status: "completed",
    scheduledAt: "2026-10-02T21:00:00-03:00",
    playedAt: "2026-10-02T21:21:00-03:00",
  },

  // GRUPO B - RODADAS 1, 2 e 3 (Com 1 aguardando confirmação e 1 contestada)
  {
    id: "50000000-0000-4000-8000-000000000007",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: GROUP_B_ID,
    groupCode: "B",
    stage: "group",
    round: 1,
    bracketPosition: null,
    label: "Grupo B · Rodada 1",
    homeParticipantId: "30000000-0000-4000-8000-000000000005",
    awayParticipantId: "30000000-0000-4000-8000-000000000006",
    homeNickname: "MatheusPro",
    homeClub: "Bayern München",
    awayNickname: "GuiMetaFC",
    awayClub: "FC Barcelona",
    homeScore: 3,
    awayScore: 1,
    winnerParticipantId: "30000000-0000-4000-8000-000000000005",
    proofUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
    notes: "Placar confirmado por ambos os jogadores.",
    status: "completed",
    scheduledAt: "2026-10-02T20:00:00-03:00",
    playedAt: "2026-10-02T20:19:00-03:00",
  },
  {
    id: "50000000-0000-4000-8000-000000000008",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: GROUP_B_ID,
    groupCode: "B",
    stage: "group",
    round: 1,
    bracketPosition: null,
    label: "Grupo B · Rodada 1",
    homeParticipantId: "30000000-0000-4000-8000-000000000007",
    awayParticipantId: "30000000-0000-4000-8000-000000000008",
    homeNickname: "DuduR10",
    homeClub: "Liverpool",
    awayNickname: "PedroClutch",
    awayClub: "Inter de Milão",
    homeScore: 2,
    awayScore: 0,
    winnerParticipantId: "30000000-0000-4000-8000-000000000007",
    proofUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
    notes: "Vitória limpa do Liverpool.",
    status: "completed",
    scheduledAt: "2026-10-02T20:00:00-03:00",
    playedAt: "2026-10-02T20:22:00-03:00",
  },
  {
    id: "50000000-0000-4000-8000-000000000009",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: GROUP_B_ID,
    groupCode: "B",
    stage: "group",
    round: 2,
    bracketPosition: null,
    label: "Grupo B · Rodada 2",
    homeParticipantId: "30000000-0000-4000-8000-000000000005",
    awayParticipantId: "30000000-0000-4000-8000-000000000007",
    homeNickname: "MatheusPro",
    homeClub: "Bayern München",
    awayNickname: "DuduR10",
    awayClub: "Liverpool",
    homeScore: 4,
    awayScore: 1,
    winnerParticipantId: "30000000-0000-4000-8000-000000000005",
    proofUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
    notes: "Kane marcou 3 gols.",
    status: "completed",
    scheduledAt: "2026-10-02T20:30:00-03:00",
    playedAt: "2026-10-02T20:48:00-03:00",
  },
  {
    id: "50000000-0000-4000-8000-000000000010",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: GROUP_B_ID,
    groupCode: "B",
    stage: "group",
    round: 2,
    bracketPosition: null,
    label: "Grupo B · Rodada 2",
    homeParticipantId: "30000000-0000-4000-8000-000000000006",
    awayParticipantId: "30000000-0000-4000-8000-000000000008",
    homeNickname: "GuiMetaFC",
    homeClub: "FC Barcelona",
    awayNickname: "PedroClutch",
    awayClub: "Inter de Milão",
    homeScore: 3,
    awayScore: 0,
    winnerParticipantId: "30000000-0000-4000-8000-000000000006",
    proofUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
    notes: "Adversário caiu aos 75' quando estava 3x0.",
    status: "completed",
    scheduledAt: "2026-10-02T20:30:00-03:00",
    playedAt: "2026-10-02T20:50:00-03:00",
  },
  {
    id: "50000000-0000-4000-8000-000000000011",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: GROUP_B_ID,
    groupCode: "B",
    stage: "group",
    round: 3,
    bracketPosition: null,
    label: "Grupo B · Rodada 3 (Decisão 2ª Vaga)",
    homeParticipantId: "30000000-0000-4000-8000-000000000006",
    awayParticipantId: "30000000-0000-4000-8000-000000000007",
    homeNickname: "GuiMetaFC",
    homeClub: "FC Barcelona",
    awayNickname: "DuduR10",
    awayClub: "Liverpool",
    homeScore: 2,
    awayScore: 1,
    winnerParticipantId: "30000000-0000-4000-8000-000000000006",
    proofUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
    notes: "GuiMetaFC enviou print do 2x1. Aguardando confirmação do adversário ou aprovação do organizador.",
    status: "awaiting_confirmation",
    scheduledAt: "2026-10-02T21:15:00-03:00",
    playedAt: "2026-10-02T21:33:00-03:00",
  },
  {
    id: "50000000-0000-4000-8000-000000000012",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: GROUP_B_ID,
    groupCode: "B",
    stage: "group",
    round: 3,
    bracketPosition: null,
    label: "Grupo B · Rodada 3",
    homeParticipantId: "30000000-0000-4000-8000-000000000008",
    awayParticipantId: "30000000-0000-4000-8000-000000000005",
    homeNickname: "PedroClutch",
    homeClub: "Inter de Milão",
    awayNickname: "MatheusPro",
    awayClub: "Bayern München",
    homeScore: 0,
    awayScore: 3,
    winnerParticipantId: "30000000-0000-4000-8000-000000000005",
    proofUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
    notes: "Pedido de W.O. por ausência após 15 min de tolerância. Em análise pela organização.",
    status: "disputed",
    scheduledAt: "2026-10-02T21:15:00-03:00",
    playedAt: null,
  },

  // PLAYOFFS / MATA-MATA (SEMIFINAIS E FINAL)
  {
    id: "50000000-0000-4000-8000-000000000013",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: null,
    groupCode: null,
    stage: "semifinal",
    round: 4,
    bracketPosition: 1,
    label: "Semifinal 1 (1º A × 2º B)",
    homeParticipantId: "30000000-0000-4000-8000-000000000001",
    awayParticipantId: "30000000-0000-4000-8000-000000000006",
    homeNickname: "ViniTactical",
    homeClub: "Real Madrid",
    awayNickname: "GuiMetaFC",
    awayClub: "FC Barcelona",
    homeScore: null,
    awayScore: null,
    winnerParticipantId: null,
    proofUrl: null,
    notes: "El Clásico na Semifinal 1 — aguardando homologação final do Grupo B.",
    status: "scheduled",
    scheduledAt: "2026-10-02T22:00:00-03:00",
    playedAt: null,
  },
  {
    id: "50000000-0000-4000-8000-000000000014",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: null,
    groupCode: null,
    stage: "semifinal",
    round: 4,
    bracketPosition: 2,
    label: "Semifinal 2 (1º B × 2º A)",
    homeParticipantId: "30000000-0000-4000-8000-000000000005",
    awayParticipantId: "30000000-0000-4000-8000-000000000002",
    homeNickname: "MatheusPro",
    homeClub: "Bayern München",
    awayNickname: "KauanStrike",
    awayClub: "Manchester City",
    homeScore: 3,
    awayScore: 2,
    winnerParticipantId: "30000000-0000-4000-8000-000000000005",
    proofUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
    notes: "Jogo épico decidido na prorrogação (3x2). MatheusPro classificado para a Grande Final!",
    status: "completed",
    scheduledAt: "2026-10-02T22:00:00-03:00",
    playedAt: "2026-10-02T22:25:00-03:00",
  },
  {
    id: "50000000-0000-4000-8000-000000000015",
    tournamentId: MAIN_TOURNAMENT_ID,
    groupId: null,
    groupCode: null,
    stage: "final",
    round: 5,
    bracketPosition: 1,
    label: "Grande Final · Strike Arena Cup",
    homeParticipantId: "30000000-0000-4000-8000-000000000001",
    awayParticipantId: "30000000-0000-4000-8000-000000000005",
    homeNickname: "Vencedor SF1 (Vini/Gui)",
    homeClub: "A Definir (SF1)",
    awayNickname: "MatheusPro",
    awayClub: "Bayern München",
    homeScore: null,
    awayScore: null,
    winnerParticipantId: null,
    proofUrl: null,
    notes: "Final vale R$ 350 para o Campeão + R$ 150 para o Vice.",
    status: "scheduled",
    scheduledAt: "2026-10-02T22:45:00-03:00",
    playedAt: null,
  },
];
