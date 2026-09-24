"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { seriesData } from "@/data/series";
import Link from "next/link";
import SeriesCard from "@/components/SeriesCard";
import { getContinueWatching } from "@/components/VideoPlayer";

function parseViews(v: string): number {
  const s = v.trim().toUpperCase();
  if (s.endsWith("M")) return parseFloat(s) * 1_000_000;
  if (s.endsWith("K")) return parseFloat(s) * 1_000;
  return parseFloat(s) || 0;
}

function ContinueWatching() {
  const [cw, setCw] = useState<{ seriesId: string; episode: number; progress: number; ts: number }[]>([]);

  useEffect(() => {
    setCw(getContinueWatching());
    const interval = setInterval(() => setCw(getContinueWatching()), 5000);
    return () => clearInterval(interval);
  }, []);

  if (cw.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-lg font-bold">Continue Watching</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2">
        {cw.map((entry) => {
          const series = seriesData.find((s) => s.id === entry.seriesId);
          if (!series) return null;
          const seriesUrl = `/series/${series.id}/watch/${entry.episode}`;
          return (
            <Link key={`${entry.seriesId}-${entry.episode}`} href={seriesUrl} className="flex-shrink-0 w-36 sm:w-40">
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={series.thumbnail || series.poster}
                  alt={series.title}
                  className="w-full h-44 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                  <div className="w-full h-1 bg-white/20 rounded-full mb-1">
                    <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: `${entry.progress}%` }} />
                  </div>
                  <span className="text-[#D4AF37] text-[10px] font-bold">{entry.progress}%</span>
                </div>
              </div>
              <p className="text-xs mt-1 font-medium line-clamp-1">{series.title}</p>
              <p className="text-[#888] text-[10px]">Ep {entry.episode}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// Landing page = SERIES ONLY (poster grid), matching the reference layout.
// Episodes are never listed here — they appear on the series detail page
// (/series/[id]) once the viewer picks a series.
export default function Home() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "discover";

  let filtered = seriesData;
  if (tab === "new") {
    filtered = seriesData.filter((s) => s.isNew);
  } else if (tab === "premium") {
    filtered = seriesData.filter((s) => s.isPremium);
  } else if (tab === "trending") {
    filtered = [...seriesData].sort((a, b) => parseViews(b.views) - parseViews(a.views));
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Continue Watching only appears once there is local progress */}
      <ContinueWatching />

      <section className="px-4 pt-4">
        {filtered.length === 0 ? (
          <div className="text-[#888] text-sm py-10 text-center">Nothing here yet.</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {filtered.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
