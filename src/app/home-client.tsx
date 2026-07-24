"use client";

import { useSearchParams } from "next/navigation";
import SeriesCard from "@/components/SeriesCard";
import { seriesData, getSeriesById } from "@/data/series";
import Link from "next/link";

export default function Home() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "discover";
  const q = searchParams.get("q") ?? "";

  const featured = getSeriesById("baby-at-her-door") || seriesData[0];

  // Determine the grid content based on tab
  let gridTitle = "Discover";
  let grid = seriesData;
  if (tab === "new") {
    gridTitle = "✨ New Releases";
    grid = seriesData.filter((s) => s.isNew);
  } else if (tab === "premium") {
    gridTitle = "💎 Premium";
    grid = seriesData.filter((s) => s.isPremium);
  } else if (tab === "trending") {
    gridTitle = "🔥 Trending";
    grid = [...seriesData].sort(
      (a, b) =>
        parseInt(b.views.replace(/[^\d]/g, "")) -
        parseInt(a.views.replace(/[^\d]/g, ""))
    );
  } else if (tab === "search") {
    gridTitle = q ? `Search: "${q}"` : "Search";
    const needle = q.toLowerCase();
    grid = seriesData.filter(
      (s) =>
        s.title.toLowerCase().includes(needle) ||
        s.genre.toLowerCase().includes(needle)
    );
  } else {
    gridTitle = "Discover";
    grid = seriesData;
  }

  return (
    <div className="px-4 py-4">
      {/* Hero Banner — only on Discover */}
      {tab === "discover" && (
        <div className="relative rounded-xl overflow-hidden mb-6 h-56">
          <img
            src="/images/tbahd-hero.jpg"
            alt={featured.title}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className="text-[#D4AF37] text-xs font-medium">🔥 TRENDING NOW</span>
            <h2 className="text-xl font-bold mt-1">{featured.title}</h2>
            <p className="text-[#aaa] text-xs mt-1 line-clamp-2">
              {featured.description}
            </p>
            <Link
              href={`/series/${featured.id}/watch/1`}
              className="inline-block mt-3 bg-[#D4AF37] text-black text-sm px-6 py-2 rounded-lg font-medium hover:bg-[#B8962E] transition"
            >
              Watch Now — Episode 1 Free
            </Link>
          </div>
        </div>
      )}

      {/* Continue Watching — only on Discover */}
      {tab === "discover" && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3">Continue Watching</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {seriesData.slice(0, 3).map((series) => (
              <Link key={series.id} href={`/series/${series.id}/watch/1`} className="flex-shrink-0 w-40">
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={series.thumbnail}
                    alt={series.title}
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#333]">
                    <div className="h-full bg-[#D4AF37]" style={{ width: "45%" }} />
                  </div>
                </div>
                <p className="text-xs mt-1 line-clamp-1">{series.title}</p>
                <p className="text-[#888] text-[10px]">Episode 3 of {series.episodes}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Filtered / searched grid */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">{gridTitle}</h2>
          {tab === "discover" && (
            <button className="text-[#D4AF37] text-sm">See All</button>
          )}
        </div>

        {grid.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {grid.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <span className="text-4xl">🔍</span>
            <p className="text-[#aaa] mt-3">
              {tab === "search" ? `No results for "${q}"` : "Nothing here yet"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
