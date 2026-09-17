import { NextRequest, NextResponse } from "next/server";
import { getBunnyManifestUrl, DEFAULT_SERIES_ID } from "@/lib/bunny";

export const dynamic = "force-dynamic";

// Returns a Bunny Stream HLS manifest URL for an episode.
// The token (if BUNNY_TOKEN_KEY is set) is signed server-side — never exposed to the browser.
export async function GET(req: NextRequest) {
  // CORS — allow all origins (video requests from Capacitor WebView, browser, etc.)
  const origin = req.headers.get("origin") || "*";
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const seriesId = (req.nextUrl.searchParams.get("series") || DEFAULT_SERIES_ID).trim();
  const ep = Number(req.nextUrl.searchParams.get("ep"));
  if (!Number.isInteger(ep) || ep < 1) {
    return NextResponse.json({ error: "Invalid episode" }, { status: 400, headers: corsHeaders });
  }
  const url = getBunnyManifestUrl(ep, seriesId);
  if (!url) {
    return NextResponse.json({ error: "Episode not found" }, { status: 404, headers: corsHeaders });
  }
  return NextResponse.json({ url }, { headers: corsHeaders });
}
