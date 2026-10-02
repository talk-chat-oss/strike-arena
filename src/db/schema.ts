import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// ENUMS
// ============================================================================

export const userRoleEnum = pgEnum("user_role", [
  "player",
  "organizer",
  "super_admin",
]);

export const gameEnum = pgEnum("game_title", ["ea_fc", "efootball"]);

export const platformEnum = pgEnum("platform_type", [
  "ps5",
  "xbox",
  "pc",
  "crossplay",
]);

export const tournamentFormatEnum = pgEnum("tournament_format", [
  "round_robin",
  "single_elimination",
  "double_elimination",
  "groups_playoffs",
]);

export const tournamentStatusEnum = pgEnum("tournament_status", [
  "draft",
  "open",
  "in_progress",
  "completed",
]);

export const checkinStatusEnum = pgEnum("checkin_status", [
  "pending",
  "checked_in",
  "eliminated",
  "disqualified",
]);

export const matchStageEnum = pgEnum("match_stage", [
  "group",
  "round_of_16",
  "quarterfinal",
  "semifinal",
  "third_place",
  "final",
]);

export const matchStatusEnum = pgEnum("match_status", [
  "scheduled",
  "awaiting_confirmation",
  "completed",
  "disputed",
  "walkover",
]);

export const financialTxTypeEnum = pgEnum("financial_tx_type", [
  "PREMIO_VITORIA",
  "GOL_MARCADO",
  "META_PATROCINADOR",
  "TITULO",
  "SALARIO_PAGO",
  "TRANSFERENCIA",
  "MULTA_PAGA",
  "RECARGA_ESCUDOS",
  "BLOQUEIO_LANCE",
  "ESTORNO_LANCE",
  "ARREMATE_LEILAO",
]);

export const transferProposalStatusEnum = pgEnum("transfer_proposal_status", [
  "PENDENTE",
  "ACEITA",
  "RECUSADA",
  "CANCELADA",
]);

export const auctionStatusEnum = pgEnum("auction_status", [
  "AGENDADO",
  "ATIVO",
  "ENCERRADO",
  "CANCELADO",
]);


// ============================================================================
// 1. USERS / PROFILES
// ============================================================================

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    nickname: varchar("nickname", { length: 64 }).notNull(),
    email: varchar("email", { length: 255 }),
    role: userRoleEnum("role").default("player").notNull(),
    psnId: varchar("psn_id", { length: 64 }),
    xboxGamertag: varchar("xbox_gamertag", { length: 64 }),
    eaId: varchar("ea_id", { length: 64 }),
    konamiId: varchar("konami_id", { length: 64 }),
    discordHandle: varchar("discord_handle", { length: 64 }),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("profiles_nickname_idx").on(table.nickname),
    index("profiles_role_idx").on(table.role),
  ]
);

// ============================================================================
// 2. TEAMS / ROSTERS (Pro Clubs / 11v11 / Elenco Fixo)
// ============================================================================

export const teams = pgTable(
  "teams",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    tag: varchar("tag", { length: 8 }).notNull(),
    logoUrl: text("logo_url"),
    captainId: uuid("captain_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    game: gameEnum("game").notNull(),
    platform: platformEnum("platform").default("crossplay").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("teams_captain_idx").on(table.captainId)]
);

// ============================================================================
// 3. TOURNAMENTS
// ============================================================================

export const tournaments = pgTable(
  "tournaments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull(),
    organizerId: uuid("organizer_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    format: tournamentFormatEnum("format")
      .default("groups_playoffs")
      .notNull(),
    game: gameEnum("game").notNull(),
    platform: platformEnum("platform").default("crossplay").notNull(),
    status: tournamentStatusEnum("status").default("draft").notNull(),
    maxParticipants: integer("max_participants").default(8).notNull(),
    entryFeeBrl: integer("entry_fee_brl").default(0).notNull(),
    prizePoolBrl: integer("prize_pool_brl").default(0).notNull(),
    bannerUrl: text("banner_url"),
    rulesMarkdown: text("rules_markdown").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("tournaments_slug_idx").on(table.slug),
    index("tournaments_status_game_idx").on(table.status, table.game),
    index("tournaments_organizer_idx").on(table.organizerId),
  ]
);

// ============================================================================
// 4. GROUPS & BRACKETS
// ============================================================================

