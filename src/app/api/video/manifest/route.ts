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
    // Add VIDEO-RANGE:SDR to every EXT-X-STREAM-INF line that lacks it
    const fixed = manifest
      .split(/\r?\n/)
      .map((line) => {
        if (line.startsWith("#EXT-X-STREAM-INF") && !line.includes("VIDEO-RANGE=")) {
          return line + ",VIDEO-RANGE=SDR";
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
