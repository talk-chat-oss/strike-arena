import Link from "next/link";
import {
  Trophy,
  ShieldCheck,
  Swords,
  LayoutDashboard,
  Database,
  UserPlus,
  UserCheck,
  Gavel,
  Briefcase,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export async function Navbar() {
  const user = await getCurrentUser();
  const canManage = user?.isSuperAdmin || user?.role === "organizer";

  return (
    <header className="sticky top-0 z-50 w-full bg-[#090c12]/95 backdrop-blur-md border-b border-[#222c40]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand Logo (Official Strike Arena Shield SVG) */}
        <div className="flex items-center gap-5">
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

          {/* Navigation Links with Kinetic 2px Keycaps */}
          <nav
            aria-label="Navegação principal"
            className="hidden md:flex items-center gap-1"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] text-xs font-medium text-[#b6c0d4] hover:text-[#f4f6fb] hover:bg-[#161d2c] transition-colors"
            >
              <span className="w-4 h-4 rounded-[2px] bg-[#1d2639] text-[#ffdc2b] text-[10px] font-bold inline-flex items-center justify-center">
                1
              </span>
              <Trophy className="w-3.5 h-3.5" />
              <span>Ligas</span>
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] text-xs font-medium text-[#b6c0d4] hover:text-[#f4f6fb] hover:bg-[#161d2c] transition-colors"
            >
              <span className="w-4 h-4 rounded-[2px] bg-[#1d2639] text-[#ffdc2b] text-[10px] font-bold inline-flex items-center justify-center">
                2
              </span>
              <Briefcase className="w-3.5 h-3.5" />
              <span>Meu Clube (Elenco)</span>
            </Link>

            <Link
              href="/market"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] text-xs font-medium text-[#b6c0d4] hover:text-[#f4f6fb] hover:bg-[#161d2c] transition-colors"
            >
              <span className="w-4 h-4 rounded-[2px] bg-[#1d2639] text-[#ffdc2b] text-[10px] font-bold inline-flex items-center justify-center">
                3
              </span>
              <Gavel className="w-3.5 h-3.5" />
              <span>Mercado & Leilões</span>
            </Link>

            <Link
              href="/freguesometro"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] text-xs font-medium text-[#b6c0d4] hover:text-[#f4f6fb] hover:bg-[#161d2c] transition-colors"
            >
              <span className="w-4 h-4 rounded-[2px] bg-[#1d2639] text-[#ffdc2b] text-[10px] font-bold inline-flex items-center justify-center">
                4
              </span>
              <Swords className="w-3.5 h-3.5" />
              <span>Freguesômetro & Súmula</span>
            </Link>

            <Link
              href="/organizer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] text-xs font-medium text-[#b6c0d4] hover:text-[#f4f6fb] hover:bg-[#161d2c] transition-colors"
            >
              <span className="w-4 h-4 rounded-[2px] bg-[#1d2639] text-[#ffdc2b] text-[10px] font-bold inline-flex items-center justify-center">
                5
              </span>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Organizador</span>
            </Link>
          </nav>
        </div>

        {/* Right Operational Telemetry & User Identity */}
        <div className="flex items-center gap-2.5">
          <div
            title="Instância PostgreSQL isolada no deathstar-server (porta 5433)"
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#111622] border border-[#222c40] text-[11px] text-[#78849e]"
          >
            <span className="w-2 h-2 rounded-full bg-[#15a34a]" />
            <Database className="w-3 h-3 text-[#4ade80]" />
            <span>strike-db:5433</span>
          </div>

          {user ? (
            <>
              <Link
                href="/auth"
                title="Clique para trocar de conta ou sair"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#133865]/40 hover:bg-[#133865]/60 border border-[#1c4d8a] text-xs font-medium text-[#f4f6fb] transition-colors"
              >
                {user.isSuperAdmin ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#ffdc2b]" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-[#4ade80]" />
                )}
                <span>{user.nickname}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#ffdc2b] text-[#0e1312] font-bold uppercase">
                  {user.isSuperAdmin
                    ? "ROOT"
                    : user.role === "organizer"
                    ? "ORG"
                    : "PLAYER"}
                </span>
              </Link>

              {canManage && (
                <Link
                  href="/organizer"
                  className="hidden sm:inline-flex items-center justify-center min-h-9 px-3 py-1.5 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-semibold text-xs transition-colors"
                >
                  + Criar Torneio
                </Link>
              )}
            </>
          ) : (
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-1.5 min-h-9 px-3.5 py-1.5 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-bold text-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Entrar / Criar Conta</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
