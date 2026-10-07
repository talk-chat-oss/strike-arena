import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton";

export default function Loading() {
  return (
    <PageLoadingSkeleton
      title="CARREGANDO MEU CLUBE..."
      subtitle="Recuperando finanças, folha salarial e elenco de atletas"
    />
  );
}
