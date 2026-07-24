import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

// Stripe redirects here after a successful checkout with ?session_id=cs_...
// We fetch the session, set an httpOnly cookie carrying the customer id + email,
// then redirect to the subscribe success page. The watch page reads the cookie
// to gate premium episodes.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.redirect(new URL("/subscribe?error=no_session", request.url));
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const customerId = typeof session.customer === "string" ? session.customer : null;
    const email =
      (session.customer_email as string) ||
      (session.customer_details?.email as string) ||
      null;

    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = NextResponse.redirect(new URL("/subscribe?success=1", base));

    const payload = JSON.stringify({ customerId, email });
    res.cookies.set("iam_sub", payload, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return res;
  } catch (err) {
    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const message = err instanceof Error ? err.message : "session_error";
    return NextResponse.redirect(
      new URL(`/subscribe?error=${encodeURIComponent(message)}`, base)
    );
  }
}
