import { supabaseAdmin } from "@/lib/supabase";
import { SPOOKY_SUPER_ADMIN_ID } from "@/db/mock-data";

// ============================================================================
// INTERFACES & DTOs (MASTER LIGA ONLINE — ECONOMIA EM ESCUDOS)
// ============================================================================

export type FinancialTxType =
  | "PREMIO_VITORIA"
  | "GOL_MARCADO"
  | "META_PATROCINADOR"
  | "TITULO"
  | "SALARIO_PAGO"
  | "TRANSFERENCIA"
  | "MULTA_PAGA"
  | "RECARGA_ESCUDOS"
  | "BLOQUEIO_LANCE"
  | "ESTORNO_LANCE"
  | "ARREMATE_LEILAO";

export type BallCategory = "BOLA_PRETA" | "BOLA_OURO" | "BOLA_PRATA";

export interface AthleteDTO {
  id: string;
  name: string;
  overall: number;
  position: string;
  age: number;
  photoUrl: string;
  defaultTeam: string;
  ballType: BallCategory;
}

export interface TacticalLineupData {
  formation?: string;
  slots?: Record<string, string | null>; // slotKey -> athleteId
  updatedAt?: string;
}

export interface ClubTeamDTO {
  id: string;
  leagueId: string | null;
  userId: string;
  ownerNickname: string;
  name: string;
  acronym: string;
  badgeUrl: string;
  balance: number; // Em Striker Coins
  isDelinquent: boolean;
  payrollTotal: number; // Em Striker Coins
  estimatedSquadValue: number; // Em Striker Coins
  rosterCount: number;
  leaguePassExpiresAt?: string | null;
  leaguePassMode?: string;
  hasActiveLeaguePass?: boolean;
  tacticalLineup?: TacticalLineupData;
}

export interface ContractRosterItemDTO {
  id: string;
  clubTeamId: string;
  clubName: string;
  clubAcronym: string;
  ownerNickname: string;
  athleteId: string;
  athleteName: string;
  overall: number;
  position: string;
  age: number;
  photoUrl: string;
  defaultTeam: string;
  ballType: BallCategory;
  salary: number; // Em Escudos
  buyoutClause: number; // Em Escudos
  acquiredAt: string;
}

export interface FinancialTransactionDTO {
  id: string;
  clubTeamId: string;
  clubName: string;
  type: FinancialTxType;
  amount: number; // Em Escudos
  description: string;
  createdAt: string;
}

export interface AuctionBidDTO {
  id: string;
  auctionId: string;
  clubTeamId: string;
  clubName: string;
  clubAcronym: string;
  bidAmount: number; // Em Escudos
  createdAt: string;
}

export interface AuctionDTO {
  id: string;
  athleteId: string;
  athleteName: string;
  overall: number;
  position: string;
  age: number;
  photoUrl: string;
  defaultTeam: string;
  ballType: BallCategory;
  sellerClubId: string | null;
  sellerClubName: string;
  startingBid: number; // Em Escudos (ex: 100 Escudos)
  currentBid: number; // Em Escudos
  minIncrement: number; // Passo mínimo (ex: 5 em 5 Escudos)
  currentWinningClubId: string | null;
  currentWinningClubName: string | null;
  currentWinningClubAcronym: string | null;
  startsAt: string;
  endsAt: string;
  status: "AGENDADO" | "ATIVO" | "ENCERRADO" | "CANCELADO";
  bids: AuctionBidDTO[];
}

export interface TransferProposalDTO {
  id: string;
  fromClubId: string;
  fromClubName: string;
  fromClubAcronym: string;
  toClubId: string;
  toClubName: string;
  toClubAcronym: string;
  cashAmount: number; // Em Escudos
  offeredAthletes: AthleteDTO[];
  requestedAthletes: AthleteDTO[];
  status: "PENDENTE" | "ACEITA" | "RECUSADA" | "CANCELADA";
  createdAt: string;
}

export interface EscudoPackageDTO {
  id: string;
  name: string;
  escudosAmount: number;
  priceBrlCents: number;
  badgeLabel: string | null;
  isFeatured: boolean;
  active: boolean;
}

export interface EscudoPurchaseDTO {
  id: string;
  clubTeamId: string;
  clubName: string;
  packageId: string;
  packageName: string;
  escudosCredited: number;
  amountPaidBrlCents: number;
  paymentMethod: string;
  paymentStatus: string;
  externalReference: string | null;
  createdAt: string;
}

