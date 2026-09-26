import { getMergedSeriesById } from "@/lib/episodes";
import { seriesData, getSeriesById } from "@/data/series";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getServerUserEmail, getSubscriptionStatus } from "@/lib/supabaseServer";
import { getEpisodeGuid, PULLZONE } from "@/lib/bunny";
import EpisodeFeed from "@/components/EpisodeFeed";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

function getBunnyThumbnailUrl(episodeNumber: number, seriesId: string): string | null {
  const guid = getEpisodeGuid(episodeNumber, seriesId);
  if (!guid) return null;
  return `https://${PULLZONE}/${guid}/thumbnail.jpg`;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return params.then(({ id }) => {
    const series = getSeriesById(id);
    if (!series) return { title: "Not Found" };
    const title = `${series.title} — IAmoviestory`;
    // Same-origin generated card, consistent with the episode pages.
    const ogImage = `/api/og?series=${encodeURIComponent(series.id)}&ep=1`;
    return {
      title,
      description: series.description,
      alternates: { canonical: `/series/${series.id}` },
      openGraph: {
        title,
        description: series.description,
        type: "website",
        url: `/series/${series.id}`,
        siteName: "IAmoviestory",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: series.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: series.description,
        images: [ogImage],
      },
    };
  });
}

export async function generateStaticParams() {
  return seriesData.map((series) => ({
    id: series.id,
  }));
}

// Tapping a series opens the immersive ReelShort-style feed: the episode fills
// the screen, swiping up loads the next one (TikTok behaviour), and a bottom
// sheet lists every episode as a numbered grid. That sheet replaces the old
// banner + episode-list layout as the episode browser.
export default async function SeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const series = await getMergedSeriesById(id);

  if (!series) notFound();

  const episodes = (series.episodeList ?? []).map((ep) => ({
    number: ep.number,
    title: ep.title,
    duration: ep.duration,
    videoUrl: ep.videoUrl ?? null,
    thumbnail: ep.thumbnail || getBunnyThumbnailUrl(ep.number, series.id) || series.thumbnail,
  }));

  if (!episodes.length) notFound();

  const email = await getServerUserEmail().catch(() => null as string | null);
  const subStatus = email ? await getSubscriptionStatus({ email }).catch(() => "none" as const) : "none";
  const hasSubscription = subStatus === "active" || subStatus === "trialing";
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("iam_admin")?.value === "1";

  // Free-episode allowance stays a per-series NUMBER rule (never isFree flags)
  const freeAllowance = series.freeEpisodes ?? 5;

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
      freeAllowance={freeAllowance}
      isAdmin={isAdmin}
      hasSubscription={hasSubscription}
    />
  );
}
