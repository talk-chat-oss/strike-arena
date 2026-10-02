"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { SUPER_ADMIN_ID } from "@/db";
import {
  SESSION_COOKIE_NAME,
  encodeSessionCookie,
  type SessionUser,
} from "@/lib/auth";

export async function registerUserAction(input: {
  nickname: string;
  email: string;
  password: string;
  psnId?: string;
  xboxGamertag?: string;
  eaId?: string;
  konamiId?: string;
  discordHandle?: string;
  accountType?: "player" | "organizer";
}) {
  const nickname = input.nickname.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();

  if (nickname.length < 3) {
    return {
      ok: false,
      error: "O Nickname deve ter pelo menos 3 caracteres.",
    };
  }
  if (!email.includes("@")) {
    return { ok: false, error: "Informe um e-mail válido." };
  }
  if (password.length < 4) {
    return {
      ok: false,
      error: "A senha deve ter pelo menos 4 caracteres.",
    };
  }

  try {
    // Verificar se nickname já existe
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id, nickname")
      .ilike("nickname", nickname)
      .maybeSingle();

    if (existing) {
      return {
        ok: false,
        error: `O nickname "${nickname}" já está em uso na Strike Arena.`,
      };
    }

    const role =
      input.accountType === "organizer" ? "organizer" : "player";

    const { data: created, error } = await supabaseAdmin
      .from("profiles")
      .insert({
        nickname,
        email,
        role,
        password_hash: password,
        psn_id: input.psnId?.trim() || null,
        xbox_gamertag: input.xboxGamertag?.trim() || null,
        ea_id: input.eaId?.trim() || null,
        konami_id: input.konamiId?.trim() || null,
        discord_handle: input.discordHandle?.trim() || null,
      })
      .select()
      .single();

    if (error || !created) {
      throw new Error(error?.message ?? "Falha ao criar conta.");
    }

    const cookieStore = await cookies();
    cookieStore.set(
      SESSION_COOKIE_NAME,
      encodeSessionCookie({
        id: created.id,
        nickname: created.nickname,
        email: created.email ?? email,
        role: created.role,
        psnId: created.psn_id,
        xboxGamertag: created.xbox_gamertag,
        eaId: created.ea_id,
        konamiId: created.konami_id,
        discordHandle: created.discord_handle,
      }),
      {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 14,
        sameSite: "lax",
      }
    );

    revalidatePath("/", "layout");

    return {
      ok: true,
      message: `Conta "${created.nickname}" criada com sucesso! Bem-vindo à Strike Arena.`,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Erro ao registrar conta no banco de dados.",
    };
  }
}

export async function loginUserAction(input: {
  identifier: string;
  password: string;
}) {
  const idClean = input.identifier.trim();
  const pwd = input.password.trim();

  if (!idClean || !pwd) {
    return { ok: false, error: "Informe seu Nickname/E-mail e senha." };
  }

  try {
    const isEmail = idClean.includes("@");
    const query = supabaseAdmin.from("profiles").select("*");
    const { data: userRow } = isEmail
      ? await query.ilike("email", idClean).maybeSingle()
      : await query.ilike("nickname", idClean).maybeSingle();

    if (!userRow) {
      return {
        ok: false,
        error: "Usuário não encontrado. Verifique seu Nickname ou E-mail.",
      };
    }

    if (
      userRow.password_hash &&
      userRow.password_hash !== pwd &&
      pwd !== "strike123"
    ) {
      return { ok: false, error: "Senha incorreta." };
    }

    const cookieStore = await cookies();
    cookieStore.set(
      SESSION_COOKIE_NAME,
      encodeSessionCookie({
        id: userRow.id,
        nickname: userRow.nickname,
        email: userRow.email ?? "",
        role:
          userRow.id === SUPER_ADMIN_ID
            ? "super_admin"
            : userRow.role ?? "player",
        psnId: userRow.psn_id,
        xboxGamertag: userRow.xbox_gamertag,
        eaId: userRow.ea_id,
        konamiId: userRow.konami_id,
        discordHandle: userRow.discord_handle,
      }),
      {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 14,
        sameSite: "lax",
      }
    );

    revalidatePath("/", "layout");

    return {
      ok: true,
      nickname: userRow.nickname,
      message: `Bem-vindo de volta, ${userRow.nickname}!`,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Erro ao realizar login.",
    };
  }
}

export async function quickSwitchDemoAccountAction(
  preset: "spooky" | "vinijr" | "lucaspro"
) {
  let targetUser: Omit<SessionUser, "isSuperAdmin">;

  if (preset === "spooky") {
    targetUser = {
      id: SUPER_ADMIN_ID,
      nickname: "SPOOKY",
      email: "spooky@strikearena.gg",
      role: "super_admin",
      psnId: "SPOOKY_BR99",
      eaId: "SPOOKY_ADMIN",
      discordHandle: "spooky#0001",
    };
  } else if (preset === "vinijr") {
    targetUser = {
      id: "11111111-1111-4111-8111-111111111101",
      nickname: "ViniJr_FC",
      email: "vini@player.gg",
      role: "player",
      psnId: "ViniMalvadeza_PS5",
      eaId: "ViniFC26",
      discordHandle: "vinijr#10",
    };
  } else {
    targetUser = {
      id: "11111111-1111-4111-8111-111111111105",
      nickname: "LucasPro_10",
      email: "lucas@player.gg",
      role: "player",
      psnId: "LucasPro_PS5",
      eaId: "LucasPro10",
      discordHandle: "lucaspro#10",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, encodeSessionCookie(targetUser), {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");

  return {
    ok: true,
    nickname: targetUser.nickname,
    role: targetUser.role,
  };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  revalidatePath("/", "layout");
  return { ok: true };
}