export const tournamentGroups = pgTable(
  "tournament_groups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 64 }).notNull(), // e.g., "Grupo A"
    code: varchar("code", { length: 8 }).notNull(), // e.g., "A"
    displayOrder: integer("display_order").default(1).notNull(),
  },
  (table) => [
    index("tournament_groups_tournament_idx").on(table.tournamentId),
  ]
);

// ============================================================================
// 5. PARTICIPANTS (Vínculo Jogador/Time <-> Torneio)
// ============================================================================

export const participants = pgTable(
  "participants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    teamId: uuid("team_id").references(() => teams.id, {
      onDelete: "set null",
    }),
    groupId: uuid("group_id").references(() => tournamentGroups.id, {
      onDelete: "set null",
    }),
    seed: integer("seed"),
    clubName: varchar("club_name", { length: 100 }).notNull(), // Clube escolhido (ex: Real Madrid, Flamengo)
    checkinStatus: checkinStatusEnum("checkin_status")
      .default("pending")
      .notNull(),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("participants_tournament_user_idx").on(
      table.tournamentId,
      table.userId
    ),
    index("participants_group_idx").on(table.groupId),
  ]
);

// ============================================================================
// 6. STANDINGS / CLASSIFICAÇÃO
// ============================================================================

export const standings = pgTable(
  "standings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    groupId: uuid("group_id").references(() => tournamentGroups.id, {
      onDelete: "cascade",
    }),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    points: integer("points").default(0).notNull(),
    matchesPlayed: integer("matches_played").default(0).notNull(),
    wins: integer("wins").default(0).notNull(),
    draws: integer("draws").default(0).notNull(),
    losses: integer("losses").default(0).notNull(),
    goalsFor: integer("goals_for").default(0).notNull(),
    goalsAgainst: integer("goals_against").default(0).notNull(),
    goalDifference: integer("goal_difference").default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("standings_participant_unique_idx").on(
      table.tournamentId,
      table.participantId
    ),
    index("standings_ranking_idx").on(
      table.tournamentId,
      table.groupId,
      table.points,
      table.goalDifference,
      table.goalsFor
    ),
  ]
);

// ============================================================================
// 7. MATCHES & MATCH HUB MESSAGES
// ============================================================================

export interface MatchGoalScorer {
  athleteId?: string;
  athleteName: string;
  goals: number;
}

export const matches = pgTable(
  "matches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    groupId: uuid("group_id").references(() => tournamentGroups.id, {
      onDelete: "set null",
    }),
    stage: matchStageEnum("stage").default("group").notNull(),
    round: integer("round").default(1).notNull(),
    bracketPosition: integer("bracket_position"), // 1..4 nas semis/final
    label: varchar("label", { length: 64 }), // ex: "Semifinal 1", "Grande Final"
    homeParticipantId: uuid("home_participant_id").references(
      () => participants.id,
      { onDelete: "set null" }
    ),
    awayParticipantId: uuid("away_participant_id").references(
      () => participants.id,
      { onDelete: "set null" }
    ),
    homeTeamId: uuid("home_team_id"),
    awayTeamId: uuid("away_team_id"),
    homeScore: integer("home_score"),
    awayScore: integer("away_score"),
    homeGoalsScorers: jsonb("home_goals_scorers")
      .$type<MatchGoalScorer[]>()
      .default([]),
    awayGoalsScorers: jsonb("away_goals_scorers")
      .$type<MatchGoalScorer[]>()
      .default([]),
    winnerParticipantId: uuid("winner_participant_id").references(
      () => participants.id,
      { onDelete: "set null" }
    ),
    proofUrl: text("proof_url"),
    reportedById: uuid("reported_by_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    status: matchStatusEnum("status").default("scheduled").notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    playedAt: timestamp("played_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("matches_tournament_stage_round_idx").on(
      table.tournamentId,
      table.stage,
      table.round
    ),
    index("matches_status_idx").on(table.status),
  ]
);

export const matchMessages = pgTable(
  "match_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("match_messages_match_idx").on(table.matchId)]
);

// ============================================================================
// 8. MASTER LIGA ONLINE: ATHLETES (Base Global de Jogadores de Futebol)
// ============================================================================

