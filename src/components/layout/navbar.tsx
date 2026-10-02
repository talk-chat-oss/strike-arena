import Link from "next/link";
import {
  Trophy,
  ShieldCheck,
  Swords,
  UserPlus,
  UserCheck,
  Gavel,
  Briefcase,
  Users,
  Shield,
  ArrowLeftRight,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export async function Navbar() {
  const user = await getCurrentUser();
  const canManage = user?.isSuperAdmin || user?.role === "organizer";

  return (
    <header className="sticky top-0 z-50 w-full bg-[#090c12]/95 backdrop-blur-md border-b border-[#222c40]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
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
            className="hidden xl:flex items-center gap-1"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] text-xs font-medium text-[#b6c0d4] hover:text-[#f4f6fb] hover:bg-[#161d2c] transition-colors"
            >
              <span className="w-4 h-4 rounded-[2px] bg-[#1d2639] text-[#ffdc2b] text-[10px] font-bold inline-flex items-center justify-center">
                1
              </span>
              <Trophy className="w-3.5 h-3.5" />
              <span>Torneios</span>
            </Link>

            <Link
              href="/players"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] text-xs font-medium text-[#b6c0d4] hover:text-[#f4f6fb] hover:bg-[#161d2c] transition-colors"
            >
              <span className="w-4 h-4 rounded-[2px] bg-[#1d2639] text-[#ffdc2b] text-[10px] font-bold inline-flex items-center justify-center">
                2
              </span>
              <Users className="w-3.5 h-3.5" />
              <span>Jogadores</span>
            </Link>

            <Link
              href="/auctions"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] text-xs font-medium text-[#b6c0d4] hover:text-[#f4f6fb] hover:bg-[#161d2c] transition-colors"
            >
              <span className="w-4 h-4 rounded-[2px] bg-[#1d2639] text-[#ffdc2b] text-[10px] font-bold inline-flex items-center justify-center">
                3
              </span>
              <Gavel className="w-3.5 h-3.5" />
              <span>Leilões</span>
            </Link>

            <Link
              href="/transfers"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] text-xs font-medium text-[#b6c0d4] hover:text-[#f4f6fb] hover:bg-[#161d2c] transition-colors"
            >
              <span className="w-4 h-4 rounded-[2px] bg-[#1d2639] text-[#ffdc2b] text-[10px] font-bold inline-flex items-center justify-center">
                4
              </span>
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Transferências</span>
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] text-xs font-medium text-[#b6c0d4] hover:text-[#f4f6fb] hover:bg-[#161d2c] transition-colors"
            >
              <span className="w-4 h-4 rounded-[2px] bg-[#1d2639] text-[#ffdc2b] text-[10px] font-bold inline-flex items-center justify-center">
                5
              </span>
              <Briefcase className="w-3.5 h-3.5" />
              <span>Meu Clube</span>
            </Link>

            <Link
              href="/store/escudos"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] text-xs font-bold text-[#ffdc2b] bg-[#ffdc2b]/10 hover:bg-[#ffdc2b]/20 border border-[#ffdc2b]/30 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Loja de Escudos</span>
            </Link>

            <Link
              href="/freguesometro"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] text-xs font-medium text-[#b6c0d4] hover:text-[#f4f6fb] hover:bg-[#161d2c] transition-colors"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Freguesômetro</span>
            </Link>
          </nav>
        </div>

        {/* Right User Identity */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              <Link
                href="/auth"
                title="Clique para gerenciar sua conta ou sair"
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
                    ? "ADMIN"
                    : user.role === "organizer"
                    ? "ORG"
                    : "PRO"}
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
