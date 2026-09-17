"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Hls from "hls.js";
import { useUser } from "@/components/UserProvider";

// MediaSession plugin — only available inside the native Capacitor shell.
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
  totalEpisodes?: number;
}

type QualityLevel = {
  index: number;
  height: number;
  width: number;
  label: string;
};

// --- Continue Watching helpers ---
const CW_KEY = "iam_continue_watching";
type CWEntry = { seriesId: string; episode: number; progress: number; ts: number };

function saveCW(entry: CWEntry) {
  try {
    const raw = localStorage.getItem(CW_KEY);
    const list: CWEntry[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((e) => e.seriesId === entry.seriesId);
    if (idx >= 0) list[idx] = entry;
    else list.push(entry);
    list.sort((a, b) => b.ts - a.ts);
    localStorage.setItem(CW_KEY, JSON.stringify(list.slice(0, 20)));
  } catch {}
}

export function getContinueWatching(): CWEntry[] {
  try {
    const raw = localStorage.getItem(CW_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function VideoPlayer({
  videoUrl,
  poster,
  title,
  episodeNum,
  isLocked,
  seriesId,
  freeEpisodes = 5,
  totalEpisodes,
}: VideoPlayerProps) {
  const router = useRouter();
  const freeLine =
    freeEpisodes <= 0
      ? "Subscribe to watch every episode"
      : freeEpisodes === 1
        ? "Episode 1 is free to watch"
        : `Episodes 1–${freeEpisodes} are free to watch`;
  const [hlsUrl, setHlsUrl] = useState<string | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const { addPoints, recordWatched } = useUser();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const touchRef = useRef<{ dist: number; mid: { x: number; y: number }; zoom: number; pan: { x: number; y: number } } | null>(null);

  // --- Gesture state ---
  const [seekFlash, setSeekFlash] = useState<"rewind" | "forward" | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number; side: "left" | "right" } | null>(null);
  const lastTapRef = useRef(0);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isGestureRef = useRef(false);
  const [brightness, setBrightness] = useState(1);
  const [volume, setVolume] = useState(1);
  const [gestureIndicator, setGestureIndicator] = useState<{ type: "brightness" | "volume"; value: number } | null>(null);
  const gestureHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPiP, setIsPiP] = useState(false);

  // --- Immersive mode on mount ---
  useEffect(() => {
    let StatusBar: any = null;
    (async () => {
      try {
        const mod = await import("@capacitor/status-bar");
        StatusBar = mod.StatusBar;
        await StatusBar.hide();
      } catch {}
    })();
    return () => {
      try { StatusBar?.show(); } catch {}
    };
  }, []);

  // Fetch the signed manifest URL
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

  // Attach HLS
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
        startLevel: -1,
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
        setLevels(parsed);
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

  // Save watch progress periodically
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;
    const onTimeUpdate = () => {
      if (video.duration > 0) {
        const progress = Math.round((video.currentTime / video.duration) * 100);
        saveCW({ seriesId, episode: episodeNum, progress, ts: Date.now() });
      }
    };
    video.addEventListener("timeupdate", onTimeUpdate);
    return () => video.removeEventListener("timeupdate", onTimeUpdate);
  }, [videoUrl, seriesId, episodeNum]);

  const handleQualityChange = (index: number) => {
    const hls = hlsRef.current;
    if (!hls) return;
    hls.currentLevel = index;
    setCurrentLevel(index);
    triggerHaptic("light");
  };

  const autoLevel = levels.length > 0 ? levels.reduce((best, l) => l.height > best.height ? l : best, levels[0]) : null;

  // --- Haptic feedback ---
  const triggerHaptic = useCallback((type: "light" | "medium" | "heavy" = "light") => {
    try {
      if (navigator.vibrate) {
        const patterns: Record<string, number | number[]> = {
          light: 15,
          medium: [15, 15, 15],
          heavy: [30, 10, 30],
        };
        navigator.vibrate(patterns[type]);
      }
      // Capacitor native haptic
      (async () => {
        try {
          const mod = await import("@capacitor/haptics");
          if (type === "light") mod.Haptics.lightImpact();
          else if (type === "medium") mod.Haptics.mediumImpact();
          else mod.Haptics.heavyImpact();
        } catch {}
      })();
    } catch {}
  }, []);

  // --- Auto-resume ---
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const onLoaded = () => {
      if (video.duration > 0) {
        // Check saved progress for this episode
        try {
          const raw = localStorage.getItem(CW_KEY);
          if (raw) {
            const list: CWEntry[] = JSON.parse(raw);
            const entry = list.find(
              (e) => e.seriesId === seriesId && e.episode === episodeNum
            );
            if (entry && entry.progress > 10) {
              const seekTime = (entry.progress / 100) * video.duration;
              video.currentTime = Math.min(seekTime, video.duration - 5);
            }
          }
        } catch {}
      }
      setupMediaSession();
    };

    video.addEventListener("loadedmetadata", onLoaded);
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, [videoUrl, seriesId, episodeNum, setupMediaSession]);

  // --- Picture-in-Picture ---
  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      const pipMod = await import("@capacitor/pip");
      if (pipMod.Pip.isSupported()) {
        if (isPiP) { await pipMod.Pip.exit(); video.play(); setIsPiP(false); }
        else { video.pause(); await pipMod.Pip.enter({ videoElement: videoRef.current! }); setIsPiP(true); }
        return;
      }
    } catch {}
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture(); video.play(); setIsPiP(false);
      } else { video.pause(); await video.requestPictureInPicture(); setIsPiP(true); }
    } catch {}
  }, [isPiP]);

  useEffect(() => {
    const onPiPLeave = () => { setIsPiP(false); videoRef.current?.play(); };
    document.addEventListener("leavepictureinpicture", onPiPLeave);
    return () => document.removeEventListener("leavepictureinpicture", onPiPLeave);
  }, []);

  // --- MediaSession ---
  const setupMediaSession = useCallback(() => {
    if (!MediaSession) return;
    const video = videoRef.current;
    if (!video) return;

    MediaSession.setMetadata({
      title: `${title} — Episode ${episodeNum}`,
      artist: "IAmoviestory",
      album: title,
      artwork: poster ? [{ src: poster }] : [],
    }).catch(() => {});

    const syncState = () => {
      MediaSession?.setPlaybackState({
        playbackState: video.paused ? "paused" : "playing",
      }).catch(() => {});
    };

    video.addEventListener("play", syncState);
    video.addEventListener("pause", syncState);
    video.addEventListener("ended", syncState);

    MediaSession.setActionHandler({ action: "play" }, () => video.play()).catch(() => {});
    MediaSession.setActionHandler({ action: "pause" }, () => video.pause()).catch(() => {});
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
    const onLoaded = () => setupMediaSession();
    video.addEventListener("loadedmetadata", onLoaded);
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, [hlsUrl, setupMediaSession]);

  // --- Auto-play next ---
  const hasNext = totalEpisodes ? episodeNum < totalEpisodes : true;

  const cancelCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(null);
  }, []);

  const handleEnded = useCallback(() => {
    recordWatched(seriesId, episodeNum, 100);
    addPoints(10);
    if (!hasNext) return;
    let remaining = 5;
    setCountdown(remaining);
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(countdownRef.current!);
        countdownRef.current = null;
        router.push(`/series/${seriesId}/watch/${episodeNum + 1}`);
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  }, [seriesId, episodeNum, hasNext, router, recordWatched, addPoints]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // --- Gesture handlers ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      touchRef.current = {
        dist: Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY),
        mid: { x: (e.touches[0].clientX + e.touches[1].clientX) / 2, y: (e.touches[0].clientY + e.touches[1].clientY) / 2 },
        zoom,
        pan,
      };
      isGestureRef.current = true;
    } else if (e.touches.length === 1) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const side = e.touches[0].clientX - rect.left < rect.width / 2 ? "left" : "right";
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now(), side };
      isGestureRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const video = videoRef.current;
    if (!video) return;

    // Two-finger pinch → zoom
    if (e.touches.length === 2 && touchRef.current) {
      e.preventDefault();
      const newDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const newMid = { x: (e.touches[0].clientX + e.touches[1].clientX) / 2, y: (e.touches[0].clientY + e.touches[1].clientY) / 2 };
      const scale = Math.max(1, Math.min(5, touchRef.current.zoom * (newDist / touchRef.current.dist)));
      setZoom(scale);
      setPan({
        x: touchRef.current.pan.x + (newMid.x - touchRef.current.mid.x),
        y: touchRef.current.pan.y + (newMid.y - touchRef.current.mid.y),
      });
      isGestureRef.current = true;
      return;
    }

    // One-finger vertical swipe → brightness (left) / volume (right)
    if (e.touches.length === 1 && touchStartRef.current) {
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);

      if (ady > 20 && ady > adx * 1.5) {
        isGestureRef.current = true;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const delta = -dy / (rect.height * 0.6);

        if (touchStartRef.current.side === "left") {
          const newB = Math.max(0, Math.min(1, brightness + delta));
          setBrightness(newB);
          setGestureIndicator({ type: "brightness", value: newB });
          video.style.filter = `brightness(${newB})`;
        } else {
          const newV = Math.max(0, Math.min(1, volume + delta));
          setVolume(newV);
          video.volume = newV;
          setGestureIndicator({ type: "volume", value: newV });
        }

        if (gestureHideRef.current) clearTimeout(gestureHideRef.current);
        gestureHideRef.current = setTimeout(() => setGestureIndicator(null), 800);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const video = videoRef.current;

    // Two-finger: snap zoom
    if (touchRef.current) {
      touchRef.current = null;
      const snapPoints = [1, 1.5, 2, 3, 5];
      const nearest = snapPoints.reduce((prev, curr) => Math.abs(curr - zoom) < Math.abs(prev - zoom) ? curr : prev);
      setZoom(nearest);
      if (nearest === 1) setPan({ x: 0, y: 0 });
      return;
    }

    if (touchStartRef.current && e.changedTouches.length === 1) {
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);
      const elapsed = Date.now() - touchStartRef.current.time;

      // Horizontal swipe → episode change (only when not zoomed)
      if (adx > 60 && adx > ady * 1.5 && zoom === 1 && !isGestureRef.current) {
        triggerHaptic("medium");
        if (dx < 0 && hasNext) {
          router.push(`/series/${seriesId}/watch/${episodeNum + 1}`);
        } else if (dx > 0 && episodeNum > 1) {
          router.push(`/series/${seriesId}/watch/${episodeNum - 1}`);
        }
        touchStartRef.current = null;
        return;
      }

      // Tap detection
      if (elapsed < 300 && adx < 20 && ady < 20 && !isGestureRef.current) {
        const now = Date.now();
        const side = touchStartRef.current.side;

        // Double-tap → seek
        if (now - lastTapRef.current < 300) {
          if (tapTimeoutRef.current) {
            clearTimeout(tapTimeoutRef.current);
            tapTimeoutRef.current = null;
          }
          if (video) {
            if (side === "left") {
              video.currentTime = Math.max(0, video.currentTime - 10);
              setSeekFlash("rewind");
            } else {
              video.currentTime = Math.min(video.duration, video.currentTime + 10);
              setSeekFlash("forward");
            }
            triggerHaptic("light");
            setTimeout(() => setSeekFlash(null), 500);
          }
          lastTapRef.current = 0;
        } else {
          // Single tap → play/pause (delayed to distinguish from double-tap)
          lastTapRef.current = now;
          tapTimeoutRef.current = setTimeout(() => {
            if (video) video.paused ? video.play() : video.pause();
          }, 300);
        }
      }
    }

    touchStartRef.current = null;
    isGestureRef.current = false;
  };

  // Locked premium episode
  if (isLocked) {
    return (
      <div className="relative w-full bg-[#111]" style={{ height: "100dvh", maxHeight: "100dvh" }}>
        <img src={poster} alt={title} className="w-full h-full object-cover opacity-20" />
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
          <Link href="/subscribe" className="bg-[#D4AF37] text-black px-8 py-3 rounded-lg font-bold text-sm hover:bg-[#B8962E] transition">
            🔓 Subscribe to Unlock
          </Link>
          <p className="text-[#666] text-xs mt-3">{freeLine}</p>
        </div>
      </div>
    );
  }

  // Free / unlocked episode
  if (videoUrl) {
    return (
      <div
        className="relative w-full bg-black overflow-hidden"
        style={{ height: "100dvh", maxHeight: "100dvh" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <video
          key={hlsUrl ?? ""}
          ref={videoRef}
          controls
          controlsList="nodownload"
          autoPlay
          poster={poster}
          className="w-full h-full object-cover bg-black"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transition: touchRef.current ? "none" : "transform 0.2s ease-out",
            touchAction: "none",
          }}
          playsInline
          onEnded={handleEnded}
        />

        {/* Load error */}
        {loadErr && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <p className="text-red-400 text-sm">Could not load video: {loadErr}</p>
          </div>
        )}

        {/* PiP toggle — top-right */}
        <button
          onClick={() => togglePiP()}
          className="absolute top-3 right-3 z-20 bg-black/70 text-white w-10 h-10 rounded-lg flex items-center justify-center backdrop-blur-md hover:bg-black/90 transition"
          title="Picture in Picture"
        >
          {isPiP ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          )}
        </button>

        {/* Quality selector — top-left */}
        {levels.length > 0 && (
          <div className="absolute top-3 left-3 z-20">
            <select
              value={currentLevel}
              onChange={(e) => handleQualityChange(Number(e.target.value))}
              className="bg-black/70 text-white text-[13px] font-semibold rounded-lg border border-white/40 px-3 py-1.5 backdrop-blur-md appearance-none cursor-pointer"
              style={{ textAlignLast: "center" }}
            >
              <option value={-1}>Auto{autoLevel ? ` (${autoLevel.label})` : ""}</option>
              {levels.slice().sort((a, b) => b.height - a.height).map((l) => (
                <option key={l.index} value={l.index}>{l.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Double-tap seek flash */}
        {seekFlash && (
          <div className={`absolute inset-y-0 ${seekFlash === "rewind" ? "left-0 w-1/3" : "right-0 w-1/3"} flex items-center justify-center pointer-events-none z-30`}>
            <div className="flex flex-col items-center gap-1">
              <span className="text-white text-3xl font-bold drop-shadow-lg">
                {seekFlash === "rewind" ? "⏪" : "⏩"}
              </span>
              <span className="text-white text-sm font-semibold drop-shadow-lg">10s</span>
            </div>
          </div>
        )}

        {/* Brightness / Volume indicator */}
        {gestureIndicator && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
            <div className="bg-black/70 rounded-xl px-4 py-3 flex flex-col items-center gap-2 backdrop-blur-md">
              <span className="text-white text-xs">{gestureIndicator.type === "brightness" ? "☀️" : "🔊"}</span>
              <div className="w-20 h-1.5 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${gestureIndicator.value * 100}%` }} />
              </div>
              <span className="text-white text-[11px] font-medium">{Math.round(gestureIndicator.value * 100)}%</span>
            </div>
          </div>
        )}

        {/* Auto-play next countdown */}
        {countdown !== null && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30">
            <p className="text-white text-lg font-bold mb-2">Next episode</p>
            <div className="relative w-20 h-20 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="white" strokeWidth="3" opacity="0.2" />
                <circle
                  cx="40" cy="40" r="36" fill="none" stroke="#D4AF37" strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - countdown / 5)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">{countdown}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={cancelCountdown} className="bg-white/20 text-white px-6 py-2 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={() => { cancelCountdown(); router.push(`/series/${seriesId}/watch/${episodeNum + 1}`); }} className="bg-[#D4AF37] text-black px-6 py-2 rounded-lg text-sm font-bold">Play Now</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // No video fallback
  return (
    <div className="relative w-full bg-[#111]" style={{ height: "100dvh", maxHeight: "100dvh" }}>
      <img src={poster} alt={title} className="w-full h-full object-cover opacity-30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-[#888] text-sm">Video coming soon</p>
      </div>
    </div>
  );
}
