/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout Session for the requested plan
 * and returns the checkout URL to redirect the user to.
 */

import { NextRequest } from "next/server";
import { getStripe, type PlanId } from "@/lib/stripe";

const VALID_PLANS: PlanId[] = ["monthly", "quarterly", "yearly"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const plan = body?.plan as PlanId | undefined;

    if (!plan || !VALID_PLANS.includes(plan)) {
      return Response.json({ error: "Invalid or missing plan" }, { status: 400 });
    }

    const priceId = await getPriceId(plan);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: { plan },
      success_url: `${baseUrl}/subscribe?success=1`,
      cancel_url: `${baseUrl}/subscribe?canceled=1`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
