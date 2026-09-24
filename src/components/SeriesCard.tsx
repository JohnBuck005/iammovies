"use client";

import Link from "next/link";
import { Series } from "@/data/series";

// Poster card: the series name gets TWO lines (line-clamp-2) so more of the
// title is visible; the views count no longer competes with the title and sits
// on the same row as the genre tags. The DUB badge and the "+" watchlist
// button are intentionally absent from posters to keep the art clean — adding
// to My List still happens from the series page / My List page.
export default function SeriesCard({ series }: { series: Series }) {
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
          {/* Badges: NEW / PREMIUM only — DUB removed */}
          {series.isNew && <span className="badge-new">NEW</span>}
          {series.isPremium && <span className="badge-premium">PREMIUM</span>}
        </div>

        {/* Info */}
        <div className="p-1">
          {/* Title: up to two lines, then truncated */}
          <h3 className="text-xs font-medium leading-tight line-clamp-2 min-h-[32px]">
            {series.title}
          </h3>
          {/* Views count lives on the genre row, right-aligned */}
          <div className="flex items-center justify-between gap-1 mt-1">
            <div className="flex items-center gap-[2px] shrink-0">
              {series.genre
                .split(/[\s/]+/)
                .filter(Boolean)
                .map((tag) => (
                  <span key={tag} className="genre-badge">
                    {tag}
                  </span>
                ))}
            </div>
            <span className="text-[#888] text-[8px] shrink-0">{series.views}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
