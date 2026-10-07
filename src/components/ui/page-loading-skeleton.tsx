export function PageLoadingSkeleton({
  title = "CARREGANDO DADOS...",
  subtitle = "Sincronizando com o hub da Master Liga Online",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="relative mb-6">
        {/* Glow de fundo */}
        <div className="absolute -inset-4 bg-[#ffdc2b]/10 blur-xl rounded-full" />

        {/* Outer spinner */}
        <div className="relative w-16 h-16 rounded-full border-2 border-[#222c40] border-t-[#ffdc2b] border-r-[#ffdc2b] animate-spin" />

        {/* Escudo / logo central pulsando */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-strike-arena.png"
            alt="Strike Arena"
            className="w-7 h-7 object-contain animate-pulse"
          />
        </div>
      </div>

      <div className="space-y-1.5 max-w-sm">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[2px] bg-[#111622] border border-[#ffdc2b]/30 text-[11px] font-extrabold text-[#ffdc2b] tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ffdc2b] animate-ping" />
          {title}
        </div>
        <p className="text-xs text-[#78849e]">{subtitle}</p>
      </div>

      {/* Barras de skeleton discretas estilo Kinetic */}
      <div className="mt-8 w-full max-w-md space-y-2.5">
        <div className="h-2 rounded-[2px] bg-[#161d2c] overflow-hidden">
          <div className="h-full bg-gradient-to-r from-transparent via-[#ffdc2b]/40 to-transparent w-1/2 animate-[shimmer_1.5s_infinite]" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-10 rounded-[4px] bg-[#111622] border border-[#222c40]/60 animate-pulse" />
          <div className="h-10 rounded-[4px] bg-[#111622] border border-[#222c40]/60 animate-pulse" />
          <div className="h-10 rounded-[4px] bg-[#111622] border border-[#222c40]/60 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
