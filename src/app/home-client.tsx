"use client";

import { useSearchParams } from "next/navigation";
import { seriesData } from "@/data/series";
import SeriesCard from "@/components/SeriesCard";

// Landing page = Trending + the full poster grid, nothing else.
//
// No episode rows (episodes live on the series feed), and no Continue
// Watching row: progress is only surfaced once a viewer opens a series —
// the feed resumes on their saved episode then.
//
// The tab filters still work (Trending/New/Premium/Discover), with Trending
// as the default landing state.
export default function Home() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "trending";

  let filtered = seriesData;
  if (tab === "new") {
    filtered = seriesData.filter((s) => s.isNew);
  } else if (tab === "premium") {
    filtered = seriesData.filter((s) => s.isPremium);
  } else {
    // trending (default) and discover both show the full catalogue
    filtered = seriesData;
  }

  return (
    <div className="min-h-screen pb-20">
      <section className="px-3 pt-3">
        {filtered.length === 0 ? (
          <div className="text-[#888] text-sm py-10 text-center">Nothing here yet.</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {filtered.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
