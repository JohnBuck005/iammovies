"use client";

import { useEffect, useState } from "react";

type Claim = {
  id: string;
  email: string;
  plan: string;
  payment_reference: string;
  status: string;
  created_at: string;
};

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/claims");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setClaims(data.claims ?? []);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function act(id: string, action: "approve" | "reject") {
    setActing(id);
    try {
      const res = await fetch("/api/admin/claims/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId: id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      await load();
    } catch (e: any) {
      alert(e.message || "Action failed");
    } finally {
      setActing(null);
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-6">
        <p className="text-sm text-[#888]">Loading claims…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <p className="text-sm text-red-400">{error}</p>
        <button onClick={load} className="mt-3 text-xs text-[#D4AF37]">Retry</button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">PayPal Claims</h1>
          <p className="text-xs text-[#888] mt-1">Review and approve payment submissions.</p>
        </div>
        <button
          onClick={load}
          className="text-xs bg-[#1a1a1a] border border-[#333] px-3 py-2 rounded-lg hover:bg-[#222] transition"
        >
          Refresh
        </button>
      </div>

      {claims.length === 0 ? (
        <div className="bg-[#1a1a1a] rounded-xl p-6 text-center border border-[#333]">
          <p className="text-sm text-[#888]">No claims yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map((c) => (
            <div
              key={c.id}
              className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{c.email}</p>
                  <p className="text-[10px] text-[#888] mt-1">
                    {c.plan} · ref: {c.payment_reference}
                  </p>
                  <p className="text-[10px] text-[#666] mt-1">
                    {new Date(c.created_at).toLocaleString()}
                  </p>
                  <span
                    className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded ${
                      c.status === "approved"
                        ? "bg-green-500/20 text-green-400"
                        : c.status === "rejected"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {c.status.toUpperCase()}
                  </span>
                </div>

                {c.status === "pending" && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => act(c.id, "approve")}
                      disabled={acting === c.id}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition disabled:opacity-60"
                    >
                      {acting === c.id ? "…" : "Approve"}
                    </button>
                    <button
                      onClick={() => act(c.id, "reject")}
                      disabled={acting === c.id}
                      className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition disabled:opacity-60"
                    >
                      {acting === c.id ? "…" : "Reject"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