export const athletes = pgTable(
  "athletes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    overall: integer("overall").default(80).notNull(),
    position: varchar("position", { length: 16 }).notNull(), // ATA, PE, PD, MEI, MC, VOL, ZAG, LE, LD, GOL
    age: integer("age").default(24).notNull(),
    photoUrl: text("photo_url"),
    defaultTeam: varchar("default_team", { length: 100 }).notNull(),
    ballType: varchar("ball_type", { length: 24 })
      .default("BOLA_PRETA")
      .notNull(), // BOLA_PRETA, BOLA_OURO, BOLA_PRATA
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("athletes_overall_idx").on(table.overall),
    index("athletes_position_idx").on(table.position),
  ]
);

// ============================================================================
// 9. MASTER LIGA ONLINE: CLUB TEAMS (Times dos Usuários na Liga)
// ============================================================================

export const clubTeams = pgTable(
  "club_teams",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    leagueId: uuid("league_id").references(() => tournaments.id, {
      onDelete: "set null",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    acronym: varchar("acronym", { length: 8 }).notNull(),
    badgeUrl: text("badge_url"),
    balance: integer("balance").default(1000).notNull(), // Moeda interna oficial: Escudos
    isDelinquent: boolean("is_delinquent").default(false).notNull(), // Status de inadimplência/punição
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("club_teams_user_idx").on(table.userId),
    index("club_teams_league_idx").on(table.leagueId),
  ]
);

// ============================================================================
// 10. MASTER LIGA ONLINE: CONTRACTS / ROSTER (Elenco do Clube)
// ============================================================================

export const contracts = pgTable(
  "contracts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clubTeamId: uuid("club_team_id")
      .notNull()
      .references(() => clubTeams.id, { onDelete: "cascade" }),
    athleteId: uuid("athlete_id")
      .notNull()
      .references(() => athletes.id, { onDelete: "cascade" }),
    salary: integer("salary").default(25).notNull(), // Em Escudos (definido pelo treinador)
    buyoutClause: integer("buyout_clause").default(250).notNull(), // Em Escudos (10x salário)
    acquiredAt: timestamp("acquired_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("contracts_athlete_unique_idx").on(table.athleteId),
    index("contracts_club_team_idx").on(table.clubTeamId),
  ]
);

// ============================================================================
// 11. MASTER LIGA ONLINE: FINANCIAL TRANSACTIONS (Fluxo de Caixa)
// ============================================================================

export const financialTransactions = pgTable(
  "financial_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clubTeamId: uuid("club_team_id")
      .notNull()
      .references(() => clubTeams.id, { onDelete: "cascade" }),
    type: financialTxTypeEnum("type").notNull(),
    amount: integer("amount").notNull(), // Em Escudos: Positivo (entrada) ou Negativo (saída)
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("financial_tx_club_idx").on(table.clubTeamId, table.createdAt),
  ]
);

// ============================================================================
// 12. MASTER LIGA ONLINE: TRANSFER PROPOSALS (Negociações Diretas e Trocas)
// ============================================================================

export const transferProposals = pgTable(
  "transfer_proposals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fromClubId: uuid("from_club_id")
      .notNull()
      .references(() => clubTeams.id, { onDelete: "cascade" }),
    toClubId: uuid("to_club_id")
      .notNull()
      .references(() => clubTeams.id, { onDelete: "cascade" }),
    cashAmount: integer("cash_amount").default(0).notNull(),
    offeredAthleteIds: jsonb("offered_athlete_ids")
      .$type<string[]>()
      .default([])
      .notNull(),
    requestedAthleteIds: jsonb("requested_athlete_ids")
      .$type<string[]>()
      .default([])
      .notNull(),
    status: transferProposalStatusEnum("status").default("PENDENTE").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("transfer_proposals_from_idx").on(table.fromClubId),
    index("transfer_proposals_to_idx").on(table.toClubId),
    index("transfer_proposals_status_idx").on(table.status),
  ]
);

// ============================================================================
// 13. MASTER LIGA ONLINE: AUCTIONS & BIDS (Leilões Agendados e Ativos)
// ============================================================================

