import { getMasterLeagueOverviewData } from "@/lib/master-league-data";
import { getCurrentUser } from "@/lib/auth";
import { MarketClient } from "@/components/master-league/market-client";

export const dynamic = "force-dynamic";

export default async function MarketPage() {
  const [data, user] = await Promise.all([
    getMasterLeagueOverviewData(),
    getCurrentUser(),
  ]);

  const userClub =
    data.clubs.find((c) => c.userId === user?.id) ?? data.clubs[0];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <MarketClient
        athletes={data.athletes}
        clubs={data.clubs}
        contracts={data.contracts}
        auctions={data.auctions}
        proposals={data.proposals}
        initialClubId={userClub?.id ?? ""}
      />
    </main>
  );
}
