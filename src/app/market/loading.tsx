import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton";

export default function Loading() {
  return (
    <PageLoadingSkeleton
      title="CARREGANDO MERCADO..."
      subtitle="Sincronizando leilões, vitrine da federação e contratos"
    />
  );
}
