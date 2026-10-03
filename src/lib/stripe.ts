import Stripe from "stripe";

export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  "pk_live_51TZWkfC3FLuOBXwebxTA0jsvaHBHPSxRFaE7fGOWAvbiFcw2i8cFjhns098NZEy9p7awSwwmt3GC76Cnfc4Mf1YY000Mfrtmqa";

let stripeInstance: Stripe | null = null;

/**
 * Retorna a instância oficial da Stripe (usa STRIPE_SECRET_KEY ou "Soccer")
 */
export function getStripeServer(): Stripe {
  if (stripeInstance) return stripeInstance;

  const secretKey = process.env.STRIPE_SECRET_KEY || process.env.Soccer || "";
  if (!secretKey) {
    throw new Error(
      'Chave secreta da Stripe ("Soccer" / STRIPE_SECRET_KEY) não configurada no servidor.'
    );
  }

  stripeInstance = new Stripe(secretKey);
  return stripeInstance;
}
