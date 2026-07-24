import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment");
    }
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export type PlanId = "monthly" | "quarterly" | "yearly";

export const PLAN_AMOUNTS: Record<PlanId, number> = {
  monthly: 999,
  quarterly: 2499,
  yearly: 7999,
};

const INTERVALS: Record<PlanId, { interval: Stripe.Price.Recurring.Interval; count: number }> = {
  monthly: { interval: "month", count: 1 },
  quarterly: { interval: "month", count: 3 },
  yearly: { interval: "year", count: 1 },
};

/**
 * Resolve a Stripe Price ID for the given plan.
 * 1. If an explicit price ID is set in env, use it.
 * 2. Otherwise, look up (or auto-create in test mode) a price by a stable
 *    lookup_key so the demo works the moment the key is provided — no manual
 *    product creation needed in the dashboard.
 */
export async function getPriceId(plan: PlanId): Promise<string> {
  const envKey = `STRIPE_PRICE_${plan.toUpperCase()}` as const;
  const fromEnv = process.env[envKey];
  if (fromEnv) return fromEnv;

  const lookup = `iamovie-${plan}`;
  const stripe = getStripe();

  const existing = await stripe.prices.list({ lookup_keys: [lookup], limit: 1 });
  if (existing.data.length > 0) return existing.data[0].id;

  const product = await stripe.products.create({
    name: "IAmoviestory Subscription",
    metadata: { app: "iamoviestory" },
  });

  const { interval, count } = INTERVALS[plan];
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: PLAN_AMOUNTS[plan],
    currency: "usd",
    recurring: { interval, interval_count: count },
    lookup_key: lookup,
  });

  return price.id;
}
