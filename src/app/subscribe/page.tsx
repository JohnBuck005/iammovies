"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PlanId = "monthly" | "quarterly" | "yearly";

const PLANS: { id: PlanId; name: string; sub: string; price: string; unit: string }[] = [
  { id: "monthly", name: "Monthly", sub: "Billed monthly", price: "$9.99", unit: "/month" },
  { id: "quarterly", name: "Quarterly", sub: "Billed every 3 months", price: "$26.97", unit: "/quarter" },
  { id: "yearly", name: "Yearly", sub: "Billed annually", price: "$101.90", unit: "/year" },
];

declare global {
  interface Window {
    paypal?: any;
  }
}

function getQueryParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

export default function SubscribePage() {
  const [success, setSuccess] = useState(false);
  const [canceled, setCanceled] = useState(false);

  const [plan, setPlan] = useState<PlanId>("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paypalReady, setPaypalReady] = useState(false);

  useEffect(() => {
    setSuccess(getQueryParam("success") === "1");
    setCanceled(getQueryParam("canceled") === "1");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = document.querySelector('script[src*="paypal.com/sdk"]');
    if (existing) {
      setPaypalReady(true);
      renderButtons();
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test";
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
    script.onload = () => {
      setPaypalReady(true);
      renderButtons();
    };
    script.onerror = () => setError("Failed to load PayPal checkout.");
    document.body.appendChild(script);

    function renderButtons() {
      if (!window.paypal) return;
      const container = document.getElementById("paypal-button-container");
      if (!container) return;

      const selectedPlan = (container.getAttribute("data-plan") || "monthly") as PlanId;

      window.paypal.Buttons({
        style: { layout: "vertical", color: "gold", shape: "pill", label: "paypal" },
        createOrder: async () => {
          setError(null);
          const res = await fetch("/api/paypal/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan: selectedPlan }),
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error || "Order creation failed");
            throw new Error(data.error || "Order creation failed");
          }
          return data.id;
        },
        onApprove: async (data: { orderID: string }) => {
          setLoading(true);
          setError(null);
          try {
            const res = await fetch("/api/paypal/capture", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderID }),
            });
            const payload = await res.json();
            if (!res.ok) {
              setError(payload.error || "Payment failed");
              return;
            }
            window.location.href = "/subscribe?success=1";
          } catch {
            setError("Something went wrong. Please try again.");
          } finally {
            setLoading(false);
          }
        },
        onError: () => {
          setError("PayPal checkout was cancelled or failed.");
        },
      }).render(container);
    }
  }, [plan]);

  return (
    <div className="px-4 py-6">
      {success && (
        <div className="bg-green-500/10 border border-green-500/40 rounded-xl p-6 text-center mb-6">
          <div className="text-3xl mb-3">✅</div>
          <h2 className="text-lg font-bold mb-1">Payment Successful</h2>
          <p className="text-sm text-[#aaa]">Your subscription is now active. Enjoy!</p>
        </div>
      )}

      {canceled && (
        <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-6 text-center mb-6">
          <h2 className="text-lg font-bold mb-1">Payment Canceled</h2>
          <p className="text-sm text-[#aaa]">No worries — you can try again below.</p>
        </div>
      )}

      {!success && (
        <>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Unlock Unlimited Drama</h1>
            <p className="text-[#aaa] text-sm">
              Subscribe to watch all episodes, ad-free, with exclusive perks.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-[#1a1a1a] rounded-lg p-4 text-center">
              <span className="text-2xl">🎬</span>
              <p className="text-sm mt-2">All Episodes</p>
              <p className="text-[#888] text-xs">Unlimited access</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-4 text-center">
              <span className="text-2xl">🚫</span>
              <p className="text-sm mt-2">No Ads</p>
              <p className="text-[#888] text-xs">Ad-free experience</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-4 text-center">
              <span className="text-2xl">📥</span>
              <p className="text-sm mt-2">Downloads</p>
              <p className="text-[#888] text-xs">Watch offline</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-4 text-center">
              <span className="text-2xl">⭐</span>
              <p className="text-sm mt-2">Early Access</p>
              <p className="text-[#888] text-xs">New releases first</p>
            </div>
          </div>

          {/* Plans */}
          <div className="space-y-3 mb-6">
            {PLANS.map((p) => {
              const selected = plan === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlan(p.id)}
                  className={`sub-card rounded-xl p-4 w-full text-left transition border-2 ${
                    selected ? "border-[#D4AF37] bg-[#1a1a1a]" : "border-transparent bg-[#1a1a1a]"
                  } relative`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{p.name}</h3>
                      <p className="text-[#888] text-sm">{p.sub}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{p.price}</p>
                      <p className="text-[#888] text-xs">{p.unit}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* PayPal */}
          <div className="bg-[#1a1a1a] rounded-xl p-5 border border-[#333]">
            <h3 className="font-bold text-center mb-2">Pay with PayPal</h3>
            <p className="text-[#aaa] text-xs text-center mb-4">
              Instant access after payment. Subscription auto-renews.
            </p>

            <div
              id="paypal-button-container"
              data-plan={plan}
              data-loading={loading ? "true" : "false"}
            />

            {!paypalReady && (
              <div className="text-center text-xs text-[#888]">Loading checkout…</div>
            )}

            {error && <p className="text-red-400 text-xs text-center mt-3">{error}</p>}

            <div className="text-center mt-4">
              <Link href="/claim" className="text-xs text-[#D4AF37] hover:underline">
                Paid by another method? Submit proof here →
              </Link>
            </div>
          </div>

          {/* Terms */}
          <div className="text-center mt-6">
            <p className="text-[#666] text-xs">
              Cancel anytime. Subscription auto-renews.{" "}
              <a href="#" className="text-[#D4AF37]">Terms</a> ·{" "}
              <a href="#" className="text-[#D4AF37]">Privacy</a>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
