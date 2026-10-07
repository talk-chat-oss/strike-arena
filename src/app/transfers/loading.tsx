import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton";

export default function Loading() {
  return (
    <PageLoadingSkeleton
      title="CARREGANDO TRANSFERÊNCIAS..."
      subtitle="Buscando histórico de compras, propostas e multas rescisórias"
    />
  );
}