export const auctions = pgTable(
  "auctions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    athleteId: uuid("athlete_id")
      .notNull()
      .references(() => athletes.id, { onDelete: "cascade" }),
    sellerClubId: uuid("seller_club_id").references(() => clubTeams.id, {
      onDelete: "set null",
    }),
    startingBid: integer("starting_bid").default(100).notNull(),
    currentBid: integer("current_bid").default(100).notNull(),
    minIncrement: integer("min_increment").default(5).notNull(),
    currentWinningClubId: uuid("current_winning_club_id").references(
      () => clubTeams.id,
      { onDelete: "set null" }
    ),
    startsAt: timestamp("starts_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    status: auctionStatusEnum("status").default("ATIVO").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("auctions_status_ends_idx").on(table.status, table.endsAt),
    index("auctions_athlete_idx").on(table.athleteId),
  ]
);

export const auctionBids = pgTable(
  "auction_bids",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    auctionId: uuid("auction_id")
      .notNull()
      .references(() => auctions.id, { onDelete: "cascade" }),
    clubTeamId: uuid("club_team_id")
      .notNull()
      .references(() => clubTeams.id, { onDelete: "cascade" }),
    bidAmount: integer("bid_amount").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("auction_bids_auction_idx").on(table.auctionId)]
);

// ============================================================================
// 14. MASTER LIGA ONLINE: HEAD TO HEAD CACHE (Base do Freguesômetro)
// ============================================================================

export const headToHeadCache = pgTable(
  "head_to_head_cache",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teamAId: uuid("team_a_id")
      .notNull()
      .references(() => clubTeams.id, { onDelete: "cascade" }),
    teamBId: uuid("team_b_id")
      .notNull()
      .references(() => clubTeams.id, { onDelete: "cascade" }),
    winsA: integer("wins_a").default(0).notNull(),
    winsB: integer("wins_b").default(0).notNull(),
    draws: integer("draws").default(0).notNull(),
    goalsA: integer("goals_a").default(0).notNull(),
    goalsB: integer("goals_b").default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("h2h_teams_unique_idx").on(table.teamAId, table.teamBId),
  ]
);

// ============================================================================
// 15. LOJA DE ESCUDOS (PACOTES PROMOCIONAIS & COMPRAS AUDITÁVEIS)
// ============================================================================

export const escudoPackages = pgTable("escudo_packages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  escudosAmount: integer("escudos_amount").notNull(),
  priceBrlCents: integer("price_brl_cents").notNull(), // ex: 2000 = R$ 20,00
  badgeLabel: varchar("badge_label", { length: 64 }),
  isFeatured: boolean("is_featured").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const escudoPurchases = pgTable(
  "escudo_purchases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clubTeamId: uuid("club_team_id")
      .notNull()
      .references(() => clubTeams.id, { onDelete: "cascade" }),
    packageId: uuid("package_id")
      .notNull()
      .references(() => escudoPackages.id, { onDelete: "restrict" }),
    escudosCredited: integer("escudos_credited").notNull(),
    amountPaidBrlCents: integer("amount_paid_brl_cents").notNull(),
    paymentMethod: varchar("payment_method", { length: 32 })
      .default("PIX")
      .notNull(),
    paymentStatus: varchar("payment_status", { length: 32 })
      .default("CONFIRMED")
      .notNull(),
    externalReference: varchar("external_reference", { length: 120 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("escudo_purchases_club_idx").on(table.clubTeamId)]
);

// ============================================================================
// RELATIONS
// ============================================================================

export const profilesRelations = relations(profiles, ({ many }) => ({
  organizedTournaments: many(tournaments),
  participations: many(participants),
  captainedTeams: many(teams),
  clubTeams: many(clubTeams),
}));

export const tournamentsRelations = relations(tournaments, ({ one, many }) => ({
  organizer: one(profiles, {
    fields: [tournaments.organizerId],
    references: [profiles.id],
  }),
  groups: many(tournamentGroups),
  participants: many(participants),
  matches: many(matches),
  standings: many(standings),
  clubTeams: many(clubTeams),
}));

export const tournamentGroupsRelations = relations(
  tournamentGroups,
  ({ one, many }) => ({
    tournament: one(tournaments, {
      fields: [tournamentGroups.tournamentId],
      references: [tournaments.id],
    }),
    participants: many(participants),
    standings: many(standings),
    matches: many(matches),
  })
);

export const participantsRelations = relations(
  participants,
  ({ one, many }) => ({
    tournament: one(tournaments, {
      fields: [participants.tournamentId],
      references: [tournaments.id],
    }),
    user: one(profiles, {
      fields: [participants.userId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [participants.teamId],
      references: [teams.id],
    }),
    group: one(tournamentGroups, {
      fields: [participants.groupId],
      references: [tournamentGroups.id],
    }),
    standing: many(standings),
  })
);

export const standingsRelations = relations(standings, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [standings.tournamentId],
    references: [tournaments.id],
  }),
  group: one(tournamentGroups, {
    fields: [standings.groupId],
    references: [tournamentGroups.id],
  }),
  participant: one(participants, {
    fields: [standings.participantId],
    references: [participants.id],
  }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  tournament: one(tournaments, {
    fields: [matches.tournamentId],
    references: [tournaments.id],
  }),
  group: one(tournamentGroups, {
    fields: [matches.groupId],
    references: [tournamentGroups.id],
  }),
  homeParticipant: one(participants, {
    fields: [matches.homeParticipantId],
    references: [participants.id],
    relationName: "homeParticipant",
  }),
  awayParticipant: one(participants, {
    fields: [matches.awayParticipantId],
    references: [participants.id],
    relationName: "awayParticipant",
  }),
  homeClubTeam: one(clubTeams, {
    fields: [matches.homeTeamId],
    references: [clubTeams.id],
    relationName: "homeClubTeam",
  }),
  awayClubTeam: one(clubTeams, {
    fields: [matches.awayTeamId],
    references: [clubTeams.id],
    relationName: "awayClubTeam",
  }),
  winnerParticipant: one(participants, {
    fields: [matches.winnerParticipantId],
    references: [participants.id],
    relationName: "winnerParticipant",
  }),
  reportedBy: one(profiles, {
    fields: [matches.reportedById],
    references: [profiles.id],
  }),
  messages: many(matchMessages),
}));

