"use client";

import { useState } from "react";
import { useUser } from "@/components/UserProvider";

const REWARDS = [
  { id: "episode", label: "Unlock 1 Episode", cost: 200, icon: "🔓" },
  { id: "daypass", label: "1 Day Free Pass", cost: 500, icon: "🎟️" },
  { id: "discount", label: "20% Off Plan", cost: 1000, icon: "🏷️" },
  { id: "vip", label: "VIP Badge", cost: 5000, icon: "👑" },
];

export default function RewardsPage() {
  const { points, checkIn, lastCheckIn, spendPoints, watchedCount } = useUser();
  const [toast, setToast] = useState<string | null>(null);
  const [checkedInToday, setCheckedInToday] = useState(
    lastCheckIn === new Date().toISOString().slice(0, 10)
  );

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const handleCheckIn = () => {
    const res = checkIn();
    if (res.ok) {
      setCheckedInToday(true);
      flash(`✅ Checked in! +${res.gained} points`);
    } else {
      flash("Already checked in today");
    }
  };

  const handleRedeem = (r: { id: string; label: string; cost: number; icon: string }) => {
    if (spendPoints(r.cost)) {
      flash(`${r.icon} Redeemed: ${r.label}!`);
    } else {
      flash(`Not enough points (need ${r.cost})`);
    }
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">Rewards</h1>
      <p className="text-[#aaa] text-sm mb-6">Earn points and unlock exclusive perks</p>

      {/* Points balance */}
      <div className="bg-gradient-to-r from-[#D4AF37]/20 to-[#f5c518]/20 rounded-xl p-6 mb-6 text-center border border-[#D4AF37]/30">
        <p className="text-[#aaa] text-sm">Your Balance</p>
        <p className="text-4xl font-bold mt-1">{points.toLocaleString()}</p>
        <p className="text-[#f5c518] text-sm">⭐ Points</p>
        {watchedCount > 0 && (
          <p className="text-[#888] text-xs mt-2">{watchedCount} episodes watched</p>
        )}
      </div>

      {/* Daily check-in */}
      <button
        onClick={handleCheckIn}
        disabled={checkedInToday}
        className={`w-full rounded-lg p-4 mb-6 flex items-center justify-center gap-2 font-medium transition ${
          checkedInToday
            ? "bg-[#1a1a1a] text-[#666]"
            : "bg-[#D4AF37] text-black hover:bg-[#B8962E]"
        }`}
      >
        {checkedInToday ? "✅ Checked in today" : "📅 Daily Check-in (+5 pts)"}
      </button>

      {/* How to earn */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3">How to Earn</h2>
        <div className="space-y-3">
          <div className="bg-[#1a1a1a] rounded-lg p-4 flex items-center gap-3">
            <span className="text-xl">🎬</span>
            <div className="flex-1">
              <p className="text-sm font-medium">Watch an Episode</p>
              <p className="text-[#888] text-xs">+10 points per episode</p>
            </div>
            <span className="text-[#f5c518] text-sm">+10</span>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-4 flex items-center gap-3">
            <span className="text-xl">📅</span>
            <div className="flex-1">
              <p className="text-sm font-medium">Daily Check-in</p>
              <p className="text-[#888] text-xs">Log in every day</p>
            </div>
            <span className="text-[#f5c518] text-sm">+5</span>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-4 flex items-center gap-3">
            <span className="text-xl">📤</span>
            <div className="flex-1">
              <p className="text-sm font-medium">Share a Series</p>
              <p className="text-[#888] text-xs">Share with friends</p>
            </div>
            <span className="text-[#f5c518] text-sm">+20</span>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-4 flex items-center gap-3">
            <span className="text-xl">🏆</span>
            <div className="flex-1">
              <p className="text-sm font-medium">Complete a Series</p>
              <p className="text-[#888] text-xs">Watch all episodes</p>
            </div>
            <span className="text-[#f5c518] text-sm">+50</span>
          </div>
        </div>
      </div>

      {/* Rewards shop */}
      <div>
        <h2 className="text-lg font-bold mb-3">Redeem Points</h2>
        <div className="grid grid-cols-2 gap-3">
          {REWARDS.map((r) => {
            const canAfford = points >= r.cost;
            return (
              <button
                key={r.id}
                onClick={() => handleRedeem(r)}
                disabled={!canAfford}
                className={`bg-[#1a1a1a] rounded-lg p-4 text-center transition ${
                  canAfford ? "hover:bg-[#222]" : "opacity-50"
                }`}
              >
                <span className="text-3xl">{r.icon}</span>
                <p className="text-sm mt-2 font-medium">{r.label}</p>
                <p className="text-[#f5c518] text-sm mt-1">{r.cost} pts</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-sm font-medium px-4 py-2 rounded-lg shadow-lg z-[100]">
          {toast}
        </div>
      )}
    </div>
  );
}
