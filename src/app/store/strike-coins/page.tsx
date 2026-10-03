import { getMasterLeagueOverviewData } from "@/lib/master-league-data";
import { getCurrentUser } from "@/lib/auth";
import { verifyStripeCheckoutSessionAction } from "@/app/actions/master-league-actions";
import { EscudosStoreClient } from "@/components/master-league/escudos-store-client";

export const dynamic = "force-dynamic";

export default async function StrikeCoinsStorePage({
  searchParams,
}: {
  searchParams: Promise<{ stripe_session_id?: string; canceled?: string }>;
}) {
  const params = await searchParams;
  let initialFeedback: { ok: boolean; text: string } | null = null;

  if (params.stripe_session_id) {
    const res = await verifyStripeCheckoutSessionAction(
      params.stripe_session_id
    );
    initialFeedback = {
      ok: res.ok,
      text: res.ok ? res.message! : res.error!,
    };
  } else if (params.canceled === "1") {
    initialFeedback = {
      ok: false,
      text: "Checkout Stripe cancelado pelo usuário. Nenhum valor foi cobrado.",
    };
  }

  const [data, user] = await Promise.all([
    getMasterLeagueOverviewData(),
    getCurrentUser(),
  ]);

  const myClub =
    data.clubs.find((c) => c.userId === user?.id) ?? data.clubs[0] ?? null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <EscudosStoreClient
        clubs={data.clubs}
        packages={data.escudoPackages}
        purchases={data.escudoPurchases}
        initialClubId={myClub?.id ?? ""}
        initialFeedback={initialFeedback}
      />
    </div>
  );
}
