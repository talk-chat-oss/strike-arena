import Link from "next/link";
import { ShieldCheck, UserPlus, UserCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { NavbarMenu } from "./navbar-menu";

export async function Navbar() {
  const user = await getCurrentUser();
  const canManage = user?.isSuperAdmin || user?.role === "organizer";

  return (
    <header className="sticky top-0 z-50 w-full bg-[#090c12]/95 backdrop-blur-md border-b border-[#222c40]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand Logo (Official Strike Arena Shield SVG) */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-[#f4f6fb] font-semibold text-sm tracking-tight hover:opacity-90 transition-opacity"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-strike-arena.svg"
            alt="Strike Arena Logo"
            className="w-7 h-7 object-contain"
          />
          <span className="font-bold tracking-wider">STRIKE ARENA</span>
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium rounded-full bg-[#ffdc2b]/15 text-[#ffdc2b] border border-[#ffdc2b]/30">
            MASTER LIGA
          </span>
        </Link>

        {/* Right Controls: User Identity + Hamburger Dropdown Menu */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              <Link
                href="/auth"
                title="Clique para gerenciar sua conta ou sair"
                className="inline-flex items-center gap-1.5 min-h-9 px-2.5 py-1 rounded-[4px] bg-[#133865]/40 hover:bg-[#133865]/60 border border-[#1c4d8a] text-xs font-medium text-[#f4f6fb] transition-colors"
              >
                {user.isSuperAdmin ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#ffdc2b]" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-[#4ade80]" />
                )}
                <span className="max-w-[110px] sm:max-w-none truncate">
                  {user.nickname}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#ffdc2b] text-[#0e1312] font-bold uppercase">
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
                  className="hidden md:inline-flex items-center justify-center min-h-9 px-3 py-1.5 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-semibold text-xs transition-colors"
                >
                  + Criar Torneio
                </Link>
              )}
            </>
          ) : (
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-1.5 min-h-9 px-3 py-1.5 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-bold text-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Entrar / Criar Conta</span>
              <span className="xs:hidden">Entrar</span>
            </Link>
          )}

          <NavbarMenu canManage={canManage} />
        </div>
      </div>
    </header>
  );
}
