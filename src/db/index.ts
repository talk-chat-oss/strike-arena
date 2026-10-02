import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://strike_admin:strike_arena_2026_password@192.168.1.104:5433/strike_arena";

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn =
  globalForDb.conn ??
  postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 5,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
}

export const db = drizzle(conn, { schema });
export * from "./schema";

export const SUPER_ADMIN_ID = "80193776-6790-457c-906d-ed45ea16df9f";

export function isSuperAdmin(userId?: string | null): boolean {
  return userId === SUPER_ADMIN_ID;
}
