// HLS-ready VideoPlayer swap for IAmovies.
// Current player uses <video><source src={videoUrl} type="video/mp4">.
// For HLS (.m3u8) we add hls.js. Drop-in for src/components/VideoPlayer.tsx.
//
// WHICH videoUrl?
//  - Oracle self-host path:  `/videos/hls/ep<N>/master.m3u8`  (files we pre-packaged)
//  - Bunny Stream path:      `<BUNNY_MANIFEST_URL>.m3u8`       (signed token appended)
//
// Install: `npm i hls.js`

"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

export function useHls(videoRef, videoUrl) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;
    // Native HLS (Safari) — just set src
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
      return;
    }
    // Everything else — use hls.js
    if (Hls.isSupported()) {
      const hls = new Hls({ maxBufferLength: 30 });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      return () => hls.destroy();
    }
    // Last resort
    video.src = videoUrl;
  }, [videoUrl, videoRef]);
}

// In the component, replace the <video> block with:
//
//   const videoRef = useRef<HTMLVideoElement>(null);
//   useHls(videoRef, videoUrl);
//   ...
//   <video
//     key={videoUrl}
//     ref={videoRef}
//     controls autoPlay poster={poster}
//     className="w-full h-full object-contain bg-black"
//     playsInline
//     onEnded={() => { recordWatched(seriesId, episodeNum, 100); addPoints(10); }}
//   />
//
// No <source> tag needed — hls.js sets src internally.
