import { getMasterLeagueOverviewData } from "@/lib/master-league-data";
import { PlayersCatalogClient } from "@/components/master-league/players-catalog-client";

export const dynamic = "force-dynamic";

export default async function PlayersDatabasePage() {
  const data = await getMasterLeagueOverviewData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PlayersCatalogClient
        athletes={data.athletes}
        contracts={data.contracts}
        auctions={data.auctions}
      />
    </div>
  );
}
