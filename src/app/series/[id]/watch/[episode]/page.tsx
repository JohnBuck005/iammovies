import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import VideoPlayerClient from "@/components/VideoPlayerClient";
import { getSeriesById, getEpisode, seriesData } from "@/data/series";
import { getMergedSeriesById } from "@/lib/episodes";
import { getServerUserEmail, getSubscriptionStatus } from "@/lib/supabaseServer";
import { getEpisodeGuid, PULLZONE } from "@/lib/bunny";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string; episode: string }>;
};

function getBunnyThumbnailUrl(episodeNumber: number, seriesId: string): string | null {
  const guid = getEpisodeGuid(episodeNumber, seriesId);
  if (!guid) return null;
  return `https://${PULLZONE}/${guid}/thumbnail.jpg`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, episode } = await params;
  const epNum = Number(episode);
  const series = getSeriesById(id);
  const merged = await getMergedSeriesById(id).catch(() => null as Awaited<ReturnType<typeof getMergedSeriesById>>);
  const ep = merged?.episodeList?.find((candidate) => candidate.number === epNum) ?? getEpisode(id, epNum);
  if (!series || !ep) return { title: "Not Found" };
  return {
    title: `${series.title} — Ep ${ep.number}: ${ep.title}`,
    description: `${series.title}. Episode ${ep.number}: ${ep.title}. Watch on IAmoviestory.`,
    openGraph: {
      title: `${series.title} — Ep ${ep.number}: ${ep.title}`,
      description: `${series.title}. Episode ${ep.number}: ${ep.title}. Watch on IAmoviestory.`,
      type: "video.episode",
      url: `/series/${id}/watch/${episode}`,
      images: [
        {
          url: ep.thumbnail || getBunnyThumbnailUrl(ep.number, id) || series.poster || series.thumbnail,
          width: 1200,
          height: 630,
          alt: `${series.title} Episode ${ep.number}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${series.title} — Ep ${ep.number}: ${ep.title}`,
      description: `${series.title}. Episode ${ep.number}: ${ep.title}.`,
      images: [ep.thumbnail || getBunnyThumbnailUrl(ep.number, id) || series.poster || series.thumbnail],
    },
  };
}

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
  const epNum = Number(episode);
  const series = getSeriesById(id);

  // Resolve through the MERGED episode list, never the static one alone: episodes
  // uploaded via the admin panel live only in the DB, so a static-only lookup 404s
  // exactly the episodes the series page is already linking to.
  const mergedSeries = await getMergedSeriesById(id).catch(() => null as Awaited<ReturnType<typeof getMergedSeriesById>>);
  const ep =
    mergedSeries?.episodeList?.find((candidate) => candidate.number === epNum) ?? getEpisode(id, epNum);

  if (!series || !ep) return notFound();

  const email = await getServerUserEmail().catch(() => null as string | null);
  const subStatus = email ? await getSubscriptionStatus({ email }).catch(() => "none" as const) : "none";
  const hasActiveSubscription = subStatus === "active" || subStatus === "trialing";
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("iam_admin")?.value === "1";
  // Free-episode allowance stays a per-series NUMBER rule (never the isFree flags)
  // so a DB or static flag cannot accidentally make a later episode free.
  const freeAllowance = series.freeEpisodes ?? 5;
  const isLocked = !isAdmin && epNum > freeAllowance && !hasActiveSubscription;

  return (
    <div className="min-h-screen bg-black">
      {/* Player — full-width 9:16 portrait */}
      <div className="w-full">
        <VideoPlayerClient
          videoUrl={ep.videoUrl || undefined}
          poster={ep.thumbnail || getBunnyThumbnailUrl(ep.number, series.id) || series.poster || series.thumbnail}
          title={`${series.title} — Ep ${ep.number}`}
          episodeNum={ep.number}
          isLocked={isLocked}
          seriesId={series.id}
          freeEpisodes={freeAllowance}
          totalEpisodes={mergedSeries?.episodeList?.length || series.episodes}
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

        {isLocked && (
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