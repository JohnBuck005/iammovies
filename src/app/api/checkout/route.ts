import { getStripe, getPriceId, type PlanId } from "@/lib/stripe";

const VALID_PLANS: PlanId[] = ["monthly", "quarterly", "yearly"];

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const plan = body?.plan as PlanId | undefined;

    if (!plan || !VALID_PLANS.includes(plan)) {
      return Response.json({ error: "Invalid or missing plan" }, { status: 400 });
    }

    const priceId = await getPriceId(plan);
    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/api/auth/session?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/subscribe?canceled=1`,
      customer_creation: "always",
      allow_promotion_codes: true,
      metadata: { plan },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
