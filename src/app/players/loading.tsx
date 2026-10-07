import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton";

export default function Loading() {
  return (
    <PageLoadingSkeleton
      title="CARREGANDO DATABASE..."
      subtitle="Filtrando atributos de jogadores e estatísticas da Master Liga"
    />
  );
}
