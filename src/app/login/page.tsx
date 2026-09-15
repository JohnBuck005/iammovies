"use client";

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMessage(null);
    try {
      const supabase = getBrowserSupabase();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${origin}/auth/callback` },
      });
      if (error) throw error;
      setSent(true);
      setMessage("Check your email for a 6-digit code or magic link.");
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Unable to send sign-in email.");
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMessage(null);
    try {
      const supabase = getBrowserSupabase();
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: "email",
      });
      if (error) throw error;
      window.location.assign("/");
    } catch (error) {
      setErr(error instanceof Error ? error.message : "That code could not be verified.");
      setBusy(false);
    }
  };

  const resendCode = async () => {
    setBusy(true);
    setErr(null);
    setMessage(null);
    try {
      const supabase = getBrowserSupabase();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${origin}/auth/callback` },
      });
      if (error) throw error;
      setMessage("A new sign-in code has been sent.");
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Unable to resend the code.");
    } finally {
      setBusy(false);
    }
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

        {!sent ? (
          <form onSubmit={sendCode} className="space-y-3">
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
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
              {busy ? "Sending…" : "Email me a sign-in code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="space-y-3">
            <p className="text-sm text-[#ccc]">
              Enter the 6-digit code sent to <b>{email}</b>.
            </p>
            <label htmlFor="code" className="sr-only">6-digit sign-in code</label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              className="w-full bg-[#1a1a1a] rounded-lg px-4 py-3 text-center text-xl tracking-[0.4em] outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
            <button
              type="submit"
              disabled={busy || code.length !== 6}
              className="w-full bg-[#D4AF37] text-black py-3 rounded-lg text-sm font-bold hover:bg-[#B8962E] transition disabled:opacity-60"
            >
              {busy ? "Checking…" : "Verify code"}
            </button>
            <button
              type="button"
              onClick={resendCode}
              disabled={busy}
              className="w-full text-[#D4AF37] py-2 text-sm hover:text-[#f5d76e] disabled:opacity-60"
            >
              Resend code
            </button>
          </form>
        )}

        {message && <p className="text-green-400 text-xs mt-4 text-center">{message}</p>}
        {err && <p className="text-red-400 text-xs mt-4 text-center">{err}</p>}
      </div>
    </div>
  );
}
