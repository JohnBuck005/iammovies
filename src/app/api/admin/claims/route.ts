import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAdmin(request: NextRequest): boolean {
  const cookie = request.cookies.get("iam_admin");
  return cookie?.value === "1";
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = getServerSupabase();

  const { data: claims, error } = await supabase
    .from("paypal_claims")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: "Failed to load claims" }, { status: 500 });
  }

  return NextResponse.json({ claims: claims ?? [] });
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const claimId = String(body?.claimId ?? "");
    const action = String(body?.action ?? "");

    if (!claimId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const supabase = getServerSupabase();

    const { data: claim, error: fetchError } = await supabase
      .from("paypal_claims")
      .select("*")
      .eq("id", claimId)
      .single();

    if (fetchError || !claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    if (action === "reject") {
      const { error: updateError } = await supabase
        .from("paypal_claims")
        .update({ status: "rejected" })
        .eq("id", claimId);

      if (updateError) {
        console.error("Failed to reject claim:", updateError);
        return NextResponse.json({ error: "Failed to reject" }, { status: 500 });
      }

      return NextResponse.json({ ok: true, status: "rejected" });
    }

    // Approve: ensure not already active
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id, status, current_period_end")
      .eq("email", claim.email)
      .order("current_period_end", { ascending: false })
      .limit(1);

    const now = new Date();
    const addMonths = (months: number) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() + months);
      return d.toISOString();
    };

    const periodEnd =
      claim.plan === "quarterly"
        ? addMonths(3)
        : claim.plan === "yearly"
        ? addMonths(12)
        : addMonths(1);

    if (existing && existing.length > 0) {
      const row = existing[0];
      const isActive = row.status === "active" || row.status === "trialing";
      const notExpired =
        !row.current_period_end ||
        new Date(row.current_period_end).getTime() > Date.now();

      if (isActive && notExpired) {
        await supabase
          .from("paypal_claims")
          .update({ status: "approved" })
          .eq("id", claimId);
        return NextResponse.json({ ok: true, status: "approved", alreadyActive: true });
      }
    }

    const { error: insertError } = await supabase
      .from("subscriptions")
      .insert({
        email: claim.email,
        plan: claim.plan,
        status: "active",
        stripe_customer_id: null,
        stripe_subscription_id: null,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd,
      });

    if (insertError) {
      console.error("Failed to create subscription:", insertError);
      return NextResponse.json({ error: "Failed to activate" }, { status: 500 });
    }

    const { error: claimUpdateError } = await supabase
      .from("paypal_claims")
      .update({ status: "approved" })
      .eq("id", claimId);

    if (claimUpdateError) {
      console.error("Failed to update claim:", claimUpdateError);
    }

    return NextResponse.json({ ok: true, status: "approved", email: claim.email, plan: claim.plan });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
