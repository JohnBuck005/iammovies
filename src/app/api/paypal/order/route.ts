import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const plan = body?.plan;
    if (!plan || !["monthly", "quarterly", "yearly"].includes(plan)) {
      return NextResponse.json({ error: "Invalid or missing plan" }, { status: 400 });
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "PayPal is not configured" }, { status: 500 });
    }

    // PayPal JS SDK flow uses Orders API (v2/checkout/orders).
    // We create a server-side order so the amount/plan is never trusted from the client.
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
    const env = process.env.PAYPAL_ENV || "live";

    const apiBase =
      env === "sandbox"
        ? "https://api-m.sandbox.paypal.com"
        : "https://api-m.paypal.com";

    const orderBody: Record<string, unknown> = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: plan === "monthly" ? "9.99" : plan === "quarterly" ? "26.97" : "101.90",
          },
          description: `IAmoviestory ${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`,
        },
      ],
      application_context: {
        return_url: `${baseUrl}/subscribe?success=1`,
        cancel_url: `${baseUrl}/subscribe?canceled=1`,
        user_action: "PAY_NOW",
      },
    };

    const orderRes = await fetch(`${apiBase}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderBody),
    });

    if (!orderRes.ok) {
      return NextResponse.json({ error: "PayPal order creation failed" }, { status: 502 });
    }

    const order = await orderRes.json();
    const approveLink = order.links?.find((l: { rel: string; href: string }) => l.rel === "approve")?.href;

    if (!approveLink) {
      return NextResponse.json({ error: "No approval link from PayPal" }, { status: 502 });
    }

    return NextResponse.json({ id: order.id, approveUrl: approveLink });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
