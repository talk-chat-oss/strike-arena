"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname } from "next/navigation";

function ProgressIndicator() {
  const pathname = usePathname();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    // Quando a rota mudar, o carregamento da navegação terminou
    setNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      const targetAttr = target.getAttribute("target");

      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        (!targetAttr || targetAttr === "_self") &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        const currentPath = window.location.pathname;
        if (href !== currentPath && !href.startsWith(currentPath + "#")) {
          setNavigating(true);
        }
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, {
        capture: true,
      });
    };
  }, []);

  if (!navigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      {/* Barra de progresso linear animada Kinetic Yellow */}
      <div className="h-[2.5px] w-full bg-[#133865]/40 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#ffdc2b] via-[#fce588] to-[#ffdc2b] animate-[progress_1.2s_ease-in-out_infinite]" />
      </div>
      {/* Mini badge discreta no topo */}
      <div className="absolute top-2 right-3 px-2 py-0.5 rounded-[2px] bg-[#090c12]/95 border border-[#ffdc2b]/50 shadow-xl flex items-center gap-1.5 text-[10px] font-extrabold text-[#ffdc2b]">
        <div className="w-1.5 h-1.5 rounded-full bg-[#ffdc2b] animate-ping" />
        <span>CARREGANDO...</span>
      </div>
    </div>
  );
}

export function TopProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressIndicator />
    </Suspense>
  );
}
