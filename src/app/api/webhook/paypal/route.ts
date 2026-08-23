import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

const PAYPAL_WEBHOOK_SECRET = process.env.PAYPAL_WEBHOOK_SECRET;

async function verifyPayPalWebhook(req: NextRequest): Promise<boolean> {
  if (!PAYPAL_WEBHOOK_SECRET) return false;

  try {
    const body = await req.text();
    const transmissionId = req.headers.get("paypal-transmission-id");
    const transmissionTime = req.headers.get("paypal-transmission-time");
    const certUrl = req.headers.get("paypal-cert-url");
    const authAlgo = req.headers.get("paypal-auth-algo");
    const transmissionSig = req.headers.get("paypal-transmission-sig");

    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
      return false;
    }

    // In production, verify the webhook signature against PayPal.
    // For now, require a shared secret header as a minimum check.
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.includes(PAYPAL_WEBHOOK_SECRET)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!PAYPAL_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "PAYPAL_WEBHOOK_SECRET not configured" }, { status: 500 });
  }

  const valid = await verifyPayPalWebhook(request);
  if (!valid) {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 401 });
  }

  let event: any;
  try {
    event = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = getServerSupabase();

  try {
    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.CREATED":
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const sub = event.resource;
        await upsertPayPalSubscription(supabase, {
          subscriptionId: sub.id,
          status: sub.status === "ACTIVE" ? "active" : "trialing",
          payerEmail: sub.subscriber?.email_address || sub.payer?.email_address,
          plan: mapPayPalPlan(sub.plan_id),
          periodStart: sub.start_time,
          periodEnd: sub.billing_info?.next_billing_time || sub.end_time,
        });
        break;
      }
      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.SUSPENDED":
      case "PAYMENT.SUBSCRIPTION.EXPIRED": {
        const sub = event.resource;
        await upsertPayPalSubscription(supabase, {
          subscriptionId: sub.id,
          status: "canceled",
          payerEmail: sub.subscriber?.email_address || sub.payer?.email_address,
          plan: mapPayPalPlan(sub.plan_id),
          periodStart: sub.start_time,
          periodEnd: sub.billing_info?.next_billing_time || sub.end_time,
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

async function upsertPayPalSubscription(
  supabase: ReturnType<typeof getServerSupabase>,
  args: {
    subscriptionId: string;
    status: string;
    payerEmail?: string;
    plan?: string;
    periodStart?: string;
    periodEnd?: string;
  }
) {
  const { subscriptionId, status, payerEmail, plan = "monthly", periodStart, periodEnd } = args;

  // Upsert by PayPal subscription ID
  const { error } = await supabase
    .from("subscriptions")
    .upsert(
      {
        paypal_subscription_id: subscriptionId,
        email: payerEmail ?? null,
        plan,
        status,
        current_period_start: periodStart ?? null,
        current_period_end: periodEnd ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "paypal_subscription_id" }
    );

  if (error) throw error;
}

function mapPayPalPlan(planId?: string): string {
  if (!planId) return "monthly";
  const id = planId.toLowerCase();
  if (id.includes("quarter") || id.includes("q")) return "quarterly";
  if (id.includes("year") || id.includes("annual") || id.includes("y")) return "yearly";
  return "monthly";
}
