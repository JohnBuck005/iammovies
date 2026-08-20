"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Hls from "hls.js";
import { useUser } from "@/components/UserProvider";

interface VideoPlayerProps {
  videoUrl: string | null;
  poster: string;
  title: string;
  episodeNum: number;
  isLocked: boolean;
  seriesId: string;
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
}: VideoPlayerProps) {
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
      const hls = new Hls({ maxBufferLength: 30 });
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

        // Start at 720p if available, otherwise highest quality
        const level720 = parsed.find((l) => l.height >= 720);
        const startIndex = level720 ? level720.index : parsed.length - 1;
        hls.startLevel = startIndex;
        setCurrentLevel(startIndex);
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

  const autoLevel = levels.find((l) => l.height >= 720);

  // Locked premium episode → show paywall gate
  if (isLocked) {
    return (
      <div className="relative w-full bg-[#111]" style={{ aspectRatio: "16/9" }}>
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
          <p className="text-[#666] text-xs mt-3">Episodes 1 & 2 are free to watch</p>
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
      <div className="relative w-full bg-black" style={{ aspectRatio: "16 / 9" }}>
        <video
          key={hlsUrl ?? ""}
          ref={videoRef}
          controls
          controlsList="nodownload"
          disablePictureInPicture
          autoPlay
          poster={poster}
          className="w-full h-full object-contain bg-black"
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
        {levels.length > 0 && !loadErr && (
          <div className="absolute top-3 right-3 z-10">
            <select
              value={currentLevel}
              onChange={(e) => handleQualityChange(Number(e.target.value))}
              className="bg-black/70 text-white text-xs rounded-lg border border-white/20 px-2 py-1.5 backdrop-blur-sm"
            >
              <option value={-1}>Auto{autoLevel ? ` (720p)` : ""}</option>
              {levels.map((l) => (
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
    <div className="relative w-full bg-[#111]" style={{ aspectRatio: "16/9" }}>
      <img src={poster} alt={title} className="w-full h-full object-cover opacity-30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-[#888] text-sm">Video coming soon</p>
      </div>
    </div>
  );
}
