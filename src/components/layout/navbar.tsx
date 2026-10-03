import Link from "next/link";
import { ShieldCheck, UserPlus, UserCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { ClubCrest } from "@/lib/club-crests";
import { NavbarMenu } from "./navbar-menu";

export async function Navbar() {
  const user = await getCurrentUser();
  const canManage = user?.isSuperAdmin || user?.role === "organizer";

  let accountClub: { name: string; acronym: string; balance: number } | null =
    null;
  if (user) {
    try {
      const { data } = await supabaseAdmin
        .from("club_teams")
        .select("name, acronym, balance")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        accountClub = {
          name: data.name,
          acronym: data.acronym,
          balance: Number(data.balance ?? 0),
        };
      }
    } catch {
      accountClub = null;
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-[#090c12]/95 backdrop-blur-md border-b border-[#222c40]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand Logo (Official Strike Arena Shield) */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 sm:gap-2.5 text-[#f4f6fb] font-semibold text-xs sm:text-sm tracking-tight hover:opacity-90 transition-opacity min-w-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-strike-arena.png"
            alt="Strike Arena Logo Oficial"
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0"
          />
          <span className="font-bold tracking-wider truncate">
            STRIKE ARENA
          </span>
          <span className="hidden md:inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#ffdc2b]/15 text-[#ffdc2b] border border-[#ffdc2b]/30 shrink-0">
            MASTER LIGA
          </span>
        </Link>

        {/* Right Controls: Uniform h-10 buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {user ? (
            <>
              <Link
                href="/dashboard"
                title="Minha Conta Global, Saldo de Escudos e Troca de Escudo"
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 h-10 px-2.5 sm:px-3.5 rounded-[4px] bg-[#133865]/40 hover:bg-[#133865]/60 border border-[#1c4d8a] text-xs font-bold text-[#f4f6fb] transition-colors whitespace-nowrap"
              >
                {accountClub ? (
                  <ClubCrest clubName={accountClub.name} size="sm" />
                ) : user.isSuperAdmin ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#ffdc2b] shrink-0" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-[#4ade80] shrink-0" />
                )}
                <span className="max-w-[68px] sm:max-w-[130px] truncate">
                  {user.nickname}
                </span>
                {accountClub && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-[2px] bg-[#15a34a]/25 border border-[#15a34a]/50 text-[#4ade80] font-extrabold tabular-nums leading-none">
                    {accountClub.balance} E$
                  </span>
                )}
                <span className="hidden lg:inline-flex text-[10px] px-1.5 py-0.5 rounded-full bg-[#ffdc2b] text-[#0e1312] font-extrabold uppercase leading-none">
                  {user.isSuperAdmin
                    ? "ADMIN"
                    : user.role === "organizer"
                    ? "ORG"
                    : "PRO"}
                </span>
              </Link>

              {canManage && (
                <Link
                  href="/organizer"
                  className="hidden md:inline-flex items-center justify-center h-10 px-4 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-extrabold text-xs transition-colors whitespace-nowrap"
                >
                  + Criar Torneio
                </Link>
              )}
            </>
          ) : (
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-1.5 h-10 px-2.5 sm:px-3.5 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-extrabold text-xs transition-colors whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Entrar / Criar Conta</span>
              <span className="sm:hidden">Entrar</span>
            </Link>
          )}

          <NavbarMenu canManage={canManage} />
        </div>
      </div>
    </header>
  );
}

