import { NextRequest, NextResponse } from "next/server";
import { getBunnyManifestUrl, DEFAULT_SERIES_ID } from "@/lib/bunny";

export const dynamic = "force-dynamic";

// Proxies a Bunny Stream HLS manifest, adding VIDEO-RANGE:SDR to each
// stream-inf tag (Bunny omits it, hls.js >= 1.6 requires it).
export async function GET(req: NextRequest) {
  const seriesId = (req.nextUrl.searchParams.get("series") || DEFAULT_SERIES_ID).trim();
  const ep = Number(req.nextUrl.searchParams.get("ep"));
  if (!Number.isInteger(ep) || ep < 1) {
    return NextResponse.json({ error: "Invalid episode" }, { status: 400 });
  }
  const bunnyUrl = getBunnyManifestUrl(ep, seriesId);
  if (!bunnyUrl) {
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  }
  try {
    const res = await fetch(bunnyUrl);
    if (!res.ok) {
      return NextResponse.json({ error: `Bunny returned ${res.status}` }, { status: res.status });
    }
    const manifest = await res.text();

    // Bunny's master lists RELATIVE variant URIs ("360p/video.m3u8"), which
    // resolve correctly against the CDN but, once proxied through
    // /api/video/manifest, would resolve against OUR domain -> /api/video/360p/video.m3u8
    // -> 404. The 404 body is then handed to the player, which surfaces as
    // "Demuxer error could not parse" / video error 4 on Android.
    // Fix: rewrite URI lines to absolute CDN URLs (CDN sends CORS *).
    const queryIndex = bunnyUrl.indexOf("?");
    const bunnyBase = queryIndex === -1 ? bunnyUrl : bunnyUrl.slice(0, queryIndex);
    const bunnyQuery = queryIndex === -1 ? "" : bunnyUrl.slice(queryIndex);
    const dir = bunnyBase.replace(/\/[^/]*$/, ""); // strip playlist.m3u8

    // Add VIDEO-RANGE:SDR to every EXT-X-STREAM-INF line that lacks it
    const fixed = manifest
      .split(/\r?\n/)
      .map((line) => {
        if (line.startsWith("#EXT-X-STREAM-INF") && !line.includes("VIDEO-RANGE=")) {
          return line + ",VIDEO-RANGE=SDR";
        }
        // URI line (not a tag, not blank): make it absolute on the CDN
        if (!line.startsWith("#") && line.trim() !== "") {
          if (/^https?:\/\//.test(line) || line.startsWith("/")) return line;
          return `${dir}/${line.replace(/^\.\//, "")}${bunnyQuery}`;
        }
        return line;
      })
      .join("\n");
    return new NextResponse(fixed, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
