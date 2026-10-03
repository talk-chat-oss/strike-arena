"use client";

import { useState, useEffect, useRef } from "react";
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
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
  ChevronDown,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  description: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPaths?: string[];
  organizerOnly?: boolean;
}

const MENU_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Torneios & Ligas",
    description: "Campeonatos abertos, chaves e classificação",
    icon: Trophy,
    matchPaths: ["/", "/tournaments"],
  },
  {
    href: "/players",
    label: "Jogadores (Database)",
    description: "Catálogo oficial Bola Preta & Bola Ouro",
    badge: "BOLA PRETA",
    icon: Users,
    matchPaths: ["/players"],
  },
  {
    href: "/auctions",
    label: "Leilões & Calendário",
    description: "Lances em tempo real com Anti-Sniper",
    badge: "AO VIVO",
    icon: Gavel,
    matchPaths: ["/auctions", "/market"],
  },
  {
    href: "/transfers",
    label: "Transferências & Multas",
    description: "Negociações diretas e pagamento de rescisão",
    icon: ArrowLeftRight,
    matchPaths: ["/transfers"],
  },
  {
    href: "/dashboard",
    label: "Meu Clube / Elenco",
    description: "Cofre em Escudos, contratos e folha salarial",
    icon: Briefcase,
    matchPaths: ["/dashboard"],
  },
  {
    href: "/store/escudos",
    label: "Loja de Escudos",
    description: "Pacotes oficiais com liberação via PIX",
    badge: "PROMO",
    icon: Shield,
    matchPaths: ["/store/escudos"],
  },
  {
    href: "/freguesometro",
    label: "Freguesômetro & Súmula",
    description: "Histórico H2H, placares e rivalidades",
    icon: Swords,
    matchPaths: ["/freguesometro", "/matches"],
  },
  {
    href: "/organizer",
    label: "Painel do Organizador",
    description: "Criar torneios, gerenciar inscrições e rodadas",
    icon: LayoutDashboard,
    matchPaths: ["/organizer"],
  },
];

export function NavbarMenu({ canManage }: { canManage?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const currentItem =
    MENU_ITEMS.find((item) => isItemActive(item)) ?? MENU_ITEMS[0];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const ActiveIcon = currentItem.icon;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Abrir menu de navegação"
        className={`inline-flex items-center gap-2.5 min-h-9 px-3 py-1.5 rounded-[4px] border text-xs font-bold transition-colors cursor-pointer ${
          open
            ? "bg-[#ffdc2b] text-[#0e1312] border-[#ffdc2b]"
            : "bg-[#111622] hover:bg-[#161d2c] text-[#f4f6fb] border-[#222c40] hover:border-[#ffdc2b]/50"
        }`}
      >
        {open ? (
          <X className="w-4 h-4 shrink-0" />
        ) : (
          <Menu className="w-4 h-4 shrink-0 text-[#ffdc2b]" />
        )}
        <span className="hidden sm:inline-flex items-center gap-1.5">
          <ActiveIcon className="w-3.5 h-3.5 shrink-0 opacity-80" />
          <span>{currentItem.label}</span>
        </span>
        <span className="sm:hidden">Menu</span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Menu principal Strike Arena"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-[4px] bg-[#0b0f18] border border-[#222c40] shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-50 overflow-hidden"
        >
          <div className="px-3.5 py-2.5 border-b border-[#222c40] bg-[#111622] flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-strike-arena.png"
                alt="Strike Arena"
                className="w-5 h-5 object-contain shrink-0"
              />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#78849e]">
                Navegação · Master Liga Online
              </span>
            </div>
            {canManage && (
              <span className="text-[10px] font-bold text-[#ffdc2b]">
                Acesso Organizador
              </span>
            )}
          </div>

          <div className="p-2 space-y-1 max-h-[calc(100vh-8rem)] overflow-y-auto">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={`flex items-start justify-between gap-3 p-2.5 rounded-[4px] transition-colors ${
                    active
                      ? "bg-[#ffdc2b] text-[#0e1312]"
                      : "text-[#b6c0d4] hover:text-[#f4f6fb] hover:bg-[#161d2c]"
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-[4px] flex items-center justify-center shrink-0 mt-0.5 ${
                        active
                          ? "bg-[#0e1312]/15 text-[#0e1312]"
                          : "bg-[#111622] border border-[#222c40] text-[#ffdc2b]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold truncate">
                        {item.label}
                      </div>
                      <div
                        className={`text-[10px] truncate mt-0.5 ${
                          active ? "text-[#0e1312]/80 font-medium" : "text-[#78849e]"
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
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
          </div>

          <div className="p-2.5 border-t border-[#222c40] bg-[#111622]/70">
            <Link
              href="/store/escudos"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-[4px] bg-gradient-to-r from-[#ffdc2b]/20 to-[#133865]/30 border border-[#ffdc2b]/40 hover:border-[#ffdc2b] text-xs font-bold text-[#f4f6fb] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#ffdc2b]" />
                <span>Recarregar Escudos via PIX</span>
              </div>
              <span className="text-[10px] font-extrabold text-[#ffdc2b]">
                A partir de R$ 20
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
