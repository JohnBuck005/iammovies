"use client";

import { useSearchParams } from "next/navigation";
import { seriesData, getSeriesById } from "@/data/series";
import Link from "next/link";

function parseViews(v: string): number {
  const s = v.trim().toUpperCase();
  if (s.endsWith("M")) return parseFloat(s) * 1_000_000;
  if (s.endsWith("K")) return parseFloat(s) * 1_000;
  return parseFloat(s) || 0;
}

export default function Home() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "discover";

  const featured = getSeriesById("baby-at-her-door") || seriesData[0];

  let filtered = seriesData;
  if (tab === "new") {
    filtered = seriesData.filter((s) => s.isNew);
  } else if (tab === "premium") {
    filtered = seriesData.filter((s) => s.isPremium);
  } else if (tab === "trending") {
    filtered = [...seriesData].sort((a, b) => parseViews(b.views) - parseViews(a.views));
  }

  const showHero = tab === "discover";

  return (
    <div className="min-h-screen pb-20">
      {/* Hero / Trending Now */}
      {showHero && (
        <div className="relative h-72 sm:h-80">
          <img
            src="/images/tbahd-hero.jpg"
            alt={featured.title}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] bg-[#D4AF37] text-black px-2 py-0.5 rounded font-semibold uppercase tracking-wide">
                Trending Now
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight drop-shadow-lg">
              {featured.title}
            </h1>
            <p className="text-[#ccc] text-xs sm:text-sm mt-2 line-clamp-2 max-w-xl">
              {featured.description}
            </p>
            <Link
              href={`/series/${featured.id}/watch/1`}
              className="inline-flex items-center gap-2 mt-4 bg-[#D4AF37] text-black text-sm font-semibold px-6 py-3 rounded-lg hover:bg-[#B8962E] transition shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Watch Now — Episode 1 Free
            </Link>
          </div>
        </div>
      )}

      {/* Series grid for selected tab */}
      <section className="mt-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-lg font-bold">
            {tab === "discover" && "Discover"}
            {tab === "new" && "New Releases"}
            {tab === "premium" && "Premium"}
            {tab === "trending" && "Trending"}
          </h2>
          {tab === "discover" && (
            <Link href="/series" className="text-[#D4AF37] text-sm hover:underline">
              See All
            </Link>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="px-4 text-[#888] text-sm">Nothing here yet.</div>
        ) : (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2">
            {filtered.map((s) => (
              <Link
                key={s.id}
                href={`/series/${s.id}`}
                className="flex-shrink-0 w-36 sm:w-40"
              >
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={s.thumbnail}
                    alt={s.title}
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {s.isNew && (
                      <span className="bg-[#D4AF37] text-black text-[9px] font-bold px-2 py-0.5 rounded">
                        NEW
                      </span>
                    )}
                    {s.isDubbed && (
                      <span className="bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                        DUB
                      </span>
                    )}
                    {s.isPremium && (
                      <span className="bg-[#f5c518] text-black text-[9px] font-bold px-2 py-0.5 rounded">
                        PREMIUM
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs mt-2 font-medium line-clamp-1">{s.title}</p>
                <p className="text-[#888] text-[10px]">{s.views} views</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
