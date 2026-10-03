import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getStripeServer } from "@/lib/stripe";

/**
 * Webhook Oficial Stripe de Confirmação de Pagamento de Pacotes de Escudos
 * POST /api/webhooks/escudos
 * Suporta:
 * 1) Eventos oficiais da Stripe (checkout.session.completed)
 * 2) Payload direto com { sessionId } ou { clubTeamId, packageId, externalReference }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Evento oficial da Stripe (checkout.session.completed) ou sessionId direto
    const stripeSessionId: string | undefined =
      body?.type === "checkout.session.completed"
        ? body?.data?.object?.id
        : body?.sessionId;

    if (stripeSessionId && stripeSessionId.startsWith("cs_")) {
      const stripe = getStripeServer();
      const session = await stripe.checkout.sessions.retrieve(stripeSessionId);

      if (session.payment_status !== "paid") {
        return NextResponse.json(
          {
            ok: false,
            error: "Sessão Stripe recebida, porém ainda não consta como paga.",
          },
          { status: 400 }
        );
      }

      const clubTeamId = session.metadata?.clubTeamId;
      const packageId = session.metadata?.packageId;

      if (!clubTeamId || !packageId) {
        return NextResponse.json(
          {
            ok: false,
            error: "Metadados de clubTeamId/packageId ausentes na sessão Stripe.",
          },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin.rpc(
        "rpc_purchase_escudos_package",
        {
          p_club_team_id: clubTeamId,
          p_package_id: packageId,
          p_payment_method: "STRIPE",
          p_external_ref: session.id,
        }
      );

      if (error) {
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 422 }
        );
      }

      return NextResponse.json({
        ok: true,
        gateway: "STRIPE",
        event: "ESCUDOS_CREDITED",
        result: data,
      });
    }

    // 2. Payload direto de confirmação Stripe
    const {
      clubTeamId,
      packageId,
      externalReference,
    } = body ?? {};

    if (!clubTeamId || !packageId) {
      return NextResponse.json(
        {
          ok: false,
          error: "clubTeamId e packageId (ou sessionId Stripe) são obrigatórios.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.rpc(
      "rpc_purchase_escudos_package",
      {
        p_club_team_id: clubTeamId,
        p_package_id: packageId,
        p_payment_method: "STRIPE",
        p_external_ref:
          externalReference ??
          `STRIPE-${Date.now().toString(36).toUpperCase()}`,
      }
    );

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 422 }
      );
    }

    return NextResponse.json({
      ok: true,
      gateway: "STRIPE",
      event: "ESCUDOS_CREDITED",
      result: data,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : "Erro ao processar webhook Stripe de pagamento.",
      },
      { status: 500 }
    );
  }
}
