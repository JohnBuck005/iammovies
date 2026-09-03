import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const plan = body?.plan;
    const paymentReference = String(body?.payment_reference ?? "").trim();

    if (!email || !plan || !paymentReference) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validPlans = ["monthly", "quarterly", "yearly"];
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const supabase = getServerSupabase();
    const { error } = await supabase.from("paypal_claims").insert({
      email,
      plan,
      payment_reference: paymentReference,
      status: "pending",
    });

    if (error) {
      console.error("PayPal claim insert failed:", error);
      return NextResponse.json({ error: "Failed to submit claim" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Claim submitted successfully" });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
