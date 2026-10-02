import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Webhook de Confirmação de Pagamento de Pacotes de Escudos
 * POST /api/webhooks/escudos
 * Body: { clubTeamId: string, packageId: string, paymentMethod?: string, externalReference?: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clubTeamId,
      packageId,
      paymentMethod = "PIX",
      externalReference,
    } = body ?? {};

    if (!clubTeamId || !packageId) {
      return NextResponse.json(
        {
          ok: false,
          error: "clubTeamId e packageId são obrigatórios no payload.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.rpc(
      "rpc_purchase_escudos_package",
      {
        p_club_team_id: clubTeamId,
        p_package_id: packageId,
        p_payment_method: paymentMethod,
        p_external_ref:
          externalReference ??
          `WEBHOOK-${Date.now().toString(36).toUpperCase()}`,
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
            : "Erro ao processar webhook de pagamento.",
      },
      { status: 500 }
    );
  }
}
