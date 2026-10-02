"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Trophy,
  Users,
  Gavel,
  ArrowLeftRight,
  Briefcase,
  Shield,
  Swords,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPaths?: string[];
}

const SIDEBAR_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Torneios & Ligas",
    shortLabel: "Torneios",
    icon: Trophy,
    matchPaths: ["/", "/tournaments"],
  },
  {
    href: "/players",
    label: "Jogadores (Database)",
    shortLabel: "Jogadores",
    badge: "BOLA PRETA",
    icon: Users,
    matchPaths: ["/players"],
  },
  {
    href: "/auctions",
    label: "Leilões & Calendário",
    shortLabel: "Leilões",
    badge: "AO VIVO",
    icon: Gavel,
    matchPaths: ["/auctions"],
  },
  {
    href: "/transfers",
    label: "Transferências & Multas",
    shortLabel: "Transferências",
    icon: ArrowLeftRight,
    matchPaths: ["/transfers"],
  },
  {
    href: "/dashboard",
    label: "Meu Clube / Elenco",
    shortLabel: "Meu Clube",
    icon: Briefcase,
    matchPaths: ["/dashboard"],
  },
  {
    href: "/store/escudos",
    label: "Loja de Escudos",
    shortLabel: "Loja Escudos",
    badge: "PROMO",
    icon: Shield,
    matchPaths: ["/store/escudos"],
  },
  {
    href: "/freguesometro",
    label: "Freguesômetro & Súmula",
    shortLabel: "Freguesômetro",
    icon: Swords,
    matchPaths: ["/freguesometro", "/matches"],
  },
  {
    href: "/organizer",
    label: "Painel Organizador",
    shortLabel: "Organizador",
    icon: LayoutDashboard,
    matchPaths: ["/organizer"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function isItemActive(item: NavItem) {
    if (item.href === "/") {
      return pathname === "/" || pathname.startsWith("/tournaments");
    }
    return (
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`) ||
      Boolean(item.matchPaths?.some((p) => p !== "/" && pathname.startsWith(p)))
    );
  }

  return (
    <>
      {/* Botão Flutuante Mobile para abrir a Sidebar */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu de navegação"
        className="lg:hidden fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#ffdc2b] text-[#0e1312] font-extrabold text-xs shadow-lg cursor-pointer"
      >
        <Menu className="w-4 h-4" />
        <span>Menu Master Liga</span>
      </button>

      {/* Overlay Mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-xs"
        />
      )}

      {/* Drawer Mobile */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[#0b0f18] border-r border-[#222c40] flex flex-col justify-between transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-[#222c40] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-strike-arena.svg"
              alt="Strike Arena"
              className="w-7 h-7 object-contain"
            />
            <div>
              <div className="text-xs font-extrabold text-[#f4f6fb] tracking-wider">
                STRIKE ARENA
              </div>
              <div className="text-[10px] text-[#ffdc2b] font-bold">
                MASTER LIGA ONLINE
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-[4px] bg-[#161d2c] text-[#b6c0d4] hover:text-[#f4f6fb] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-[4px] text-xs font-bold transition-colors ${
                  active
                    ? "bg-[#ffdc2b] text-[#0e1312]"
                    : "text-[#b6c0d4] hover:text-[#f4f6fb] hover:bg-[#161d2c]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-extrabold uppercase ${
                      active
                        ? "bg-[#0e1312] text-[#ffdc2b]"
                        : "bg-[#ffdc2b]/15 text-[#ffdc2b] border border-[#ffdc2b]/30"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#222c40]">
          <Link
            href="/store/escudos"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-between p-3 rounded-[4px] bg-gradient-to-r from-[#ffdc2b]/20 to-[#133865]/30 border border-[#ffdc2b]/40 text-xs font-bold text-[#f4f6fb]"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ffdc2b]" />
              <span>Recarregar Escudos</span>
            </div>
            <span className="text-[10px] font-extrabold text-[#ffdc2b]">
              A partir de R$ 20
            </span>
          </Link>
        </div>
      </aside>

      {/* Sidebar Desktop Retrátil */}
      <aside
        className={`hidden lg:flex flex-col justify-between shrink-0 bg-[#0b0f18] border-r border-[#222c40] sticky top-14 h-[calc(100vh-3.5rem)] transition-all duration-200 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="p-2.5 space-y-1.5 overflow-y-auto">
          <div className="flex items-center justify-between px-2 py-1.5 mb-1">
            {!collapsed && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#78849e]">
                Menu Master Liga
              </span>
            )}
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              title={
                collapsed ? "Expandir barra lateral" : "Recolher barra lateral"
              }
              className="p-1.5 rounded-[4px] bg-[#111622] hover:bg-[#161d2c] border border-[#222c40] text-[#b6c0d4] hover:text-[#ffdc2b] transition-colors cursor-pointer ml-auto"
            >
              {collapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <nav aria-label="Menu Lateral Master Liga" className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center justify-between px-2.5 py-2.5 rounded-[4px] text-xs font-bold transition-colors ${
                    active
                      ? "bg-[#ffdc2b] text-[#0e1312] shadow-[0_0_15px_rgba(255,220,43,0.15)]"
                      : "text-[#b6c0d4] hover:text-[#f4f6fb] hover:bg-[#161d2c]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>
                  {!collapsed && item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-extrabold uppercase shrink-0 ${
                        active
                          ? "bg-[#0e1312] text-[#ffdc2b]"
                          : "bg-[#ffdc2b]/15 text-[#ffdc2b] border border-[#ffdc2b]/30"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Rodapé da Sidebar: Atalho Rápido de Escudos */}
        <div className="p-2.5 border-t border-[#222c40]">
          {collapsed ? (
            <Link
              href="/store/escudos"
              title="Loja de Escudos — Recarga Imediata"
              className="w-full h-10 rounded-[4px] bg-[#ffdc2b]/15 hover:bg-[#ffdc2b]/25 border border-[#ffdc2b]/40 flex items-center justify-center text-[#ffdc2b]"
            >
              <Shield className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/store/escudos"
              className="block p-3 rounded-[4px] bg-gradient-to-br from-[#ffdc2b]/15 via-[#111622] to-[#133865]/30 border border-[#ffdc2b]/40 hover:border-[#ffdc2b] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#ffdc2b] uppercase">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Moeda Oficial</span>
                </span>
                <span className="px-1.5 py-0.2 rounded-[2px] bg-[#15a34a]/25 text-[#4ade80] text-[9px] font-bold">
                  PIX IMEDIATO
                </span>
              </div>
              <div className="text-xs font-bold text-[#f4f6fb] mt-1">
                Recarregar Escudos
              </div>
              <div className="text-[10px] text-[#9aa5b8] mt-0.5">
                Lotes de 200, 500 e 1.000 Escudos
              </div>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
