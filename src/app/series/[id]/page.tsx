import { getMergedSeriesById } from "@/lib/episodes";
import { seriesData, getSeriesById } from "@/data/series";
import { notFound } from "next/navigation";
import Link from "next/link";
import WatchlistButton from "@/components/WatchlistButton";
import ShareButton from "@/components/ShareButton";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return params.then(({ id }) => {
    const series = getSeriesById(id);
    if (!series) return { title: "Not Found" };
    return {
      title: `${series.title} — IAmoviestory`,
      description: series.description,
      openGraph: {
        title: `${series.title} — IAmoviestory`,
        description: series.description,
        type: "website",
        url: `/series/${series.id}`,
        images: [
          {
            url: series.poster || series.thumbnail,
            width: 1200,
            height: 630,
            alt: series.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${series.title} — IAmoviestory`,
        description: series.description,
        images: [series.poster || series.thumbnail],
      },
    };
  });
}

export async function generateStaticParams() {
  return seriesData.map((series) => ({
    id: series.id,
  }));
}

export default async function SeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const seriesPromise = getMergedSeriesById(id);
  const series = await seriesPromise;

  if (!series) {
    notFound();
  }

  // Use real episode data when available, otherwise fixed placeholders
  const episodes = series.episodeList
    ? series.episodeList.map((e) => ({
        number: e.number,
        title: e.title,
        duration: e.duration,
        isFree: e.isFree,
        thumbnail: e.thumbnail || series.thumbnail,
      }))
    : Array.from({ length: series.episodes }, (_, i) => ({
        number: i + 1,
        title: `Episode ${i + 1}`,
        duration: `${((i % 3) + 3)}:${String((i * 7) % 60).padStart(2, "0")}`,
        isFree: i < 2,
        thumbnail: series.thumbnail,
      }));

  return (
    <div className="min-h-screen">
      {/* Cinematic Hero Header */}
      <div className="relative min-h-[62vh] flex flex-col justify-end">
        <img
          src={series.poster || series.thumbnail}
          alt={series.title}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        {/* gradient fade into the page */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />

        {/* Original brand stamp */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <img src="/images/iamoviestory-logo.jpg" alt="IAmoviestory" className="w-6 h-6 rounded object-cover" />
          {series.isReal && (
            <span className="text-[10px] tracking-widest text-[#D4AF37] font-semibold uppercase">
              IAmoviestory Original
            </span>
          )}
        </div>

        {/* Title block over the fade */}
        <div className="relative px-4 pb-5 z-10">
          <div className="mb-2">
            {series.isNew && (
              <span className="inline-block bg-[#D4AF37] text-black text-[10px] px-2 py-0.5 rounded">
                NEW
              </span>
            )}
            {series.isPremium && (
              <span className="inline-block bg-[#f5c518] text-black text-[10px] px-2 py-0.5 rounded ml-2">
                PREMIUM
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold leading-tight drop-shadow-lg">{series.title}</h1>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-sm text-[#ccc]">
            <span className="genre-badge">{series.genre}</span>
            <span>{series.episodes} Episodes</span>
            <span>{series.views} views</span>
            <span className="text-[#D4AF37]">⭐ {series.rating}</span>
          </div>

          {/* Primary actions on the banner */}
          <div className="flex gap-3 mt-4">
            <Link
              href={`/series/${series.id}/watch/1`}
              className="flex-1 bg-[#D4AF37] text-black py-3 rounded-lg font-semibold hover:bg-[#B8962E] transition flex items-center justify-center gap-2 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Play Episode 1
            </Link>
            <button className="w-12 h-12 rounded-lg bg-black/50 border border-[#444] flex items-center justify-center hover:bg-[#1a1a1a] transition backdrop-blur-sm" aria-label="Add to My List">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
            <ShareButton
              url={`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/series/${series.id}`}
              title={series.title}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 mb-6">
        <p className="text-[#aaa] text-sm leading-relaxed">{series.description}</p>
      </div>

      {/* Save to list */}
      <div className="px-4 mb-6">
        <WatchlistButton seriesId={series.id} />
      </div>

      {/* Episodes */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold mb-3">Episodes</h2>
        <div className="space-y-3">
          {episodes.map((ep) => (
            <div
              key={ep.number}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                ep.isFree ? "bg-[#1a1a1a]" : "bg-[#1a1a1a]/50"
              }`}
            >
              {/* Episode number */}
              <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-sm font-medium flex-shrink-0">
                {ep.number}
              </div>

              {/* Thumbnail */}
              <div className="w-16 h-10 rounded overflow-hidden flex-shrink-0">
                <img
                  src={ep.thumbnail}
                  alt={ep.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium line-clamp-1">{ep.title}</h3>
                <p className="text-[#888] text-xs">{ep.duration}</p>
              </div>

              {/* Play/Lock */}
              {ep.isFree ? (
                <Link
                  href={`/series/${series.id}/watch/${ep.number}`}
                  className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center hover:bg-[#B8962E] transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </Link>
              ) : (
                <Link
                  href={`/series/${series.id}/watch/${ep.number}`}
                  className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center hover:bg-[#444] transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#888]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Subscribe CTA */}
      <div className="px-4 mb-8">
        <div className="bg-gradient-to-r from-[#D4AF37]/20 to-[#f5c518]/20 rounded-xl p-4 border border-[#D4AF37]/30">
          <h3 className="font-bold mb-1">Unlock All Episodes</h3>
          <p className="text-[#aaa] text-sm mb-3">
            Subscribe to watch all episodes, ad-free, with offline downloads.
          </p>
          <button className="bg-[#D4AF37] text-black text-sm px-6 py-2.5 rounded-lg font-medium hover:bg-[#B8962E] transition">
            Subscribe Now
          </button>
        </div>
      </div>

      {/* Similar Series */}
      <div className="px-4 mb-8">
        <h2 className="text-lg font-bold mb-3">You Might Also Like</h2>
        <div className="grid grid-cols-3 gap-3">
          {seriesData
            .filter((s) => s.id !== series.id)
            .slice(0, 3)
            .map((s) => (
              <Link key={s.id} href={`/series/${s.id}`} className="poster-card block">
                <div className="relative rounded-lg overflow-hidden bg-[#1a1a1a]">
                  <div className="aspect-[2/3]">
                    <img
                      src={s.thumbnail}
                      alt={s.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <h3 className="text-xs font-medium line-clamp-1">{s.title}</h3>
                    <span className="text-[#888] text-[10px]">{s.views}</span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
