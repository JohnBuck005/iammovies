import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getSeriesById, getEpisode, seriesData } from "@/data/series";
import { getMergedSeriesById } from "@/lib/episodes";
import { getServerUserEmail, getSubscriptionStatus } from "@/lib/supabaseServer";
import { getEpisodeGuid, PULLZONE } from "@/lib/bunny";
import EpisodeFeed from "@/components/EpisodeFeed";
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

// /series/[id]/watch/[episode] opens the same immersive feed as /series/[id],
// started at the requested episode — links, search results and continue
// watching all land in one TikTok-style player.
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

  const episodes = (mergedSeries?.episodeList ?? series.episodeList ?? []).map((e) => ({
    number: e.number,
    title: e.title,
    duration: e.duration,
    videoUrl: e.videoUrl ?? null,
    thumbnail: e.thumbnail || getBunnyThumbnailUrl(e.number, series.id) || series.thumbnail,
  }));

  if (!episodes.length) return notFound();

  return (
    <EpisodeFeed
      seriesId={series.id}
      title={series.title}
      description={series.description}
      genre={series.genre}
      rating={series.rating}
      views={series.views}
      poster={series.poster || series.thumbnail}
      episodes={episodes}
      startEpisode={epNum}
      freeAllowance={freeAllowance}
      isAdmin={isAdmin}
      hasSubscription={hasActiveSubscription}
    />
  );
}
