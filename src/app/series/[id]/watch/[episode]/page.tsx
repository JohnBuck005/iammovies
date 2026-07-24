import { seriesData, getSeriesById, getEpisode } from "@/data/series";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import VideoPlayer from "@/components/VideoPlayer";
import Comments from "@/components/Comments";
import { getSubscriptionStatus } from "@/lib/supabaseServer";

export function generateStaticParams() {
  const params: { id: string; episode: string }[] = [];
  seriesData.forEach((series) => {
    for (let i = 1; i <= series.episodes; i++) {
      params.push({ id: series.id, episode: String(i) });
    }
  });
  return params;
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string; episode: string }>;
}) {
  const { id, episode } = await params;
  const series = getSeriesById(id);
  const episodeNum = parseInt(episode);

  if (!series || isNaN(episodeNum) || episodeNum < 1 || episodeNum > series.episodes) {
    notFound();
  }

  const ep = getEpisode(id, episodeNum);
  const staticallyFree = ep ? ep.isFree : episodeNum <= 2;

  // Real gating: a paying subscriber can watch any episode. Non-subscribers
  // (or missing Supabase env) fall back to the static free-eps rule.
  let hasSubscription = false;
  try {
    const jar = await cookies();
    const raw = jar.get("iam_sub")?.value;
    if (raw) {
      const parsed = JSON.parse(raw) as { customerId?: string; email?: string };
      const status = await getSubscriptionStatus({
        stripeCustomerId: parsed.customerId,
        email: parsed.email,
      });
      hasSubscription = status === "active" || status === "trialing";
    }
  } catch {
    hasSubscription = false;
  }

  const isLocked = !staticallyFree && !hasSubscription;
  const prevEp = episodeNum > 1 ? episodeNum - 1 : null;
  const nextEp = episodeNum < series.episodes ? episodeNum + 1 : null;
  const poster = ep?.thumbnail || series.poster || series.thumbnail;

  return (
    <div className="min-h-screen bg-black">
      {/* Back button overlay */}
      <div className="relative">
        <VideoPlayer
          videoUrl={ep?.videoUrl ?? null}
          poster={poster}
          title={series.title}
          episodeNum={episodeNum}
          isLocked={isLocked}
          seriesId={series.id}
        />
        <Link
          href={`/series/${series.id}`}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>

      {/* Episode info */}
      <div className="px-4 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold">{series.title}</h1>
            <p className="text-[#aaa] text-sm">
              Episode {episodeNum}{ep?.title ? ` · ${ep.title}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#888] text-xs">⭐ {series.rating}</span>
            <span className="text-[#888] text-xs">{series.views} views</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-4 mt-4">
          <button className="flex flex-col items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span className="text-[10px] text-[#888]">Like</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            <span className="text-[10px] text-[#888]">Share</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            <span className="text-[10px] text-[#888]">Save</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] text-[#888]">Download</span>
          </button>
        </div>
      </div>

      {/* Episode navigation */}
      <div className="px-4 py-4 flex gap-3">
        {prevEp && (
          <Link
            href={`/series/${series.id}/watch/${prevEp}`}
            className="flex-1 py-3 rounded-lg border border-[#333] text-center text-sm hover:bg-[#1a1a1a] transition"
          >
            ← Previous
          </Link>
        )}
        {nextEp && (
          <Link
            href={`/series/${series.id}/watch/${nextEp}`}
            className="flex-1 py-3 rounded-lg bg-[#D4AF37] text-center text-sm font-medium hover:bg-[#B8962E] transition"
          >
            Next Episode →
          </Link>
        )}
      </div>

      {/* Episode list */}
      <div className="px-4 py-4">
        <h2 className="text-lg font-bold mb-3">All Episodes</h2>
        <div className="space-y-2">
          {(series.episodeList
            ? series.episodeList
            : Array.from({ length: series.episodes }, (_, i) => ({
                number: i + 1,
                title: `Episode ${i + 1}`,
                duration: "",
                videoUrl: null,
                isFree: i < 2,
              }))
          ).map((e) => (
            <Link
              key={e.number}
              href={`/series/${series.id}/watch/${e.number}`}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                e.number === episodeNum ? "bg-[#D4AF37]/20 border border-[#D4AF37]/50" : "bg-[#1a1a1a]"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                e.number === episodeNum ? "bg-[#D4AF37]" : "bg-[#333]"
              }`}>
                {e.number}
              </div>
              <div className="w-16 h-10 rounded overflow-hidden flex-shrink-0 bg-[#222]">
                <img
                  src={(e as { thumbnail?: string }).thumbnail || poster}
                  alt={e.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{e.title}</p>
                {e.duration && <p className="text-[#888] text-xs">{e.duration}</p>}
              </div>
              {e.isFree ? (
                <span className="text-[10px] bg-[#D4AF37] text-black px-2 py-0.5 rounded">FREE</span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#888]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Episode comments */}
      <Comments seriesId={series.id} episode={episodeNum} />
    </div>
  );
}
