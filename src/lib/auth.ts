import { cookies } from "next/headers";
import { SUPER_ADMIN_ID, isSuperAdmin } from "@/db";

export const SESSION_COOKIE_NAME = "strike_arena_session";

export interface SessionUser {
  id: string;
  nickname: string;
  email: string;
  role: "player" | "organizer" | "super_admin";
  psnId?: string | null;
  xboxGamertag?: string | null;
  eaId?: string | null;
  konamiId?: string | null;
  discordHandle?: string | null;
  isSuperAdmin: boolean;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!raw) return null;

    const parsed = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf-8")
    ) as SessionUser;

    if (!parsed || !parsed.id || !parsed.nickname) return null;

    const superAdmin =
      isSuperAdmin(parsed.id) || parsed.role === "super_admin";

    return {
      ...parsed,
      role: superAdmin ? "super_admin" : parsed.role || "player",
      isSuperAdmin: superAdmin,
    };
  } catch {
    return null;
  }
}

export function encodeSessionCookie(user: Omit<SessionUser, "isSuperAdmin">): string {
  const superAdmin =
    user.id === SUPER_ADMIN_ID || user.role === "super_admin";
  const payload: SessionUser = {
    ...user,
    role: superAdmin ? "super_admin" : user.role,
    isSuperAdmin: superAdmin,
  };
  return Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
}
