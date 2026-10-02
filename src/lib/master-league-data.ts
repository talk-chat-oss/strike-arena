import { supabaseAdmin } from "@/lib/supabase";
import { SPOOKY_SUPER_ADMIN_ID } from "@/db/mock-data";

// ============================================================================
// INTERFACES & DTOs (MASTER LIGA ONLINE)
// ============================================================================

export type FinancialTxType =
  | "PREMIO_VITORIA"
  | "GOL_MARCADO"
  | "META_PATROCINADOR"
  | "TITULO"
  | "SALARIO_PAGO"
  | "TRANSFERENCIA"
  | "MULTA_PAGA";

export interface AthleteDTO {
  id: string;
  name: string;
  overall: number;
  position: string;
  age: number;
  photoUrl: string;
  defaultTeam: string;
}

export interface ClubTeamDTO {
  id: string;
  leagueId: string | null;
  userId: string;
  ownerNickname: string;
  name: string;
  acronym: string;
  badgeUrl: string;
  balance: number;
  isDelinquent: boolean;
  payrollTotal: number;
  estimatedSquadValue: number;
  rosterCount: number;
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
  salary: number;
  buyoutClause: number;
  acquiredAt: string;
}

export interface FinancialTransactionDTO {
  id: string;
  clubTeamId: string;
  clubName: string;
  type: FinancialTxType;
  amount: number;
  description: string;
  createdAt: string;
}

