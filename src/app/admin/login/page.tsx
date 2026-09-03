"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        router.push("/admin");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Admin Access</h1>
        <p className="text-[#888] text-sm mb-8">IAmoviestory site owner only.</p>

        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
          className="w-full bg-[#1a1a1a] rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D4AF37] border border-[#333] mb-4"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#D4AF37] text-black py-3 rounded-lg text-sm font-bold hover:bg-[#B8962E] transition disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>

        {error && <p className="text-red-400 text-xs mt-4 text-center">{error}</p>}
      </form>
    </div>
  );
}
