import { getServerSupabase } from "@/lib/supabaseServer";
import { seriesData, getSeriesById, getEpisode, type Series, type Episode } from "@/data/series";

export type MergedSeries = Series & { dbEpisodeCount?: number };
export type MergedEpisode = Episode & { hasDbOverride?: boolean };

function withDbEpisodes<T extends Series>(series: T, dbEpisodes: Array<{ number: number; title: string; duration: string; video_url: string | null; is_free: boolean; thumbnail: string | null; cover: string | null }>): MergedSeries {
  if (!dbEpisodes.length) return series;
  const map = new Map(dbEpisodes.map((ep) => [ep.number, ep]));
  const baseList = series.episodeList ?? [];
  const merged: MergedEpisode[] = baseList.map((ep) => {
    const db = map.get(ep.number);
    if (!db) return ep;
    return {
      ...ep,
      title: db.title || ep.title,
      duration: db.duration || ep.duration,
      videoUrl: db.video_url ?? ep.videoUrl,
      isFree: db.is_free ?? ep.isFree,
      thumbnail: db.thumbnail || ep.thumbnail,
      cover: db.cover || ep.cover,
      hasDbOverride: true,
    };
  });
  for (const db of dbEpisodes) {
    if (!map.has(db.number)) {
      merged.push({
        number: db.number,
        title: db.title,
        duration: db.duration,
        videoUrl: db.video_url,
        isFree: db.is_free,
        thumbnail: db.thumbnail || undefined,
        cover: db.cover || undefined,
        hasDbOverride: true,
      });
    }
  }
  merged.sort((a, b) => a.number - b.number);
  return { ...series, episodeList: merged, dbEpisodeCount: merged.length };
}

let cachedPromise: Promise<MergedSeries[]> | null = null;

export async function getMergedSeries(): Promise<MergedSeries[]> {
  try {
    const supabase = getServerSupabase();
    if (!supabase) return seriesData as MergedSeries[];
    const { data, error } = await supabase
      .from("episodes")
      .select("series_id,number,title,duration,video_url,is_free,thumbnail,cover")
      .order("number", { ascending: true });
    if (error || !data) return seriesData as MergedSeries[];
    const grouped = new Map<string, typeof data>();
    for (const row of data) {
      const arr = grouped.get(row.series_id) || [];
      arr.push(row);
      grouped.set(row.series_id, arr);
    }
    return seriesData.map((s) => withDbEpisodes(s, grouped.get(s.id) || [])) as MergedSeries[];
  } catch {
    return seriesData as MergedSeries[];
  }
}

export async function getMergedSeriesById(id: string): Promise<MergedSeries | undefined> {
  const all = await getMergedSeries();
  return all.find((s) => s.id === id);
}

export async function getMergedEpisode(seriesId: string, episodeNum: number): Promise<MergedEpisode | undefined> {
  const series = await getMergedSeriesById(seriesId);
  return series?.episodeList?.find((ep) => ep.number === episodeNum);
}
