/**
 * POST /api/checkout
 *
 * Creates a LemonSqueezy checkout session for the requested plan
 * and returns the checkout URL to redirect the user to.
 */

import { NextRequest } from "next/server";
import {
  getLemonApiKey,
  getLemonStoreId,
  LEMON_PRICE_IDS,
  type PlanId,
} from "@/lib/lemon";

const VALID_PLANS: PlanId[] = ["monthly", "quarterly", "yearly"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const plan = body?.plan as PlanId | undefined;

    if (!plan || !VALID_PLANS.includes(plan)) {
      return Response.json({ error: "Invalid or missing plan" }, { status: 400 });
    }

    const priceId = LEMON_PRICE_IDS[plan];
    if (!priceId) {
      return Response.json(
        { error: `Price not configured for plan: ${plan}` },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const apiKey = getLemonApiKey();

    // LemonSqueezy hosted checkout
    const resp = await fetch(
      `https://api.lemonsqueezy.com/v1/checkouts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/vnd.api+json",
          Accept: "application/vnd.api+json",
        },
        body: JSON.stringify({
          data: {
            type: "checkouts",
            attributes: {
              checkout_data: {
                custom: {
                  user_plan: plan,
                },
              },
              expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            },
            relationships: {
              store: {
                data: { type: "stores", id: getLemonStoreId() },
              },
              variant: {
                data: { type: "variants", id: priceId },
              },
            },
          },
        }),
      }
    );

    if (!resp.ok) {
      const err = await resp.text();
      return Response.json(
        { error: `LemonSqueezy error: ${resp.status} ${err}` },
        { status: 500 }
      );
    }

    const data = await resp.json();
    const checkoutUrl = data?.data?.attributes?.url;

    if (!checkoutUrl) {
      return Response.json(
        { error: "No checkout URL returned from LemonSqueezy" },
        { status: 500 }
      );
    }

    return Response.json({ url: checkoutUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
