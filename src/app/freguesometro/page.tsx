import { getMasterLeagueOverviewData } from "@/lib/master-league-data";
import { FreguesometroClient } from "@/components/master-league/freguesometro-client";

export const dynamic = "force-dynamic";

export default async function FreguesometroPage() {
  const data = await getMasterLeagueOverviewData();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <FreguesometroClient
        clubs={data.clubs}
        contracts={data.contracts}
        h2hRecords={data.h2hRecords}
        defaultMode="freguesometro"
      />
    </main>
  );
}
