"use client";

import SeriesCard from "@/components/SeriesCard";
import { seriesData } from "@/data/series";
import { useUser } from "@/components/UserProvider";
import Link from "next/link";

export default function WatchlistPage() {
  const { watchlist } = useUser();
  const saved = seriesData.filter((s) => watchlist.includes(s.id));

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">My List</h1>
      <p className="text-[#aaa] text-sm mb-6">
        {saved.length} {saved.length === 1 ? "series" : "series"} saved
      </p>

      {saved.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {saved.map((series) => (
            <SeriesCard key={series.id} series={series} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <span className="text-4xl">📂</span>
          <p className="text-[#aaa] mt-4">Your list is empty</p>
          <p className="text-[#666] text-sm mt-1">
            Tap the + on any series to save it here
          </p>
          <Link
            href="/"
            className="inline-block mt-5 bg-[#D4AF37] text-black text-sm px-6 py-2.5 rounded-lg font-medium hover:bg-[#B8962E] transition"
          >
            Browse Series
          </Link>
        </div>
      )}
    </div>
  );
}
