"use client";

import dynamic from "next/dynamic";

// VideoPlayer is fully client-only — hls.js and Capacitor plugins cause TDZ
// errors when Turbopack bundles them into SSR chunks (Next.js 16).
// Dynamic import with ssr: false keeps the heavy dependencies out of SSR entirely.
const VideoPlayer = dynamic(() => import("@/components/VideoPlayer"), {
  ssr: false,
  loading: () => (
    <div className="w-full bg-black flex items-center justify-center" style={{ height: "100dvh" }}>
      <div className="animate-pulse text-[#888] text-sm">Loading player…</div>
    </div>
  ),
});

type VideoPlayerProps = {
  videoUrl?: string;
  poster: string;
  title: string;
  episodeNum: number;
  isLocked: boolean;
  seriesId: string;
  freeEpisodes?: number;
  totalEpisodes?: number;
};

export default function VideoPlayerClient(props: VideoPlayerProps) {
  return <VideoPlayer {...props} />;
}