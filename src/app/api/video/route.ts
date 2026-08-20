import { NextRequest } from "next/server";
import { getBunnyManifestUrl } from "@/lib/bunny";

export const dynamic = "force-dynamic";

// Returns a Bunny Stream HLS manifest URL for an episode.
// The token (if BUNNY_TOKEN_KEY is set) is signed server-side — never exposed to the browser.
export async function GET(req: NextRequest) {
  const ep = Number(req.nextUrl.searchParams.get("ep"));
  if (!ep || ep < 1 || ep > 15) {
    return new Response("Invalid episode", { status: 400 });
  }
  const url = getBunnyManifestUrl(ep);
  if (!url) {
    return new Response("Episode not found", { status: 404 });
  }
  return Response.json({ url });
}
