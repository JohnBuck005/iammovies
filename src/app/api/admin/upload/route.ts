import { NextRequest, NextResponse } from "next/server";
import { getSeriesById } from "@/data/series";
import { getServerSupabase } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAdmin(request: NextRequest): boolean {
  const cookie = request.cookies.get("iam_admin");
  return cookie?.value === "1";
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const seriesList = (await import("@/data/series")).seriesData.map((s) => ({
    id: s.id,
    title: s.title,
    episodeCount: s.episodeList?.length || s.episodes || 0,
  }));

  return NextResponse.json({ series: seriesList });
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const seriesId = String(body?.seriesId ?? "");
    const episodeNumber = Number(body?.episodeNumber ?? "");
    const title = String(body?.title ?? "").trim();
    const duration = String(body?.duration ?? "").trim();
    const videoUrl = String(body?.videoUrl ?? "").trim();
    const thumbnailUrl = String(body?.thumbnailUrl ?? "").trim();
    const coverUrl = String(body?.coverUrl ?? "").trim();

    if (!seriesId || !Number.isFinite(episodeNumber) || episodeNumber < 1) {
      return NextResponse.json({ error: "seriesId and episodeNumber are required" }, { status: 400 });
    }
    if (!title || !duration) {
      return NextResponse.json({ error: "title and duration are required" }, { status: 400 });
    }

    const series = getSeriesById(seriesId);
    if (!series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const thumb = thumbnailUrl || `/images/episodes/${seriesId === "baby-at-her-door" ? "tbahd" : seriesId}-ep${episodeNumber}.jpg`;
    const cover = coverUrl || null;

    // Upsert episode
    const { data, error } = await supabase
      .from("episodes")
      .upsert(
        {
          series_id: seriesId,
          number: episodeNumber,
          title,
          duration,
          video_url: videoUrl || null,
          is_free: episodeNumber <= 5,
          thumbnail: thumb,
          cover,
        },
        { onConflict: "series_id,number" }
      )
      .select()
      .single();

    if (error) {
      console.error("Episode upsert failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update series total episode count in local data file? Skip for now.
    // Instead, return what was saved; reader endpoints will merge at runtime.

    return NextResponse.json({
      ok: true,
      episode: {
        seriesId,
        episodeNumber,
        title,
        duration,
        videoUrl: videoUrl || null,
        thumbnailUrl: thumb,
        coverUrl: cover,
      },
    });
  } catch (e: any) {
    console.error("Upload failed:", e);
    return NextResponse.json({ error: e?.message || "Upload failed" }, { status: 500 });
  }
}