export interface MasterGoalScorerDTO {
  athleteId?: string;
  athleteName: string;
  goals: number;
}

export interface MasterMatchDTO {
  id: string;
  round: number;
  label: string;
  homeTeamId: string;
  homeTeamName: string;
  homeTeamAcronym: string;
  homeCoach: string;
  awayTeamId: string;
  awayTeamName: string;
  awayTeamAcronym: string;
  awayCoach: string;
  homeScore: number | null;
  awayScore: number | null;
  homeGoalsScorers: MasterGoalScorerDTO[];
  awayGoalsScorers: MasterGoalScorerDTO[];
  status: "AGENDADA" | "AGUARDANDO_CONFIRMACAO" | "FINALIZADA" | "WO";
  scheduledDate: string;
  proofUrl: string | null;
}

export interface HeadToHeadResultDTO {
  teamA: ClubTeamDTO;
  teamB: ClubTeamDTO;
  totalMatches: number;
  winsA: number;
  winsB: number;
  draws: number;
  goalsA: number;
  goalsB: number;
  winRateA: number;
  winRateB: number;
  freguesClubName: string | null;
  freguesCoachName: string | null;
  carrascoClubName: string | null;
  dominanceLabel: string;
  recentMatches: {
    id: string;
    date: string;
    competition: string;
    homeClubName: string;
    awayClubName: string;
    homeScore: number;
    awayScore: number;
    scorersSummary: string;
  }[];
}

export interface TransferWindowSettingsDTO {
  windowName: string;
  forceStatus: "AUTO" | "OPEN" | "CLOSED";
  opensAt: string;
  closesAt: string;
  buyoutEnabled: boolean;
  tradesEnabled: boolean;
  freeAgencyEnabled: boolean;
  isOpenNow: boolean;
}

export function getFreeAgentSigningCost(overall: number): {
  signingFee: number;
  salary: number;
  buyoutClause: number;
} {
  let signingFee = 45;
  let salary = 12;
  if (overall >= 90) {
    signingFee = 220;
    salary = 50;
  } else if (overall >= 87) {
    signingFee = 160;
    salary = 40;
  } else if (overall >= 85) {
    signingFee = 120;
    salary = 32;
  } else if (overall >= 82) {
    signingFee = 85;
    salary = 24;
  } else if (overall >= 80) {
    signingFee = 65;
    salary = 18;
  }
  return {
    signingFee,
    salary,
    buyoutClause: salary * 10,
  };
}

export function formatEscudos(value: number, withLabel = true): string {
  const formatted = new Intl.NumberFormat("pt-BR").format(Math.round(value));
  return withLabel ? `${formatted} Striker Coins` : formatted;
}