export const athletesRelations = relations(athletes, ({ many }) => ({
  contracts: many(contracts),
  auctions: many(auctions),
}));

export const clubTeamsRelations = relations(clubTeams, ({ one, many }) => ({
  league: one(tournaments, {
    fields: [clubTeams.leagueId],
    references: [tournaments.id],
  }),
  user: one(profiles, {
    fields: [clubTeams.userId],
    references: [profiles.id],
  }),
  contracts: many(contracts),
  transactions: many(financialTransactions),
  sentProposals: many(transferProposals, { relationName: "sentProposals" }),
  receivedProposals: many(transferProposals, {
    relationName: "receivedProposals",
  }),
  bids: many(auctionBids),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  clubTeam: one(clubTeams, {
    fields: [contracts.clubTeamId],
    references: [clubTeams.id],
  }),
  athlete: one(athletes, {
    fields: [contracts.athleteId],
    references: [athletes.id],
  }),
}));

export const financialTransactionsRelations = relations(
  financialTransactions,
  ({ one }) => ({
    clubTeam: one(clubTeams, {
      fields: [financialTransactions.clubTeamId],
      references: [clubTeams.id],
    }),
  })
);

export const transferProposalsRelations = relations(
  transferProposals,
  ({ one }) => ({
    fromClub: one(clubTeams, {
      fields: [transferProposals.fromClubId],
      references: [clubTeams.id],
      relationName: "sentProposals",
    }),
    toClub: one(clubTeams, {
      fields: [transferProposals.toClubId],
      references: [clubTeams.id],
      relationName: "receivedProposals",
    }),
  })
);

export const auctionsRelations = relations(auctions, ({ one, many }) => ({
  athlete: one(athletes, {
    fields: [auctions.athleteId],
    references: [athletes.id],
  }),
  sellerClub: one(clubTeams, {
    fields: [auctions.sellerClubId],
    references: [clubTeams.id],
    relationName: "sellerClub",
  }),
  currentWinningClub: one(clubTeams, {
    fields: [auctions.currentWinningClubId],
    references: [clubTeams.id],
    relationName: "currentWinningClub",
  }),
  bids: many(auctionBids),
}));

export const auctionBidsRelations = relations(auctionBids, ({ one }) => ({
  auction: one(auctions, {
    fields: [auctionBids.auctionId],
    references: [auctions.id],
  }),
  clubTeam: one(clubTeams, {
    fields: [auctionBids.clubTeamId],
    references: [clubTeams.id],
  }),
}));

