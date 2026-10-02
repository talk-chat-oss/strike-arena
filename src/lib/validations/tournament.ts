import { z } from "zod";

export const submitMatchScoreSchema = z.object({
  matchId: z.string().uuid("ID da partida inválido."),
  tournamentSlug: z.string().min(2),
  homeScore: z.coerce
    .number()
    .int()
    .min(0, "Placar não pode ser negativo.")
    .max(30, "Placar máximo permitido é 30."),
  awayScore: z.coerce
    .number()
    .int()
    .min(0, "Placar não pode ser negativo.")
    .max(30, "Placar máximo permitido é 30."),
  proofUrl: z
    .string()
    .url("Informe uma URL válida do print/comprovante (Discord, Imgur, PSN App, etc.)."),
  notes: z
    .string()
    .max(280, "Observação deve ter no máximo 280 caracteres.")
    .optional()
    .or(z.literal("")),
  requestWalkover: z.boolean().optional().default(false),
});

export type SubmitMatchScoreInput = z.infer<typeof submitMatchScoreSchema>;

export const resolveMatchDisputeSchema = z.object({
  matchId: z.string().uuid("ID da partida inválido."),
  action: z.enum(["approve", "walkover_home", "walkover_away", "dispute"]),
  actorUserId: z.string().uuid().optional(),
});

export const createTournamentSchema = z.object({
  name: z
    .string()
    .min(4, "O nome do torneio deve ter pelo menos 4 caracteres.")
    .max(160),
  slug: z
    .string()
    .min(3)
    .max(180)
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens."),
  game: z.enum(["ea_fc", "efootball"]),
  platform: z.enum(["ps5", "xbox", "pc", "crossplay"]),
  format: z.enum([
    "round_robin",
    "single_elimination",
    "double_elimination",
    "groups_playoffs",
  ]),
  maxParticipants: z.coerce.number().int().min(4).max(128),
  entryFeeBrl: z.coerce.number().int().min(0).max(5000),
  prizePoolBrl: z.coerce.number().int().min(0).max(100000),
  rulesMarkdown: z
    .string()
    .min(20, "Defina as regras básicas do torneio (mínimo 20 caracteres)."),
});

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
