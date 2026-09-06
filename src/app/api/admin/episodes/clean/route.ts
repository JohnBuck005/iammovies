import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabaseServer";
import { seriesData } from "@/data/series";

function isAdmin(request: NextRequest): boolean {
  return request.cookies.get("iam_admin")?.value === "1";
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    // Build static fallback map: seriesId -> episodeNumber -> videoUrl
    const staticMap = new Map<string, Map<number, string | null>>();
    for (const s of seriesData) {
      const epMap = new Map<number, string | null>();
      for (const ep of s.episodeList ?? []) {
        epMap.set(ep.number, ep.videoUrl);
      }
      staticMap.set(s.id, epMap);
    }

    // Fetch all episodes with null/blank video_url
    const { data: badRows, error: fetchError } = await supabase
      .from("episodes")
      .select("series_id,number,video_url")
      .or("video_url.is.null,video_url.eq.''");

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const toDelete: Array<{ series_id: string; number: number }> = [];
    const skipped: Array<{ series_id: string; number: number; reason: string }> = [];

    for (const row of badRows ?? []) {
      const staticEpMap = staticMap.get(row.series_id);
      const staticVideoUrl = staticEpMap?.get(Number(row.number)) ?? null;

      if (staticVideoUrl) {
        // Static data has a real URL — this DB row is incorrectly blanking it out
        toDelete.push({ series_id: row.series_id, number: Number(row.number) });
      } else {
        // No static URL either — this episode genuinely has no video yet
        skipped.push({
          series_id: row.series_id,
          number: Number(row.number),
          reason: "no static fallback URL available",
        });
      }
    }

    // Delete the bad overrides in batches by series
    let deletedCount = 0;
    for (const row of toDelete) {
      const { error: deleteError } = await supabase
        .from("episodes")
        .delete()
        .eq("series_id", row.series_id)
        .eq("number", row.number);

      if (deleteError) {
        return NextResponse.json(
          { error: `Failed to delete ${row.series_id} ep ${row.number}: ${deleteError.message}` },
          { status: 500 }
        );
      }
      deletedCount++;
    }

    return NextResponse.json({
      ok: true,
      deleted: deletedCount,
      skipped: skipped.length,
      skippedDetails: skipped,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Cleanup failed" }, { status: 500 });
  }
}
