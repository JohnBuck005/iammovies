"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/components/UserProvider";

type PlanId = "monthly" | "quarterly" | "yearly";

const PLANS: { id: PlanId; name: string; price: string }[] = [
  { id: "monthly", name: "Monthly", price: "$9.99" },
  { id: "quarterly", name: "Quarterly", price: "$26.97" },
  { id: "yearly", name: "Yearly", price: "$101.90" },
];

export default function ClaimPage() {
  const { user, isAuthed } = useUser();
  const [plan, setPlan] = useState<PlanId>("monthly");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitClaim(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const email = user?.email;
    if (!email) {
      setError("Please sign in first.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/paypal-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          plan,
          payment_reference: reference,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSuccess(true);
        setReference("");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAuthed) {
    return (
      <div className="px-4 py-6">
        <div className="bg-[#1a1a1a] rounded-xl p-6 text-center border border-[#333]">
          <p className="text-sm text-[#aaa] mb-4">
            Please sign in first to claim your subscription.
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#D4AF37] text-black px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#B8962E] transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="px-4 py-6">
        <div className="bg-[#1a1a1a] rounded-xl p-6 text-center border border-[#D4AF37]/40">
          <div className="text-3xl mb-3">✅</div>
          <h2 className="text-lg font-bold mb-1">Payment Submitted</h2>
          <p className="text-sm text-[#aaa]">
            We&apos;ll review your payment and activate your subscription within a few
            hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Claim Access</h1>
        <p className="text-[#aaa] text-sm">
          After paying via PayPal, submit your payment details below and we&apos;ll
          unlock your episodes.
        </p>
      </div>

      <form onSubmit={submitClaim} className="space-y-4">
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
          <p className="text-[10px] text-[#888] uppercase tracking-wider mb-1">
            Logged in as
          </p>
          <p className="text-sm font-mono">{user?.email}</p>
        </div>

        <div>
          <label className="block text-xs text-[#888] mb-1">Plan</label>
          <div className="grid grid-cols-3 gap-2">
            {PLANS.map((p) => {
              const selected = plan === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlan(p.id)}
                  className={`rounded-lg border-2 p-2 text-center transition ${
                    selected
                      ? "border-[#D4AF37] bg-[#1a1a1a]"
                      : "border-transparent bg-[#1a1a1a]"
                  }`}
                >
                  <p className="text-[10px] text-[#888]">{p.name}</p>
                  <p className="text-sm font-bold">{p.price}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#888] mb-1">Payment Reference</label>
          <input
            type="text"
            required
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="PayPal transaction ID or sender email"
            className="w-full bg-[#0a0a0a] rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D4AF37] border border-[#333]"
          />
          <p className="text-[10px] text-[#666] mt-1">
            Find this in your PayPal receipt email.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#D4AF37] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#B8962E] transition disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit Claim"}
        </button>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </form>

      <div className="text-center mt-6">
        <Link href="/subscribe" className="text-xs text-[#888] hover:text-white">
          ← Back to payment options
        </Link>
      </div>
    </div>
  );
}
