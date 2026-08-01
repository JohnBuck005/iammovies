"use client";

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const supabase = getBrowserSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback` },
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#888] text-sm mb-8"
        >
          ← Back
        </Link>

        <h1 className="text-2xl font-bold mb-1">Sign in</h1>
        <p className="text-[#888] text-sm mb-8">
          Sync your watchlist & progress across devices.
        </p>

        {sent ? (
          <div className="bg-[#1a1a1a] rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">📬</div>
            <p className="text-sm">
              We sent a magic link to <b>{email}</b>. Open it to finish signing
              in.
            </p>
          </div>
        ) : (
          <form onSubmit={sendMagicLink} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full bg-[#1a1a1a] rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-[#D4AF37] text-black py-3 rounded-lg text-sm font-bold hover:bg-[#B8962E] transition disabled:opacity-60"
            >
              {busy ? "Sending…" : "Send magic link"}
            </button>
          </form>
        )}

        {err && <p className="text-red-400 text-xs mt-4 text-center">{err}</p>}
      </div>
    </div>
  );
}
