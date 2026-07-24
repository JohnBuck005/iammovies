"use client";

import { useState } from "react";

type PlanId = "monthly" | "quarterly" | "yearly";

const PLANS: { id: PlanId; name: string; sub: string; price: string; unit: string; badge?: string }[] = [
  { id: "monthly", name: "Monthly", sub: "Billed monthly", price: "$9.99", unit: "/month" },
  { id: "quarterly", name: "Quarterly", sub: "Billed every 3 months", price: "$24.99", unit: "/quarter", badge: "POPULAR" },
  { id: "yearly", name: "Yearly", sub: "Billed annually", price: "$79.99", unit: "/year", badge: "BEST VALUE" },
];

export default function SubscribePage() {
  const [plan, setPlan] = useState<PlanId>("quarterly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout failed");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <div className="px-4 py-6">
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
      <div className="space-y-3 mb-8">
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
              {p.badge && (
                <span className="absolute -top-2 left-4 bg-[#D4AF37] text-black text-[10px] px-2 py-0.5 rounded font-medium">
                  {p.badge}
                </span>
              )}
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

      {/* Subscribe button */}
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full bg-[#D4AF37] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#B8962E] transition mb-4 disabled:opacity-60"
      >
        {loading ? "Redirecting…" : "Subscribe Now"}
      </button>

      {error && (
        <p className="text-center text-red-400 text-sm mb-4">{error}</p>
      )}

      {/* Payment methods */}
      <div className="text-center mb-6">
        <p className="text-[#888] text-xs mb-3">Secure payment via</p>
        <div className="flex items-center justify-center gap-4">
          <span className="text-[#888] text-sm">💳 Stripe</span>
          <span className="text-[#888] text-sm">🍎 Apple Pay</span>
          <span className="text-[#888] text-sm">📱 Google Pay</span>
        </div>
      </div>

      {/* Terms */}
      <div className="text-center">
        <p className="text-[#666] text-xs">
          Cancel anytime. Subscription auto-renews.{" "}
          <a href="#" className="text-[#D4AF37]">Terms</a> ·{" "}
          <a href="#" className="text-[#D4AF37]">Privacy</a>
        </p>
      </div>
    </div>
  );
}
