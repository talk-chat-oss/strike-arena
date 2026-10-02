import Link from "next/link";
import {
  Trophy,
  ShieldCheck,
  Swords,
  LayoutDashboard,
  Database,
} from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#090c12]/95 backdrop-blur-md border-b border-[#222c40]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand Logo (Kinetic Style) */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-[#f4f6fb] font-semibold text-sm tracking-tight hover:opacity-90 transition-opacity"
          >
            <span className="w-6 h-6 rounded-[4px] bg-[#ffdc2b] text-[#0e1312] font-bold text-xs inline-flex items-center justify-center">
              S
            </span>
            <span>STRIKE ARENA</span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium rounded-full bg-[#ffdc2b]/15 text-[#ffdc2b] border border-[#ffdc2b]/30">
              v0.1 MVP
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
              <span>Vitrine</span>
            </Link>

            <Link
              href="/tournaments/strike-cup-eafc26-elite"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] text-xs font-medium text-[#b6c0d4] hover:text-[#f4f6fb] hover:bg-[#161d2c] transition-colors"
            >
              <span className="w-4 h-4 rounded-[2px] bg-[#1d2639] text-[#ffdc2b] text-[10px] font-bold inline-flex items-center justify-center">
                2
              </span>
              <Swords className="w-3.5 h-3.5" />
              <span>Strike Cup (Ao Vivo)</span>
            </Link>

            <Link
              href="/organizer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] text-xs font-medium text-[#b6c0d4] hover:text-[#f4f6fb] hover:bg-[#161d2c] transition-colors"
            >
              <span className="w-4 h-4 rounded-[2px] bg-[#1d2639] text-[#ffdc2b] text-[10px] font-bold inline-flex items-center justify-center">
                3
              </span>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Organizador</span>
            </Link>
          </nav>
        </div>

        {/* Right Operational Telemetry & Super-Admin Badge */}
        <div className="flex items-center gap-2.5">
          <div
            title="Instância PostgreSQL dedicada no deathstar-server (porta 5433)"
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#111622] border border-[#222c40] text-[11px] text-[#78849e]"
          >
            <span className="w-2 h-2 rounded-full bg-[#15a34a]" />
            <Database className="w-3 h-3 text-[#4ade80]" />
            <span>deathstar:5433</span>
          </div>

          <div
            title="Super-Admin ID: 80193776-6790-457c-906d-ed45ea16df9f"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#133865]/40 border border-[#1c4d8a] text-xs font-medium text-[#f4f6fb]"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#ffdc2b]" />
            <span>SPOOKY</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#ffdc2b] text-[#0e1312] font-bold">
              ROOT
            </span>
          </div>

          <Link
            href="/organizer"
            className="inline-flex items-center justify-center min-h-9 px-3 py-1.5 rounded-[4px] bg-[#ffdc2b] hover:bg-[#d4a017] text-[#0e1312] font-semibold text-xs transition-colors"
          >
            + Criar Torneio
          </Link>
        </div>
      </div>
    </header>
  );
}
