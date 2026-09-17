"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Hls from "hls.js";
import { useUser } from "@/components/UserProvider";

// MediaSession plugin — only available inside the native Capacitor shell.
// The dynamic import fails gracefully on the plain web, so the player works
// unchanged in a browser.
let MediaSession: typeof import("@capgo/capacitor-media-session").MediaSession | null = null;
(async () => {
  try {
    const mod = await import("@capgo/capacitor-media-session");
    MediaSession = mod.MediaSession;
  } catch {
    // Not running inside Capacitor — no-op.
  }
})();

interface VideoPlayerProps {
  videoUrl: string | null;
  poster: string;
  title: string;
  episodeNum: number;
  isLocked: boolean;
  seriesId: string;
  freeEpisodes?: number;
}

type QualityLevel = {
  index: number;
  height: number;
  width: number;
  label: string;
};

export default function VideoPlayer({
  videoUrl,
  poster,
  title,
  episodeNum,
  isLocked,
  seriesId,
  freeEpisodes = 5,
}: VideoPlayerProps) {
  // Paywall copy follows the series' own allowance — a hardcoded "1–5" is wrong
  // for any series with a different free-episode count.
  const freeLine =
    freeEpisodes <= 0
      ? "Subscribe to watch every episode"
      : freeEpisodes === 1
        ? "Episode 1 is free to watch"
        : `Episodes 1–${freeEpisodes} are free to watch`;
  const [showPaywall, setShowPaywall] = useState(false);
  const [hlsUrl, setHlsUrl] = useState<string | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const { addPoints, recordWatched } = useUser();

  // Fetch the signed manifest URL from our server route
  useEffect(() => {
    if (!videoUrl) return;
    let cancelled = false;
    setHlsUrl(null);
    setLoadErr(null);
    setLevels([]);
    setCurrentLevel(-1);
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    fetch(videoUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`video endpoint ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (!cancelled) setHlsUrl(d.url ?? null);
      })
      .catch((e) => {
        if (!cancelled) setLoadErr(String(e.message || e));
      });
    return () => {
      cancelled = true;
    };
  }, [videoUrl]);

  // Attach HLS via hls.js (or native for Safari)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl) return;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        capLevelToPlayerSize: false,
        startLevel: -1, // auto-detect best quality initially
      });
      hlsRef.current = hls;
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const parsed: QualityLevel[] = data.levels.map((level, index) => ({
          index,
          height: level.height,
          width: level.width,
          label: `${level.height}p`,
        }));
        console.log("Parsed levels:", parsed);
        setLevels(parsed);

        // Start at actual highest quality (levels aren't always sorted)
        const highest = parsed.reduce((best, l) => l.height > best.height ? l : best, parsed[0]);
        hls.startLevel = highest.index;
        hls.nextLevel = highest.index;
        setCurrentLevel(highest.index);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        if (data.level >= 0) setCurrentLevel(data.level);
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    video.src = hlsUrl;
  }, [hlsUrl]);

  const handleQualityChange = (index: number) => {
    const hls = hlsRef.current;
    if (!hls) return;
    hls.currentLevel = index;
    setCurrentLevel(index);
  };

  const autoLevel = levels.length > 0 ? levels.reduce((best, l) => l.height > best.height ? l : best, levels[0]) : null;

  // --- MediaSession: lock-screen controls + background audio metadata ---
  const setupMediaSession = useCallback(() => {
    if (!MediaSession) return;
    const video = videoRef.current;
    if (!video) return;

    // Metadata shown on lock screen / notification / Control Center
    MediaSession.setMetadata({
      title: `${title} — Episode ${episodeNum}`,
      artist: "IAmoviestory",
      album: title,
      artwork: poster ? [{ src: poster }] : [],
    }).catch(() => {});

    // Sync playback state to native controls
    const syncState = () => {
      MediaSession?.setPlaybackState({
        playbackState: video.paused ? "paused" : "playing",
      }).catch(() => {});
    };

    video.addEventListener("play", syncState);
    video.addEventListener("pause", syncState);
    video.addEventListener("ended", syncState);

    // Handle actions from lock screen / notification controls
    MediaSession.setActionHandler({ action: "play" }, () => {
      video.play();
    }).catch(() => {});
    MediaSession.setActionHandler({ action: "pause" }, () => {
      video.pause();
    }).catch(() => {});
    MediaSession.setActionHandler({ action: "seekbackward" }, () => {
      video.currentTime = Math.max(0, video.currentTime - 10);
    }).catch(() => {});
    MediaSession.setActionHandler({ action: "seekforward" }, () => {
      video.currentTime = Math.min(video.duration, video.currentTime + 10);
    }).catch(() => {});
  }, [title, episodeNum, poster]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl) return;
    // Wait for metadata to load so we have duration for position state
    const onLoaded = () => setupMediaSession();
    video.addEventListener("loadedmetadata", onLoaded);
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, [hlsUrl, setupMediaSession]);

  // Locked premium episode → show paywall gate
  if (isLocked) {
    return (
      <div className="relative w-full bg-[#111]" style={{ height: "100dvh", maxHeight: "100dvh" }}>
        <img
          src={poster}
          alt={title}
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-1">Episode {episodeNum} is Premium</h3>
          <p className="text-[#aaa] text-sm mb-4 max-w-xs">
            Subscribe to unlock all {title} episodes, ad-free.
          </p>
          <Link
            href="/subscribe"
            className="bg-[#D4AF37] text-black px-8 py-3 rounded-lg font-bold text-sm hover:bg-[#B8962E] transition"
          >
            🔓 Subscribe to Unlock
          </Link>
          <p className="text-[#666] text-xs mt-3">{freeLine}</p>
        </div>
      </div>
    );
  }

  // Free / unlocked episode → real video player
  if (videoUrl) {
    const qualityLabel =
      currentLevel === -1
        ? "Auto"
        : levels[currentLevel]?.label ?? "Auto";

    return (
      <div className="relative w-full bg-black" style={{ height: "100dvh", maxHeight: "100dvh" }}>
        <video
          key={hlsUrl ?? ""}
          ref={videoRef}
          controls
          controlsList="nodownload"
          autoPlay
          poster={poster}
          className="w-full h-full object-cover bg-black"
          playsInline
          onEnded={() => {
            recordWatched(seriesId, episodeNum, 100);
            addPoints(10);
          }}
        />
        {loadErr && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <p className="text-red-400 text-sm">Could not load video: {loadErr}</p>
          </div>
        )}
        {levels.length > 0 && (
          <div className="absolute top-3 left-3 z-20">
            <select
              value={currentLevel}
              onChange={(e) => handleQualityChange(Number(e.target.value))}
              className="bg-black/70 text-white text-[13px] font-semibold rounded-lg border border-white/40 px-3 py-1.5 backdrop-blur-md appearance-none cursor-pointer"
              style={{ textAlignLast: 'center' }}
            >
              <option value={-1}>Auto{autoLevel ? ` (${autoLevel.label})` : ""}</option>
              {levels.slice().sort((a, b) => b.height - a.height).map((l) => (
                <option key={l.index} value={l.index}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }

  // No video available fallback
  return (
    <div className="relative w-full bg-[#111]" style={{ height: "100dvh", maxHeight: "100dvh" }}>
      <img src={poster} alt={title} className="w-full h-full object-cover opacity-30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-[#888] text-sm">Video coming soon</p>
      </div>
    </div>
  );
}
