"use client";

import { useSearchParams } from "next/navigation";
import { getSeriesById } from "@/data/series";
import Link from "next/link";

export default function Home() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "discover";
  const q = searchParams.get("q") ?? "";

  const featured = getSeriesById("baby-at-her-door") || seriesData[0];

  // We're working with a single series for now — Discover showcases its EPISODES
  // (free ones play, premium ones show a lock to drive subscriptions).
  const allEpisodes = featured.episodeList ?? [];

  // Tabs reshape which episodes are surfaced (still one series).
  let sectionTitle = "Discover";
  let episodes = allEpisodes;
  if (tab === "new") {
    sectionTitle = "Discover";
    episodes = [...allEpisodes].sort((a, b) => (a.isFree === b.isFree ? 0 : a.isFree ? -1 : 1));
  } else if (tab === "premium") {
    sectionTitle = "💎 Premium Episodes";
    episodes = allEpisodes.filter((e) => !e.isFree);
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

      {/* Premium teaser — only on Discover, drives subscriptions */}
      {tab === "discover" && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3">Continue with Premium</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {episodes
              .filter((e) => !e.isFree)
              .slice(0, 4)
              .map((ep) => (
                <Link
                  key={ep.number}
                  href={`/series/${featured.id}/watch/${ep.number}`}
                  className="flex-shrink-0 w-40"
                >
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={ep.thumbnail}
                      alt={ep.title}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs mt-1 line-clamp-1">{ep.number}. {ep.title}</p>
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* Episodes of the single series — free play, premium show lock to drive subs */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">{sectionTitle}</h2>
          {tab === "discover" && (
            <Link href="/subscribe" className="text-[#D4AF37] text-sm">
              Subscribe
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {episodes.map((ep) => (
            <Link
              key={ep.number}
              href={`/series/${featured.id}/watch/${ep.number}`}
              className="relative rounded-lg overflow-hidden group"
            >
              <div className="relative">
                <img
                  src={ep.thumbnail}
                  alt={ep.title}
                  className="w-full h-28 object-cover"
                />
                {/* Locked overlay for premium episodes */}
                {!ep.isFree && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[#D4AF37] text-[10px] font-medium mt-1">Premium</span>
                  </div>
                )}
                {ep.isFree && (
                  <span className="absolute top-1 left-1 bg-[#D4AF37] text-black text-[9px] font-bold px-1.5 py-0.5 rounded">
                    FREE
                  </span>
                )}
              </div>
              <p className="text-xs mt-1 line-clamp-1 text-white">{ep.number}. {ep.title}</p>
              <p className="text-[#888] text-[10px]">{ep.duration}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
