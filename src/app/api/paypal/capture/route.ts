import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabaseServer";
import { getServerUserEmail } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const orderId = String(body?.orderId ?? "");
    const payerEmailFromClient = String(body?.payerEmail ?? "").trim().toLowerCase();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const env = process.env.PAYPAL_ENV || "live";

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "PayPal is not configured" }, { status: 500 });
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenRes.ok) {
      return NextResponse.json({ error: "PayPal auth failed" }, { status: 502 });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const apiBase =
      env === "sandbox"
        ? "https://api-m.sandbox.paypal.com"
        : "https://api-m.paypal.com";

    const captureRes = await fetch(`${apiBase}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!captureRes.ok) {
      return NextResponse.json({ error: "PayPal capture failed" }, { status: 502 });
    }

    const capture = await captureRes.json();
    const status = capture.status;
    const payerEmail =
      payerEmailFromClient ||
      String(capture.payer?.email_address ?? "").trim().toLowerCase();

    if (status !== "COMPLETED") {
      return NextResponse.json({ error: `Payment status: ${status}` }, { status: 400 });
    }

    // Identify which email to mark as active.
    const supabase = getServerSupabase();
    const loggedInEmail = await getServerUserEmail();

    const targetEmail =
      payerEmail ||
      loggedInEmail ||
      null;

    if (!targetEmail) {
      return NextResponse.json({ error: "No user email available" }, { status: 400 });
    }

    // Map PayPal item description/amount to plan.
    const unit = capture.purchase_units?.[0]?.amount?.value;
    let plan = "monthly";
    if (unit === "26.97") plan = "quarterly";
    else if (unit === "101.90") plan = "yearly";

    // Prevent duplicates.
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id, status, current_period_end")
      .eq("email", targetEmail)
      .order("current_period_end", { ascending: false })
      .limit(1);

    const now = new Date();
    const addMonths = (months: number) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() + months);
      return d.toISOString();
    };

    const periodEnd =
      plan === "quarterly" ? addMonths(3) : plan === "yearly" ? addMonths(12) : addMonths(1);

    if (existing && existing.length > 0) {
      const row = existing[0];
      const isActive = row.status === "active" || row.status === "trialing";
      const notExpired =
        !row.current_period_end ||
        new Date(row.current_period_end).getTime() > Date.now();

      if (isActive && notExpired) {
        return NextResponse.json({ ok: true, status: "active", alreadyActive: true });
      }
    }

    const { error: insertError } = await supabase.from("subscriptions").insert({
      email: targetEmail,
      plan,
      status: "active",
      stripe_customer_id: null,
      stripe_subscription_id: null,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd,
    });

    if (insertError) {
      console.error("Failed to create subscription:", insertError);
      return NextResponse.json({ error: "Failed to activate subscription" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, status: "active", plan });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
