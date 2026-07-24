import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client (uses the service-role key).
 * NEVER import this from a client component or ship it to the browser.
 */
export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase server env missing (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)"
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "none";

/**
 * Resolve whether a Stripe customer (by email or customer id) has an active sub.
 * Used by the paywall gating. Returns the resolved status.
 */
export async function getSubscriptionStatus(opts: {
  email?: string;
  stripeCustomerId?: string;
}): Promise<SubscriptionStatus> {
  if (!opts.email && !opts.stripeCustomerId) return "none";
  const supabase = getServerSupabase();

  let query = supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .order("current_period_end", { ascending: false })
    .limit(1);

  if (opts.stripeCustomerId) {
    query = query.eq("stripe_customer_id", opts.stripeCustomerId);
  } else if (opts.email) {
    query = query.eq("email", opts.email);
  }

  const { data, error } = await query;
  if (error || !data || data.length === 0) return "none";

  const row = data[0];
  const active = row.status === "active" || row.status === "trialing";
  const notExpired =
    !row.current_period_end ||
    new Date(row.current_period_end).getTime() > Date.now();
  return active && notExpired ? row.status : "none";
}
