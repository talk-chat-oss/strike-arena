import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton";

export default function Loading() {
  return (
    <PageLoadingSkeleton
      title="CARREGANDO LEILÕES..."
      subtitle="Buscando lances em tempo real e cronômetros com Anti-Sniper"
    />
  );
}
