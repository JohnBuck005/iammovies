"use client";

import Link from "next/link";
import { Series } from "@/data/series";
import { useUser } from "@/components/UserProvider";

export default function SeriesCard({ series }: { series: Series }) {
  const { inWatchlist, toggleWatchlist } = useUser();
  const saved = inWatchlist(series.id);

  return (
    <Link href={`/series/${series.id}`} className="poster-card block relative">
      <div className="relative rounded-lg overflow-hidden bg-[#1a1a1a]">
        {/* Thumbnail */}
        <div className="aspect-[2/3] relative">
          <img
            src={series.thumbnail}
            alt={series.title}
            className="w-full h-full object-cover"
          />
          {/* Badges */}
          {series.isNew && <span className="badge-new">NEW</span>}
          {series.isPremium && <span className="badge-premium">PREMIUM</span>}
          {series.isDubbed && (
            <span className="absolute top-8 left-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
              DUB
            </span>
          )}
          {/* Watchlist toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWatchlist(series.id);
            }}
            aria-label={saved ? "Remove from My List" : "Add to My List"}
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition"
          >
            {saved ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M10 4v12M4 10h12" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="p-2">
          <h3 className="text-sm font-medium line-clamp-1">{series.title}</h3>
          <div className="flex items-center justify-between mt-1">
            <span className="genre-badge">{series.genre}</span>
            <span className="text-[#888] text-xs">{series.views}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