export interface AuctionBidDTO {
  id: string;
  auctionId: string;
  clubTeamId: string;
  clubName: string;
  clubAcronym: string;
  bidAmount: number;
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
  sellerClubId: string | null;
  sellerClubName: string;
  currentBid: number;
  currentWinningClubId: string | null;
  currentWinningClubName: string | null;
  currentWinningClubAcronym: string | null;
  startsAt: string;
  endsAt: string;
  status: "ATIVO" | "ENCERRADO" | "CANCELADO";
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
  cashAmount: number;
  offeredAthletes: AthleteDTO[];
  requestedAthletes: AthleteDTO[];
  status: "PENDENTE" | "ACEITA" | "RECUSADA" | "CANCELADA";
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

// ============================================================================
// MOCK DATA COMPLETO (FALLBACK + SEED BASE)
// ============================================================================

export const MOCK_ATHLETES: AthleteDTO[] = [
  {
    id: "a0000000-0000-4000-8000-000000000001",
    name: "Kylian Mbappé",
    overall: 92,
    position: "ATA",
    age: 26,
    photoUrl: "/players/mbappe.png",
    defaultTeam: "Real Madrid",
  },
  {
    id: "a0000000-0000-4000-8000-000000000002",
    name: "Erling Haaland",
    overall: 91,
    position: "ATA",
    age: 25,
    photoUrl: "/players/haaland.png",
    defaultTeam: "Manchester City",
  },
  {
    id: "a0000000-0000-4000-8000-000000000003",
    name: "Vinícius Jr.",
    overall: 91,
    position: "PE",
    age: 25,
    photoUrl: "/players/vinijr.png",
    defaultTeam: "Real Madrid",
  },
  {
    id: "a0000000-0000-4000-8000-000000000004",
    name: "Jude Bellingham",
    overall: 90,
    position: "MEI",
    age: 22,
    photoUrl: "/players/bellingham.png",
    defaultTeam: "Real Madrid",
  },
  {
    id: "a0000000-0000-4000-8000-000000000005",
    name: "Rodri Hernández",
    overall: 91,
    position: "VOL",
    age: 29,
    photoUrl: "/players/rodri.png",
    defaultTeam: "Manchester City",
  },
  {
    id: "a0000000-0000-4000-8000-000000000006",
    name: "Lamine Yamal",
    overall: 88,
    position: "PD",
    age: 18,
    photoUrl: "/players/yamal.png",
    defaultTeam: "FC Barcelona",
  },
  {
    id: "a0000000-0000-4000-8000-000000000007",
    name: "Harry Kane",
    overall: 90,
    position: "ATA",
    age: 32,
    photoUrl: "/players/kane.png",
    defaultTeam: "Bayern München",
  },
  {
    id: "a0000000-0000-4000-8000-000000000008",
    name: "Mohamed Salah",
    overall: 89,
    position: "PD",
    age: 33,
    photoUrl: "/players/salah.png",
    defaultTeam: "Liverpool",
  },
  {
    id: "a0000000-0000-4000-8000-000000000009",
    name: "Bukayo Saka",
    overall: 88,
    position: "PD",
    age: 24,
    photoUrl: "/players/saka.png",
    defaultTeam: "Arsenal",
  },
  {
    id: "a0000000-0000-4000-8000-000000000010",
    name: "Federico Valverde",
    overall: 89,
    position: "MC",
    age: 27,
    photoUrl: "/players/valverde.png",
    defaultTeam: "Real Madrid",
  },
  {
    id: "a0000000-0000-4000-8000-000000000011",
    name: "Virgil van Dijk",
    overall: 89,
    position: "ZAG",
    age: 34,
    photoUrl: "/players/vandijk.png",
    defaultTeam: "Liverpool",
  },
  {
    id: "a0000000-0000-4000-8000-000000000012",
    name: "William Saliba",
    overall: 88,
    position: "ZAG",
    age: 24,
    photoUrl: "/players/saliba.png",
    defaultTeam: "Arsenal",
  },
  {
    id: "a0000000-0000-4000-8000-000000000013",
    name: "Thibaut Courtois",
    overall: 90,
    position: "GOL",
    age: 33,
    photoUrl: "/players/courtois.png",
    defaultTeam: "Real Madrid",
  },
  {
    id: "a0000000-0000-4000-8000-000000000014",
    name: "Alisson Becker",
    overall: 89,
    position: "GOL",
    age: 32,
    photoUrl: "/players/alisson.png",
    defaultTeam: "Liverpool",
  },
  {
    id: "a0000000-0000-4000-8000-000000000015",
    name: "Pedri González",
    overall: 88,
    position: "MC",
    age: 22,
    photoUrl: "/players/pedri.png",
    defaultTeam: "FC Barcelona",
  },
  {
    id: "a0000000-0000-4000-8000-000000000016",
    name: "Jamal Musiala",
    overall: 89,
    position: "MEI",
    age: 22,
    photoUrl: "/players/musiala.png",
    defaultTeam: "Bayern München",
  },
  {
    id: "a0000000-0000-4000-8000-000000000017",
    name: "Cole Palmer",
    overall: 87,
    position: "MEI",
    age: 23,
    photoUrl: "/players/palmer.png",
    defaultTeam: "Chelsea",
  },
  {
    id: "a0000000-0000-4000-8000-000000000018",
    name: "Pedro Guilherme",
    overall: 84,
    position: "ATA",
    age: 28,
    photoUrl: "/players/pedro.png",
    defaultTeam: "Flamengo",
  },
  {
    id: "a0000000-0000-4000-8000-000000000019",
    name: "Estêvão Willian",
    overall: 83,
    position: "PD",
    age: 18,
    photoUrl: "/players/estevao.png",
    defaultTeam: "Palmeiras",
  },
  {
    id: "a0000000-0000-4000-8000-000000000020",
    name: "Florian Wirtz",
    overall: 89,
    position: "MEI",
    age: 22,
    photoUrl: "/players/wirtz.png",
    defaultTeam: "Bayern München",
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
    balance: 34500000,
    isDelinquent: false,
    payrollTotal: 3210000,
    estimatedSquadValue: 32100000,
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
    balance: 28900000,
    isDelinquent: false,
    payrollTotal: 3090000,
    estimatedSquadValue: 30900000,
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
    balance: 21400000,
    isDelinquent: false,
    payrollTotal: 1940000,
    estimatedSquadValue: 19400000,
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
    balance: 48000000,
    isDelinquent: false,
    payrollTotal: 3120000,
    estimatedSquadValue: 31200000,
    rosterCount: 4,
  },
];

// ============================================================================
// SERVIÇOS DE LEITURA (SUPABASE + FALLBACK MOCK)
// ============================================================================

export async function getMasterLeagueOverviewData() {
  try {
    const [
      { data: dbAthletes },
      { data: dbClubs },
      { data: dbContracts },
      { data: dbTransactions },
      { data: dbAuctions },
      { data: dbBids },
      { data: dbProposals },
      { data: dbH2H },
    ] = await Promise.all([
      supabaseAdmin
        .from("athletes")
        .select("*")
        .order("overall", { ascending: false }),
      supabaseAdmin
        .from("club_teams")
        .select("*, user:profiles!user_id(nickname)")
        .order("balance", { ascending: false }),
      supabaseAdmin
        .from("contracts")
        .select("*, athlete:athletes!athlete_id(*), club:club_teams!club_team_id(id, name, acronym, user:profiles!user_id(nickname))"),
      supabaseAdmin
        .from("financial_transactions")
        .select("*, club:club_teams!club_team_id(name)")
        .order("created_at", { ascending: false })
        .limit(40),
      supabaseAdmin
        .from("auctions")
        .select("*, athlete:athletes!athlete_id(*), seller:club_teams!seller_club_id(name), winner:club_teams!current_winning_club_id(name, acronym)")
        .order("ends_at", { ascending: true }),
      supabaseAdmin
        .from("auction_bids")
        .select("*, club:club_teams!club_team_id(name, acronym)")
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("transfer_proposals")
        .select("*, fromClub:club_teams!from_club_id(name, acronym), toClub:club_teams!to_club_id(name, acronym)")
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("head_to_head_cache").select("*"),
    ]);

    const athletesList: AthleteDTO[] =
      dbAthletes && dbAthletes.length > 0
        ? dbAthletes.map((a) => ({
            id: a.id,
            name: a.name,
            overall: a.overall,
            position: a.position,
            age: a.age,
            photoUrl:
              a.photo_url ||
              `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(a.name)}`,
            defaultTeam: a.default_team,
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
            return {
              id: c.id,
              clubTeamId: c.club_team_id,
              clubName: clb?.name ?? "Clube",
              clubAcronym: clb?.acronym ?? "CLB",
              ownerNickname: usr?.nickname ?? "Treinador",
              athleteId: c.athlete_id,
              athleteName: ath?.name ?? "Atleta",
              overall: ath?.overall ?? 80,
              position: ath?.position ?? "MEI",
              age: ath?.age ?? 24,
              photoUrl:
                ath?.photo_url ||
                `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(ath?.name || "Player")}`,
              defaultTeam: ath?.default_team ?? "Livre",
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
            };
          })
        : MOCK_CLUB_TEAMS;

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
      return {
        id: auc.id,
        athleteId: auc.athlete_id,
        athleteName: ath?.name ?? "Atleta",
        overall: ath?.overall ?? 85,
        position: ath?.position ?? "ATA",
        age: ath?.age ?? 25,
        photoUrl:
          ath?.photo_url ||
          `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(ath?.name || "Star")}`,
        defaultTeam: ath?.default_team ?? "Europa",
        sellerClubId: auc.seller_club_id,
        sellerClubName: seller?.name ?? "Banco da Liga (Federação)",
        currentBid: auc.current_bid,
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
        description: tx.description,
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

    return {
      athletes: athletesList,
      clubs: clubsList,
      contracts: contractsList,
      auctions: auctionsList,
      transactions: transactionsList,
      proposals: proposalsList,
      h2hRecords,
    };
  } catch {
    return {
      athletes: MOCK_ATHLETES,
      clubs: MOCK_CLUB_TEAMS,
      contracts: [],
      auctions: [],
      transactions: [],
      proposals: [],
      h2hRecords: [],
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
  } else {
    // Fallback determinístico caso ainda não haja registro no cache para o par selecionado
    winsA = 4;
    winsB = 2;
    draws = 1;
    goalsA = 14;
    goalsB = 9;
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
  let dominanceLabel = "CONFRONTO EQUILIBRADO";

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

  const recentMatches = [
    {
      id: "h2h-m1",
      date: "Há 2 dias",
      competition: "Master Liga Season 1 • Rodada 4",
      homeClubName: teamA.name,
      awayClubName: teamB.name,
      homeScore: winsA >= winsB ? 3 : 1,
      awayScore: winsA >= winsB ? 1 : 2,
      scorersSummary:
        winsA >= winsB
          ? `Vinícius Jr. (2x), Bellingham • Haaland`
          : `Rodri, Haaland • Valverde`,
    },
    {
      id: "h2h-m2",
      date: "Há 5 dias",
      competition: "Master Liga Season 1 • Rodada 1",
      homeClubName: teamB.name,
      awayClubName: teamA.name,
      homeScore: 2,
      awayScore: 2,
      scorersSummary: "Partida eletrizante decidida nos acréscimos (90+3')",
    },
    {
      id: "h2h-m3",
      date: "Há 12 dias",
      competition: "Supercopa Strike Arena",
      homeClubName: teamA.name,
      awayClubName: teamB.name,
      homeScore: winsA >= winsB ? 4 : 0,
      awayScore: winsA >= winsB ? 1 : 3,
      scorersSummary: "Domínio tático completo e bônus máximo de artilharia",
    },
  ];

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
    recentMatches,
  };
}
