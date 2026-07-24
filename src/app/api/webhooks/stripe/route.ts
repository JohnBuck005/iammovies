import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getServerSupabase } from "@/lib/supabaseServer";

// Stripe requires the raw body to verify the signature.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!ENDPOINT_SECRET) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET not configured" },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, ENDPOINT_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = getServerSupabase();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        if (session.mode !== "subscription") break;
        await upsertFromSubscription({
          supabase,
          customerId: session.customer as string,
          subscriptionId: session.subscription as string,
          email: (session.customer_email as string) ?? (session.customer_details?.email as string),
          plan: (session.metadata?.plan as string) || "monthly",
          status: "active",
        });
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as any;
        await upsertFromSubscription({
          supabase,
          customerId: sub.customer as string,
          subscriptionId: sub.id as string,
          email: (sub.customer_email as string) ?? undefined,
          plan: (sub.metadata?.plan as string) || "monthly",
          status: sub.status as string,
          periodStart: sub.current_period_start
            ? new Date(sub.current_period_start * 1000).toISOString()
            : undefined,
          periodEnd: sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : undefined,
        });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook handler failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function upsertFromSubscription(args: {
  supabase: ReturnType<typeof getServerSupabase>;
  customerId: string;
  subscriptionId: string;
  email?: string;
  plan: string;
  status: string;
  periodStart?: string;
  periodEnd?: string;
}) {
  const { supabase, customerId, subscriptionId, email, plan, status, periodStart, periodEnd } = args;

  // Try to fetch the email from the Stripe customer if not on the event.
  let resolvedEmail = email;
  if (!resolvedEmail) {
    try {
      const stripe = getStripe();
      const customer = await stripe.customers.retrieve(customerId);
      if (customer && !customer.deleted) {
        resolvedEmail = (customer as any).email ?? undefined;
      }
    } catch {
      // ignore — email stays optional
    }
  }

  const row = {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    email: resolvedEmail ?? null,
    plan,
    status,
    current_period_start: periodStart ?? null,
    current_period_end: periodEnd ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("subscriptions")
    .upsert(row, { onConflict: "stripe_subscription_id" });

  if (error) throw error;
}
