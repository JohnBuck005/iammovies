/**
 * LemonSqueezy integration helpers.
 *
 * Required env vars (push to Vercel):
 * - LEMON_SQUEEZY_API_KEY   — server-side API key (starts with `test_` or `live_`)
 * - LEMON_SQUEEZY_STORE_ID  — your store ID (numeric)
 * - LEMON_SQUEEZY_WEBHOOK_SECRET — webhook signing secret (for verification)
 *
 * Optional:
 * - NEXT_PUBLIC_BASE_URL    — used for webhook fallback URLs
 */

export const LEMON_API_BASE = "https://api.lemonsqueezy.com/v1";

export type PlanId = "monthly" | "quarterly" | "yearly";

// Map our plan IDs to LemonSqueezy price/variant IDs.
// Fill these in after creating products+prices in the LemonSqueezy dashboard.
export const LEMON_PRICE_IDS: Record<PlanId, string> = {
  monthly: process.env.LEMON_PRICE_MONTHLY || "",
  quarterly: process.env.LEMON_PRICE_QUARTERLY || "",
  yearly: process.env.LEMON_PRICE_YEARLY || "",
};

export function getLemonApiKey(): string {
  const key = process.env.LEMON_SQUEEZY_API_KEY;
  if (!key) throw new Error("LEMON_SQUEEZY_API_KEY is not set in environment");
  return key;
}

export function getLemonStoreId(): string {
  const store = process.env.LEMON_SQUEEZY_STORE_ID;
  if (!store) throw new Error("LEMON_SQUEEZY_STORE_ID is not set in environment");
  return store;
}

export function getLemonWebhookSecret(): string | undefined {
  return process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
}
