/**
 * POST /api/webhook/lemon
 *
 * Handles LemonSqueezy webhook events:
 * - order_created       → grant access
 * - subscription_created → grant access
 * - subscription_updated → sync plan status
 * - subscription_cancelled / expired → downgrade to free
 *
 * LemonSqueezy signs every webhook with a SHA256 HMAC.
 * Header: `x-lemon-signed` (hex HMAC)
 * Header: `x-lemon-signature` (optional, deprecated)
 */

import { NextRequest } from "next/server";
import crypto from "crypto";
import {
  getLemonWebhookSecret,
  LEMON_API_BASE,
} from "@/lib/lemon";

function verifySignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) return false;
  const hmac = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  // Constant-time compare
  return crypto.timingSafeEqual(
    Buffer.from(hmac),
    Buffer.from(signature)
  );
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-lemon-signed") || "";
    const secret = getLemonWebhookSecret();

    // Read raw body for signature verification
    const rawBody = await req.text();

    if (secret && !verifySignature(rawBody, secret, signature)) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    // LemonSqueezy sends JSON API payloads
    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    const data = payload.data;

    if (!eventName || !data) {
      return Response.json({ error: "Missing event_name or data" }, { status: 400 });
    }

    const attributes = data.attributes;
    const customerEmail = attributes?.customer_email;
    const userId = attributes?.custom?.user_id; // we'll pass this on checkout

    // TODO: update user subscription status in your DB
    // For now this logs the event so you can wire it to your auth/sub system.

    console.log(
      `[lemon-webhook] event=${eventName} customer=${customerEmail} userId=${userId}`
    );

    switch (eventName) {
      case "order_created":
      case "subscription_created":
      case "subscription_updated":
        // Mark user as subscribed — implement DB update here
        break;

      case "subscription_cancelled":
      case "subscription_expired":
        // Downgrade user to free tier — implement DB update here
        break;

      default:
        console.log(`[lemon-webhook] unhandled event: ${eventName}`);
    }

    // LemonSqueezy expects a 2xx response
    return Response.json({ received: true });
  } catch (err) {
    console.error("[lemon-webhook] error:", err);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
