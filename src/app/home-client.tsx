"use client";

import { seriesData, getSeriesById } from "@/data/series";
import Link from "next/link";

export default function Home() {
  const featured = getSeriesById("baby-at-her-door") || seriesData[0];

  const continueWatching = seriesData.filter((s) => s.isReal).slice(0, 3);

  const discoverSeries = seriesData.filter((s) => s.isReal).slice(0, 3);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero / Trending Now */}
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

      {/* Continue Watching */}
      <section className="mt-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-lg font-bold">Continue Watching</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2">
          {continueWatching.map((s) => (
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
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="h-1 bg-black/60 rounded-full overflow-hidden">
                    <div className="h-full bg-[#D4AF37] w-2/3" />
                  </div>
                </div>
              </div>
              <p className="text-xs mt-2 font-medium line-clamp-1">{s.title}</p>
              <p className="text-[#888] text-[10px]">Episode 3 of {s.episodes}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Discover */}
      <section className="mt-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-lg font-bold">Discover</h2>
          <Link href="/series" className="text-[#D4AF37] text-sm hover:underline">
            See All
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2">
          {discoverSeries.map((s) => (
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
                </div>
              </div>
              <p className="text-xs mt-2 font-medium line-clamp-1">{s.title}</p>
              <p className="text-[#888] text-[10px]">{s.views} views</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
