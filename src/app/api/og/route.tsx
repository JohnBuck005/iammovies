import { ImageResponse } from "next/og";
import { getSeriesById, getEpisode } from "@/data/series";

// Renders the 1200x630 preview card Facebook / Instagram / WhatsApp use when a
// link is shared.
//
// Why this exists instead of pointing og:image at the episode thumbnail:
//   - Episodes 14-16 have no local thumbnail and fall back to the Bunny pullzone,
//     which 403s every referer except iamoviestory.com. A crawler fetching that
//     gets nothing, and the share card renders with no image at all.
//   - The local thumbnails are 848x576 or 624x576, not the 1200x630 that the
//     link-preview layout expects.
// This route is same-origin, always 200, and always the right size.

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("series") ?? "baby-at-her-door";
  const ep = Number(searchParams.get("ep") ?? "1");

  const series = getSeriesById(id);
  const episode = series ? getEpisode(id, ep) : null;
  const seriesTitle = series?.title ?? "Short Drama Series";
  const epTitle = episode?.title ?? `Episode ${ep}`;
  const genre = series?.genre ?? "Short Drama";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1030 55%, #2d1b4e 100%)",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: brand + genre */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#D4AF37",
              color: "#000",
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            I
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ color: "#D4AF37", fontSize: 30, fontWeight: 700, letterSpacing: 1 }}>
              IAmoviestory
            </div>
            <div style={{ color: "#8a8a9a", fontSize: 22 }}>{genre}</div>
          </div>
        </div>

        {/* Middle: series + episode title */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: 62,
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            {seriesTitle}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#D4AF37",
                color: "#000",
                fontSize: 28,
                fontWeight: 800,
                padding: "8px 22px",
                borderRadius: 999,
              }}
            >
              EP {ep}
            </div>
            <div style={{ color: "#e8e8f0", fontSize: 38, fontWeight: 600 }}>{epTitle}</div>
          </div>
        </div>

        {/* Bottom: call to action */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid rgba(255,255,255,0.12)",
            paddingTop: 28,
          }}
        >
          <div style={{ color: "#c8c8d8", fontSize: 30 }}>
            Watch free episodes on iamoviestory.com
          </div>
          <div style={{ color: "#D4AF37", fontSize: 30, fontWeight: 700 }}>▶</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
