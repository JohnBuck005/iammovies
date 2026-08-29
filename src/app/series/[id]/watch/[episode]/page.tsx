import { notFound } from "next/navigation";
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";
import { getSeriesById, getEpisode, seriesData } from "@/data/series";
import { getServerUserEmail, getSubscriptionStatus } from "@/lib/supabaseServer";

type PageProps = {
  params: Promise<{ id: string; episode: string }>;
};

export async function generateStaticParams() {
  const params: { id: string; episode: string }[] = [];
  for (const s of seriesData) {
    const eps = s.episodeList ?? Array.from({ length: s.episodes }, (_, i) => ({ number: i + 1 }));
    for (const e of eps) {
      params.push({ id: s.id, episode: String(e.number) });
    }
  }
  return params;
}

export default async function WatchPage({ params }: PageProps) {
  const { id, episode } = await params;
  const series = getSeriesById(id);
  const ep = getEpisode(id, Number(episode));

  if (!series || !ep) return notFound();

  const email = await getServerUserEmail();
  const subStatus = email ? await getSubscriptionStatus({ email }) : "none";
  const hasActiveSubscription = subStatus === "active" || subStatus === "trialing";
  const isLocked = !ep.isFree && !hasActiveSubscription;

  return (
    <div className="min-h-screen">
      {/* Player */}
      <div className="px-4 pt-4">
        <VideoPlayer
          videoUrl={ep.videoUrl}
          poster={ep.thumbnail || series.poster || series.thumbnail}
          title={`${series.title} — Ep ${ep.number}`}
          episodeNum={ep.number}
          isLocked={isLocked}
          seriesId={series.id}
        />
      </div>

      {/* Episode info */}
      <div className="px-4 py-4">
        <Link
          href={`/series/${id}`}
          className="inline-block text-xs text-[#D4AF37] mb-2 hover:underline"
        >
          ← Back to episodes
        </Link>
        <h1 className="text-lg font-bold">{series.title}</h1>
        <p className="text-[#aaa] text-sm mt-1">
          Ep {ep.number}: {ep.title}
        </p>

        {!ep.isFree && (
          <div className="mt-4 rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/10 p-4 text-sm text-[#D4AF37]">
            Premium episode.{" "}
            <Link href="/subscribe" className="underline">
              Subscribe
            </Link>{" "}
            to unlock all episodes.
          </div>
        )}
      </div>
    </div>
  );
}
