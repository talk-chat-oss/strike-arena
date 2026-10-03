"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { SUPER_ADMIN_ID } from "@/db";
import {
  SESSION_COOKIE_NAME,
  encodeSessionCookie,
} from "@/lib/auth";

export async function registerUserAction(input: {
  nickname: string;
  email: string;
  password: string;
  clubName?: string;
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
  const clubName = input.clubName?.trim() || `${nickname} FC`;
  const acronym = clubName
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 3)
    .toUpperCase() || "CLB";

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

    // Garantir criação da Carteira Global da Conta + Escudo escolhido (sem duplicar escudo em uso)
    await supabaseAdmin.rpc("rpc_ensure_user_account_club", {
      p_user_id: created.id,
      p_nickname: created.nickname,
      p_preferred_crest: clubName,
    });

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
      message: `Conta "${created.nickname}" e escudo "${clubName}" criados com sucesso! Você ganhou +500 Striker Coins no ato da inscrição.`,
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

    if (userRow.password_hash && userRow.password_hash !== pwd) {
      return { ok: false, error: "Senha incorreta." };
    }

    // Garantir que a conta do usuário possui Carteira Global + Escudo vinculado
    await supabaseAdmin.rpc("rpc_ensure_user_account_club", {
      p_user_id: userRow.id,
      p_nickname: userRow.nickname,
      p_preferred_crest: null,
    });

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

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  revalidatePath("/", "layout");
  return { ok: true };
}
