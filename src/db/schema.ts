import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
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
    homeScore: integer("home_score"),
    awayScore: integer("away_score"),
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
// RELATIONS
// ============================================================================

export const profilesRelations = relations(profiles, ({ many }) => ({
  organizedTournaments: many(tournaments),
  participations: many(participants),
  captainedTeams: many(teams),
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
