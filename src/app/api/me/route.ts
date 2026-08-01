import { NextResponse } from "next/server";
import { getServerUserEmail, getSubscriptionStatus } from "@/lib/supabaseServer";

// Returns the logged-in user's email + subscription status for the profile page.
export const dynamic = "force-dynamic";

export async function GET() {
  const email = await getServerUserEmail();
  if (!email) {
    return NextResponse.json({ user: null, subscription: "none" });
  }
  const status = await getSubscriptionStatus({ email });
  return NextResponse.json({ user: { email }, subscription: status });
}
