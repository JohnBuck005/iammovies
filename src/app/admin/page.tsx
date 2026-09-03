"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Claim = {
  id: string;
  email: string;
  plan: string;
  payment_reference: string;
  status: string;
  created_at: string;
};

type Subscription = {
  id: string;
  email: string;
  plan: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
};

type UserRow = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
};

type TabId = "overview" | "claims" | "subscriptions" | "users" | "content";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "claims", label: "Claims" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "users", label: "Users" },
  { id: "content", label: "Content" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<TabId>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [acting, setActing] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [claimsRes, subsRes, usersRes] = await Promise.all([
        fetch("/api/admin/claims"),
        fetch("/api/admin/subscriptions"),
        fetch("/api/admin/users"),
      ]);

      if (!claimsRes.ok) throw new Error("Failed claims");
      if (!subsRes.ok) throw new Error("Failed subscriptions");
      if (!usersRes.ok) throw new Error("Failed users");

      const claimsData = await claimsRes.json();
      const subsData = await subsRes.json();
      const usersData = await usersRes.json();

      setClaims(claimsData.claims ?? []);
      setSubscriptions(subsData.subscriptions ?? []);
      setUsers(usersData.users ?? []);
    } catch (e: any) {
      setError(e.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function actClaim(id: string, action: "approve" | "reject") {
    setActing(id);
    try {
      const res = await fetch("/api/admin/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId: id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      await loadAll();
    } catch (e: any) {
      alert(e.message || "Action failed");
    } finally {
      setActing(null);
    }
  }

  const pendingClaims = claims.filter((c) => c.status === "pending");
  const activeSubs = subscriptions.filter((s) => s.status === "active" || s.status === "trialing");
  const totalUsers = users.length;

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">IAmoviestory Admin</h1>
          <p className="text-xs text-[#888] mt-1">Site owner dashboard</p>
        </div>
        <button
          onClick={loadAll}
          className="text-xs bg-[#1a1a1a] border border-[#333] px-3 py-2 rounded-lg hover:bg-[#222] transition"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={loadAll} className="mt-2 text-xs text-[#D4AF37]">Retry</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-xs px-4 py-2 rounded-lg whitespace-nowrap transition ${
              tab === t.id
                ? "bg-[#D4AF37] text-black font-bold"
                : "bg-[#1a1a1a] border border-[#333] text-white hover:bg-[#222]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
              <p className="text-2xl font-bold">{totalUsers}</p>
              <p className="text-[10px] text-[#888] uppercase tracking-wider mt-1">Users</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#D4AF37]/40">
              <p className="text-2xl font-bold text-[#D4AF37]">{activeSubs.length}</p>
              <p className="text-[10px] text-[#888] uppercase tracking-wider mt-1">Active Subs</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
              <p className="text-2xl font-bold">{pendingClaims.length}</p>
              <p className="text-[10px] text-[#888] uppercase tracking-wider mt-1">Pending Claims</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
              <p className="text-2xl font-bold">{claims.length}</p>
              <p className="text-[10px] text-[#888] uppercase tracking-wider mt-1">Total Claims</p>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-5 border border-[#333]">
            <h2 className="font-bold mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/claims" className="text-xs bg-[#222] border border-[#333] p-3 rounded-lg text-center hover:bg-[#2a2a2a] transition">
                Review Claims
              </Link>
              <Link href="/admin/upload" className="text-xs bg-[#222] border border-[#333] p-3 rounded-lg text-center hover:bg-[#2a2a2a] transition">
                Upload Episode
              </Link>
              <Link href="/admin/db-check" className="text-xs bg-[#222] border border-[#333] p-3 rounded-lg text-center hover:bg-[#2a2a2a] transition">
                Check DB Tables
              </Link>
              <Link href="/" className="text-xs bg-[#222] border border-[#333] p-3 rounded-lg text-center hover:bg-[#2a2a2a] transition">
                View Site
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Claims */}
      {tab === "claims" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold mb-3">Pending Review</h2>
            {pendingClaims.length === 0 ? (
              <div className="bg-[#1a1a1a] rounded-xl p-6 text-center border border-[#333]">
                <p className="text-sm text-[#888]">No pending claims.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingClaims.map((c) => (
                  <div key={c.id} className="bg-[#1a1a1a] rounded-xl p-4 border border-[#D4AF37]/30">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{c.email}</p>
                        <p className="text-[10px] text-[#888] mt-1">{c.plan} · ref: {c.payment_reference}</p>
                        <p className="text-[10px] text-[#666] mt-1">{new Date(c.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => actClaim(c.id, "approve")} disabled={acting === c.id} className="text-xs bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-60">Approve</button>
                        <button onClick={() => actClaim(c.id, "reject")} disabled={acting === c.id} className="text-xs bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-60">Reject</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3">Recent History</h2>
            <div className="space-y-3">
              {claims.filter(c => c.status !== "pending").slice(0, 20).map((c) => (
                <div key={c.id} className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium truncate">{c.email}</p>
                      <p className="text-[10px] text-[#888] mt-1">{c.plan} · {c.payment_reference}</p>
                      <p className="text-[10px] text-[#666] mt-1">{new Date(c.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${c.status === "approved" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      {c.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions */}
      {tab === "subscriptions" && (
        <div>
          <h2 className="text-lg font-bold mb-3">Active Subscriptions ({activeSubs.length})</h2>
          <div className="space-y-3">
            {activeSubs.map((s) => (
              <div key={s.id} className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{s.email}</p>
                    <p className="text-[10px] text-[#888] mt-1">{s.plan} · {s.status}</p>
                    <p className="text-[10px] text-[#666] mt-1">
                      {s.current_period_end ? `Renews: ${new Date(s.current_period_end).toLocaleDateString()}` : "No end date"}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400">ACTIVE</span>
                </div>
              </div>
            ))}
            {activeSubs.length === 0 && (
              <div className="bg-[#1a1a1a] rounded-xl p-6 text-center border border-[#333]">
                <p className="text-sm text-[#888]">No active subscriptions yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users */}
      {tab === "users" && (
        <div>
          <h2 className="text-lg font-bold mb-3">Registered Users ({totalUsers})</h2>
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
                <p className="text-sm font-medium">{u.email}</p>
                <p className="text-[10px] text-[#666] mt-1">
                  Joined: {new Date(u.created_at).toLocaleDateString()}
                  {u.last_sign_in_at ? ` · Last active: ${new Date(u.last_sign_in_at).toLocaleDateString()}` : ""}
                </p>
              </div>
            ))}
            {users.length === 0 && (
              <div className="bg-[#1a1a1a] rounded-xl p-6 text-center border border-[#333]">
                <p className="text-sm text-[#888]">No users yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {tab === "content" && (
        <div>
          <h2 className="text-lg font-bold mb-3">Series & Episodes</h2>
          <p className="text-xs text-[#888] mb-4">Episodes 1–5 are free for all series.</p>
          <div className="space-y-3">
            {claims.length === 0 && (
              <div className="bg-[#1a1a1a] rounded-xl p-6 text-center border border-[#333]">
                <p className="text-sm text-[#888]">No content data available.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/" className="text-xs text-[#888] hover:text-white">← Back to site</Link>
      </div>
    </div>
  );
}
