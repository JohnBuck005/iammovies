import { NextRequest } from "next/server";
import { getBunnyManifestUrl, DEFAULT_SERIES_ID } from "@/lib/bunny";

export const dynamic = "force-dynamic";

// Returns a Bunny Stream HLS manifest URL for an episode.
// The token (if BUNNY_TOKEN_KEY is set) is signed server-side — never exposed to the browser.
// `series` is optional and defaults to the original series so existing /api/video?ep=N
// links keep resolving; the per-series GUID lookup is now the real guard (no fixed cap).
export async function GET(req: NextRequest) {
  const seriesId = (req.nextUrl.searchParams.get("series") || DEFAULT_SERIES_ID).trim();
  const ep = Number(req.nextUrl.searchParams.get("ep"));
  if (!Number.isInteger(ep) || ep < 1) {
    return new Response("Invalid episode", { status: 400 });
  }
  const url = getBunnyManifestUrl(ep, seriesId);
  if (!url) {
    return new Response("Episode not found", { status: 404 });
  }
  return Response.json({ url });
}