export function formatBrlFromCents(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

// ============================================================================
// MOCK DATA COMPLETO (FALLBACK + SEED BASE EM STRIKER COINS)
// ============================================================================

export const MOCK_ESCUDO_PACKAGES: EscudoPackageDTO[] = [
  {
    id: "e0000000-0000-4000-8000-000000000001",
    name: "Pacote 200 Striker Coins",
    escudosAmount: 200,
    priceBrlCents: 1000,
    badgeLabel: "ENTRADA RÁPIDA",
    isFeatured: false,
    active: true,
  },
  {
    id: "e0000000-0000-4000-8000-000000000004",
    name: "Pacote 300 Striker Coins",
    escudosAmount: 300,
    priceBrlCents: 2000,
    badgeLabel: "INTERMEDIÁRIO",
    isFeatured: false,
    active: true,
  },
  {
    id: "e0000000-0000-4000-8000-000000000002",
    name: "Pacote 500 Striker Coins",
    escudosAmount: 500,
    priceBrlCents: 3000,
    badgeLabel: "MAIS VENDIDO",
    isFeatured: true,
    active: true,
  },
  {
    id: "e0000000-0000-4000-8000-000000000003",
    name: "Pacote 1000 Striker Coins",
    escudosAmount: 1000,
    priceBrlCents: 5000,
    badgeLabel: "PACOTE MÁXIMO",
    isFeatured: false,
    active: true,
  },
];

export const MOCK_ATHLETES: AthleteDTO[] = [
  {
    id: "a0000000-0000-4000-8000-000000000001",
    name: "Kylian Mbappé",
    overall: 92,
    position: "ATA",
    age: 26,
    photoUrl:
      "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p231747.png?padding=0.7",
    defaultTeam: "Real Madrid",
    ballType: "BOLA_PRETA",
  },
  {
    id: "a0000000-0000-4000-8000-000000000002",
    name: "Erling Haaland",
    overall: 91,
    position: "ATA",
    age: 25,
    photoUrl:
      "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p239085.png?padding=0.7",
    defaultTeam: "Manchester City",
    ballType: "BOLA_PRETA",
  },
  {
    id: "a0000000-0000-4000-8000-000000000003",
    name: "Vinícius Jr.",
    overall: 91,
    position: "PE",
    age: 25,
    photoUrl:
      "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p238794.png?padding=0.7",
    defaultTeam: "Real Madrid",
    ballType: "BOLA_PRETA",
  },
  {
    id: "a0000000-0000-4000-8000-000000000005",
    name: "Rodri Hernández",
    overall: 91,
    position: "VOL",
    age: 29,
    photoUrl:
      "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p231866.png?padding=0.7",
    defaultTeam: "Manchester City",
    ballType: "BOLA_PRETA",
  },
  {
    id: "a0000000-0000-4000-8000-000000000021",
    name: "Lionel Messi",
    overall: 90,
    position: "ATA",
    age: 38,
    photoUrl:
      "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p158023.png?padding=0.7",
    defaultTeam: "Inter Miami",
    ballType: "BOLA_PRETA",
  },
  {
    id: "a0000000-0000-4000-8000-000000000004",
    name: "Jude Bellingham",
    overall: 90,
    position: "MEI",
    age: 22,
    photoUrl:
      "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p252371.png?padding=0.7",
    defaultTeam: "Real Madrid",
    ballType: "BOLA_PRETA",
  },
  {
    id: "a0000000-0000-4000-8000-000000000007",
    name: "Harry Kane",
    overall: 90,
    position: "ATA",
    age: 32,
    photoUrl:
      "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p202126.png?padding=0.7",
    defaultTeam: "Bayern München",
    ballType: "BOLA_PRETA",
  },
  {
    id: "a0000000-0000-4000-8000-000000000013",
    name: "Thibaut Courtois",
    overall: 90,
    position: "GOL",
    age: 33,
    photoUrl:
      "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p192119.png?padding=0.7",
    defaultTeam: "Real Madrid",
    ballType: "BOLA_PRETA",
  },
  {
    id: "a0000000-0000-4000-8000-000000000022",
    name: "Cristiano Ronaldo",
    overall: 89,
    position: "ATA",
    age: 40,
    photoUrl:
      "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p20801.png?padding=0.7",
    defaultTeam: "Al-Nassr",
    ballType: "BOLA_PRETA",
  },
  {
    id: "a0000000-0000-4000-8000-000000000023",
    name: "Robert Lewandowski",
    overall: 89,
    position: "ATA",
    age: 37,
    photoUrl:
      "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p188545.png?padding=0.7",
    defaultTeam: "FC Barcelona",
    ballType: "BOLA_PRETA",
  },
  {
    id: "a0000000-0000-4000-8000-000000000008",
    name: "Mohamed Salah",
    overall: 89,
    position: "PD",
    age: 33,
    photoUrl:
      "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p209331.png?padding=0.7",
    defaultTeam: "Liverpool",
    ballType: "BOLA_PRETA",
  },
  {
    id: "a0000000-0000-4000-8000-000000000010",
    name: "Federico Valverde",
    overall: 89,
    position: "MC",
    age: 27,
    photoUrl:
      "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p239053.png?padding=0.7",
    defaultTeam: "Real Madrid",
    ballType: "BOLA_PRETA",
  },
  {
    id: "a0000000-0000-4000-8000-000000000011",
    name: "Virgil van Dijk",
    overall: 89,
    position: "ZAG",
    age: 34,
    photoUrl:
      "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p203376.png?padding=0.7",
    defaultTeam: "Liverpool",
    ballType: "BOLA_PRETA",
  },
  {
    id: "a0000000-0000-4000-8000-000000000014",
    name: "Alisson Becker",
    overall: 89,
    position: "GOL",
    age: 32,
    photoUrl:
      "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p212831.png?padding=0.7",
    defaultTeam: "Liverpool",
    ballType: "BOLA_PRETA",
  },
  {
    id: "a0000000-0000-4000-8000-000000000016",
    name: "Jamal Musiala",
    overall: 89,
    position: "MEI",
    age: 22,
    photoUrl:
      "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p256790.png?padding=0.7",
    defaultTeam: "Bayern München",
    ballType: "BOLA_PRETA",
  },
  {
    id: "a0000000-0000-4000-8000-000000000020",
    name: "Florian Wirtz",
    overall: 89,
    position: "MEI",
    age: 22,
    photoUrl:
      "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p256630.png?padding=0.7",
    defaultTeam: "Bayern München",
    ballType: "BOLA_PRETA",
  },
  {
    id: "a0000000-0000-4000-8000-000000000006",
    name: "Lamine Yamal",
    overall: 88,
    position: "PD",
    age: 18,
    photoUrl:
      "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p277643.png?padding=0.7",
    defaultTeam: "FC Barcelona",
    ballType: "BOLA_PRETA",
  },
  {
    id: "a0000000-0000-4000-8000-000000000009",
    name: "Bukayo Saka",
    overall: 88,
    position: "PD",
    age: 24,
    photoUrl:
      "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p246669.png?padding=0.7",
    defaultTeam: "Arsenal",
    ballType: "BOLA_PRETA",
  },
  {
    id: "a0000000-0000-4000-8000-000000000012",
    name: "William Saliba",
    overall: 88,
    position: "ZAG",
    age: 24,
    photoUrl:
      "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p243715.png?padding=0.7",
    defaultTeam: "Arsenal",
    ballType: "BOLA_PRETA",
  },
  {
    id: "a0000000-0000-4000-8000-000000000015",
    name: "Pedri González",
    overall: 88,
    position: "MC",
    age: 22,
    photoUrl:
      "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p251854.png?padding=0.7",
    defaultTeam: "FC Barcelona",
    ballType: "BOLA_PRETA",
  },
  {
    id: "a0000000-0000-4000-8000-000000000024",
    name: "Raphinha",
    overall: 87,
    position: "PE",
    age: 28,
    photoUrl:
      "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p233419.png?padding=0.7",
    defaultTeam: "FC Barcelona",
    ballType: "BOLA_PRETA",
  },
  {
    id: "a0000000-0000-4000-8000-000000000017",
    name: "Cole Palmer",
    overall: 87,
    position: "MEI",
    age: 23,
    photoUrl:
      "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p257534.png?padding=0.7",
    defaultTeam: "Chelsea",
    ballType: "BOLA_PRETA",
  },
  {
    id: "a0000000-0000-4000-8000-000000000018",
    name: "Pedro Guilherme",
    overall: 84,
    position: "ATA",
    age: 28,
    photoUrl: "/players/pedro.png?v=2",
    defaultTeam: "Flamengo",
    ballType: "BOLA_OURO",
  },
  {
    id: "a0000000-0000-4000-8000-000000000019",
    name: "Estêvão Willian",
    overall: 83,
    position: "PD",
    age: 18,
    photoUrl: "/players/estevao.png?v=2",
    defaultTeam: "Palmeiras",
    ballType: "BOLA_OURO",
  },
];

export const MOCK_CLUB_TEAMS: ClubTeamDTO[] = [
  {
    id: "c1000000-0000-4000-8000-000000000001",
    leagueId: "11111111-2222-4333-8444-555555555501",
    userId: "20000000-0000-4000-8000-000000000001",
    ownerNickname: "ViniTactical",
    name: "Real Madrid",
    acronym: "RMA",
    badgeUrl: "Real Madrid",
    balance: 1250,
    isDelinquent: false,
    payrollTotal: 185,
    estimatedSquadValue: 1850,
    rosterCount: 4,
  },
  {
    id: "c1000000-0000-4000-8000-000000000002",
    leagueId: "11111111-2222-4333-8444-555555555501",
    userId: "20000000-0000-4000-8000-000000000002",
    ownerNickname: "KauanStrike",
    name: "Manchester City",
    acronym: "MCI",
    badgeUrl: "Manchester City",
    balance: 980,
    isDelinquent: false,
    payrollTotal: 170,
    estimatedSquadValue: 1700,
    rosterCount: 4,
  },
  {
    id: "c1000000-0000-4000-8000-000000000003",
    leagueId: "11111111-2222-4333-8444-555555555501",
    userId: "20000000-0000-4000-8000-000000000003",
    ownerNickname: "LipeGoat10",
    name: "FC Barcelona",
    acronym: "BAR",
    badgeUrl: "FC Barcelona",
    balance: 760,
    isDelinquent: false,
    payrollTotal: 115,
    estimatedSquadValue: 1150,
    rosterCount: 3,
  },
  {
    id: "c1000000-0000-4000-8000-000000000004",
    leagueId: "11111111-2222-4333-8444-555555555501",
    userId: SPOOKY_SUPER_ADMIN_ID,
    ownerNickname: "SPOOKY",
    name: "Bayern München",
    acronym: "BAY",
    badgeUrl: "Bayern München",
    balance: 2400,
    isDelinquent: false,
    payrollTotal: 158,
    estimatedSquadValue: 1580,
    rosterCount: 4,
  },
];

// ============================================================================
// SERVIÇOS DE LEITURA (COM AUTO-TRANSIÇÃO DE LEILÕES + FALLBACK)
// ============================================================================

export async function getMasterLeagueOverviewData() {
  try {
    // Dispara transição automática de leilões agendados (UPCOMING -> ACTIVE) e expirados (ACTIVE -> ENCERRADO)
    await supabaseAdmin.rpc("rpc_sync_auction_statuses");

    const [
      { data: dbAthletes },
      { data: dbClubs },
      { data: dbContracts },
      { data: dbTransactions },
      { data: dbAuctions },
      { data: dbBids },
      { data: dbProposals },
      { data: dbH2H },
      { data: dbPackages },
      { data: dbPurchases },
      { data: dbTransferWindow },
    ] = await Promise.all([
      supabaseAdmin
        .from("athletes")
        .select("*")
        .order("overall", { ascending: false })
        .limit(2000),
      supabaseAdmin
        .from("club_teams")
        .select("*, user:profiles!user_id(nickname)")
        .order("balance", { ascending: false }),
      supabaseAdmin
        .from("contracts")
        .select(
          "*, athlete:athletes!athlete_id(*), club:club_teams!club_team_id(id, name, acronym, user:profiles!user_id(nickname))"
        ),
      supabaseAdmin
        .from("financial_transactions")
        .select("*, club:club_teams!club_team_id(name)")
        .order("created_at", { ascending: false })
        .limit(50),
      supabaseAdmin
        .from("auctions")
        .select(
          "*, athlete:athletes!athlete_id(*), seller:club_teams!seller_club_id(name), winner:club_teams!current_winning_club_id(name, acronym)"
        )
        .order("starts_at", { ascending: true }),
      supabaseAdmin
        .from("auction_bids")
        .select("*, club:club_teams!club_team_id(name, acronym)")
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("transfer_proposals")
        .select(
          "*, fromClub:club_teams!from_club_id(name, acronym), toClub:club_teams!to_club_id(name, acronym)"
        )
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("head_to_head_cache").select("*"),
      supabaseAdmin
        .from("escudo_packages")
        .select("*")
        .eq("active", true)
        .order("escudos_amount", { ascending: true }),
      supabaseAdmin
        .from("escudo_purchases")
        .select(
          "*, club:club_teams!club_team_id(name), pkg:escudo_packages!package_id(name)"
        )
        .order("created_at", { ascending: false })
        .limit(25),
      supabaseAdmin
        .from("transfer_window_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle(),
    ]);

    const athletesList: AthleteDTO[] =
      dbAthletes && dbAthletes.length > 0
        ? dbAthletes.map((a) => ({
            id: a.id,
            name: a.name,
            overall: a.overall,
            position: a.position,
            age: a.age,
            photoUrl: a.photo_url || "/players/mbappe.png",
            defaultTeam: a.default_team,
            ballType: (a.ball_type ||
              (a.overall >= 85 ? "BOLA_PRETA" : "BOLA_OURO")) as BallCategory,
          }))
        : MOCK_ATHLETES;

    const athleteMap = new Map(athletesList.map((a) => [a.id, a]));

    const contractsList: ContractRosterItemDTO[] =
      dbContracts && dbContracts.length > 0
        ? dbContracts.map((c) => {
            const ath = Array.isArray(c.athlete) ? c.athlete[0] : c.athlete;
            const clb = Array.isArray(c.club) ? c.club[0] : c.club;
            const usr = clb?.user
              ? Array.isArray(clb.user)
                ? clb.user[0]
                : clb.user
              : null;
            const ovr = ath?.overall ?? 80;
            return {
              id: c.id,
              clubTeamId: c.club_team_id,
              clubName: clb?.name ?? "Clube",
              clubAcronym: clb?.acronym ?? "CLB",
              ownerNickname: usr?.nickname ?? "Treinador",
              athleteId: c.athlete_id,
              athleteName: ath?.name ?? "Atleta",
              overall: ovr,
              position: ath?.position ?? "MEI",
              age: ath?.age ?? 24,
              photoUrl: ath?.photo_url || "/players/mbappe.png",
              defaultTeam: ath?.default_team ?? "Livre",
              ballType: (ath?.ball_type ||
                (ovr >= 85 ? "BOLA_PRETA" : "BOLA_OURO")) as BallCategory,
              salary: c.salary,
              buyoutClause: c.buyout_clause,
              acquiredAt: c.acquired_at,
            };
          })
        : [];

    const clubsList: ClubTeamDTO[] =
      dbClubs && dbClubs.length > 0
        ? dbClubs.map((c) => {
            const usr = Array.isArray(c.user) ? c.user[0] : c.user;
            const clubRoster = contractsList.filter(
              (r) => r.clubTeamId === c.id
            );
            const payrollTotal = clubRoster.reduce(
              (acc, r) => acc + r.salary,
              0
            );
            const estimatedSquadValue = clubRoster.reduce(
              (acc, r) => acc + r.buyoutClause,
              0
            );
            const expiresAtIso = c.league_pass_expires_at
              ? String(c.league_pass_expires_at)
              : null;
            const isSuper = c.user_id === SPOOKY_SUPER_ADMIN_ID;
            const hasPass =
              isSuper ||
              (expiresAtIso !== null &&
                new Date(expiresAtIso).getTime() > Date.now());
            return {
              id: c.id,
              leagueId: c.league_id,
              userId: c.user_id,
              ownerNickname: usr?.nickname ?? "Treinador",
              name: c.name,
              acronym: c.acronym,
              badgeUrl: c.badge_url || c.name,
              balance: c.balance,
              isDelinquent: Boolean(c.is_delinquent) || c.balance < 0,
              payrollTotal,
              estimatedSquadValue,
              rosterCount: clubRoster.length,
              leaguePassExpiresAt: isSuper
                ? expiresAtIso || "2099-12-31T23:59:59.000Z"
                : expiresAtIso,
              leaguePassMode: isSuper
                ? "ADMIN_GRANTED"
                : String(c.league_pass_mode || "NONE"),
              hasActiveLeaguePass: hasPass,
              tacticalLineup:
                c.tactical_lineup && typeof c.tactical_lineup === "object"
                  ? (c.tactical_lineup as TacticalLineupData)
                  : undefined,
            };
          })
        : [];

    const bidsByAuction = new Map<string, AuctionBidDTO[]>();
    for (const b of dbBids ?? []) {
      const clb = Array.isArray(b.club) ? b.club[0] : b.club;
      const list = bidsByAuction.get(b.auction_id) ?? [];
      list.push({
        id: b.id,
        auctionId: b.auction_id,
        clubTeamId: b.club_team_id,
        clubName: clb?.name ?? "Clube",
        clubAcronym: clb?.acronym ?? "CLB",
        bidAmount: b.bid_amount,
        createdAt: b.created_at,
      });
      bidsByAuction.set(b.auction_id, list);
    }

    const auctionsList: AuctionDTO[] = (dbAuctions ?? []).map((auc) => {
      const ath = Array.isArray(auc.athlete) ? auc.athlete[0] : auc.athlete;
      const seller = Array.isArray(auc.seller) ? auc.seller[0] : auc.seller;
      const winner = Array.isArray(auc.winner) ? auc.winner[0] : auc.winner;
      const ovr = ath?.overall ?? 85;
      return {
        id: auc.id,
        athleteId: auc.athlete_id,
        athleteName: ath?.name ?? "Atleta",
        overall: ovr,
        position: ath?.position ?? "ATA",
        age: ath?.age ?? 25,
        photoUrl: ath?.photo_url || "/players/mbappe.png",
        defaultTeam: ath?.default_team ?? "Europa",
        ballType: (ath?.ball_type ||
          (ovr >= 85 ? "BOLA_PRETA" : "BOLA_OURO")) as BallCategory,
        sellerClubId: auc.seller_club_id,
        sellerClubName: seller?.name ?? "Banco da Liga (Federação)",
        startingBid: auc.starting_bid ?? 100,
        currentBid: auc.current_bid ?? 100,
        minIncrement: auc.min_increment ?? 5,
        currentWinningClubId: auc.current_winning_club_id,
        currentWinningClubName: winner?.name ?? null,
        currentWinningClubAcronym: winner?.acronym ?? null,
        startsAt: auc.starts_at,
        endsAt: auc.ends_at,
        status: auc.status,
        bids: bidsByAuction.get(auc.id) ?? [],
      };
    });

    const transactionsList: FinancialTransactionDTO[] = (
      dbTransactions ?? []
    ).map((tx) => {
      const clb = Array.isArray(tx.club) ? tx.club[0] : tx.club;
      return {
        id: tx.id,
        clubTeamId: tx.club_team_id,
        clubName: clb?.name ?? "Clube",
        type: tx.type as FinancialTxType,
        amount: tx.amount,
        description: String(tx.description ?? "").replace(
          /Escudos?|Striker Coins?/gi,
          "Striker Coins"
        ),
        createdAt: tx.created_at,
      };
    });

    const proposalsList: TransferProposalDTO[] = (dbProposals ?? []).map(
      (p) => {
        const fromClub = Array.isArray(p.fromClub) ? p.fromClub[0] : p.fromClub;
        const toClub = Array.isArray(p.toClub) ? p.toClub[0] : p.toClub;
        const offeredIds: string[] = Array.isArray(p.offered_athlete_ids)
          ? p.offered_athlete_ids
          : [];
        const requestedIds: string[] = Array.isArray(p.requested_athlete_ids)
          ? p.requested_athlete_ids
          : [];

        return {
          id: p.id,
          fromClubId: p.from_club_id,
          fromClubName: fromClub?.name ?? "Clube",
          fromClubAcronym: fromClub?.acronym ?? "CLB",
          toClubId: p.to_club_id,
          toClubName: toClub?.name ?? "Clube",
          toClubAcronym: toClub?.acronym ?? "CLB",
          cashAmount: p.cash_amount,
          offeredAthletes: offeredIds
            .map((id) => athleteMap.get(id))
            .filter((x): x is AthleteDTO => Boolean(x)),
          requestedAthletes: requestedIds
            .map((id) => athleteMap.get(id))
            .filter((x): x is AthleteDTO => Boolean(x)),
          status: p.status,
          createdAt: p.created_at,
        };
      }
    );

    const h2hRecords = (dbH2H ?? []).map((h) => ({
      id: h.id,
      teamAId: h.team_a_id,
      teamBId: h.team_b_id,
      winsA: h.wins_a,
      winsB: h.wins_b,
      draws: h.draws,
      goalsA: h.goals_a,
      goalsB: h.goals_b,
    }));

    const packagesList: EscudoPackageDTO[] =
      dbPackages && dbPackages.length > 0
        ? dbPackages.map((p) => ({
            id: p.id,
            name: String(p.name ?? "").replace(
              /Escudos?|Striker Coins?/gi,
              "Striker Coins"
            ),
            escudosAmount: p.escudos_amount,
            priceBrlCents: p.price_brl_cents,
            badgeLabel: p.badge_label,
            isFeatured: Boolean(p.is_featured),
            active: Boolean(p.active),
          }))
        : MOCK_ESCUDO_PACKAGES;

    const purchasesList: EscudoPurchaseDTO[] = (dbPurchases ?? []).map((p) => {
      const clb = Array.isArray(p.club) ? p.club[0] : p.club;
      const pkg = Array.isArray(p.pkg) ? p.pkg[0] : p.pkg;
      return {
        id: p.id,
        clubTeamId: p.club_team_id,
        clubName: clb?.name ?? "Clube",
        packageId: p.package_id,
        packageName: String(pkg?.name ?? "Pacote de Striker Coins").replace(
          /Escudos?|Striker Coins?/gi,
          "Striker Coins"
        ),
        escudosCredited: p.escudos_credited,
        amountPaidBrlCents: p.amount_paid_brl_cents,
        paymentMethod: p.payment_method,
        paymentStatus: p.payment_status,
        externalReference: p.external_reference,
        createdAt: p.created_at,
      };
    });

    const nowMs = Date.now();
    const defaultOpensAt = new Date(nowMs - 3600_000).toISOString();
    const defaultClosesAt = new Date(nowMs + 7 * 86400_000).toISOString();
    const forceStatus = (dbTransferWindow?.force_status || "AUTO") as
      | "AUTO"
      | "OPEN"
      | "CLOSED";
    const opensAt = dbTransferWindow?.opens_at || defaultOpensAt;
    const closesAt = dbTransferWindow?.closes_at || defaultClosesAt;
    const isOpenNow =
      forceStatus === "OPEN"
        ? true
        : forceStatus === "CLOSED"
        ? false
        : nowMs >= new Date(opensAt).getTime() &&
          nowMs <= new Date(closesAt).getTime();

    const transferWindow: TransferWindowSettingsDTO = {
      windowName:
        dbTransferWindow?.window_name ||
        "1ª Janela Oficial de Transferências & Multas",
      forceStatus,
      opensAt,
      closesAt,
      buyoutEnabled: dbTransferWindow?.buyout_enabled ?? true,
      tradesEnabled: dbTransferWindow?.trades_enabled ?? true,
      freeAgencyEnabled: dbTransferWindow?.free_agency_enabled ?? true,
      isOpenNow,
    };

    return {
      athletes: athletesList,
      clubs: clubsList,
      contracts: contractsList,
      auctions: auctionsList,
      transactions: transactionsList,
      proposals: proposalsList,
      h2hRecords,
      escudoPackages: packagesList,
      escudoPurchases: purchasesList,
      transferWindow,
    };
  } catch {
    const nowMs = Date.now();
    return {
      athletes: MOCK_ATHLETES,
      clubs: [],
      contracts: [],
      auctions: [],
      transactions: [],
      proposals: [],
      h2hRecords: [],
      escudoPackages: MOCK_ESCUDO_PACKAGES,
      escudoPurchases: [],
      transferWindow: {
        windowName: "1ª Janela Oficial de Transferências & Multas",
        forceStatus: "AUTO" as const,
        opensAt: new Date(nowMs - 3600_000).toISOString(),
        closesAt: new Date(nowMs + 7 * 86400_000).toISOString(),
        buyoutEnabled: true,
        tradesEnabled: true,
        freeAgencyEnabled: true,
        isOpenNow: true,
      },
    };
  }
}

/**
 * Motor do Freguesômetro: Calcula estatísticas diretas entre dois clubes/usuários
 */
export function computeHeadToHeadBetweenClubs(
  teamA: ClubTeamDTO,
  teamB: ClubTeamDTO,
  h2hRecords: {
    teamAId: string;
    teamBId: string;
    winsA: number;
    winsB: number;
    draws: number;
    goalsA: number;
    goalsB: number;
  }[]
): HeadToHeadResultDTO {
  let winsA = 0;
  let winsB = 0;
  let draws = 0;
  let goalsA = 0;
  let goalsB = 0;

  const direct = h2hRecords.find(
    (r) =>
      (r.teamAId === teamA.id && r.teamBId === teamB.id) ||
      (r.teamAId === teamB.id && r.teamBId === teamA.id)
  );

  if (direct) {
    if (direct.teamAId === teamA.id) {
      winsA = direct.winsA;
      winsB = direct.winsB;
      draws = direct.draws;
      goalsA = direct.goalsA;
      goalsB = direct.goalsB;
    } else {
      winsA = direct.winsB;
      winsB = direct.winsA;
      draws = direct.draws;
      goalsA = direct.goalsB;
      goalsB = direct.goalsA;
    }
  }

  const totalMatches = winsA + winsB + draws;
  const maxPoints = totalMatches * 3;
  const pointsA = winsA * 3 + draws;
  const pointsB = winsB * 3 + draws;

  const winRateA = maxPoints > 0 ? Math.round((pointsA / maxPoints) * 100) : 0;
  const winRateB = maxPoints > 0 ? Math.round((pointsB / maxPoints) * 100) : 0;

  let freguesClubName: string | null = null;
  let freguesCoachName: string | null = null;
  let carrascoClubName: string | null = null;
  let dominanceLabel =
    totalMatches === 0 ? "NENHUM CONFRONTO REGISTRADO" : "CONFRONTO EQUILIBRADO";

  if (winsA > winsB) {
    freguesClubName = teamB.name;
    freguesCoachName = teamB.ownerNickname;
    carrascoClubName = teamA.name;
    dominanceLabel =
      winsA - winsB >= 3
        ? `FREGUESIA HISTÓRICA DE ${teamB.name.toUpperCase()}`
        : `VANTAGEM DE ${teamA.name.toUpperCase()}`;
  } else if (winsB > winsA) {
    freguesClubName = teamA.name;
    freguesCoachName = teamA.ownerNickname;
    carrascoClubName = teamB.name;
    dominanceLabel =
      winsB - winsA >= 3
        ? `FREGUESIA HISTÓRICA DE ${teamA.name.toUpperCase()}`
        : `VANTAGEM DE ${teamB.name.toUpperCase()}`;
  }

  return {
    teamA,
    teamB,
    totalMatches,
    winsA,
    winsB,
    draws,
    goalsA,
    goalsB,
    winRateA,
    winRateB,
    freguesClubName,
    freguesCoachName,
    carrascoClubName,
    dominanceLabel,
    recentMatches: [],
  };
}
