"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/components/UserProvider";

interface VideoPlayerProps {
  videoUrl: string | null;
  poster: string;
  title: string;
  episodeNum: number;
  isLocked: boolean;
  seriesId: string;
}

export default function VideoPlayer({
  videoUrl,
  poster,
  title,
  episodeNum,
  isLocked,
  seriesId,
}: VideoPlayerProps) {
  const [showPaywall, setShowPaywall] = useState(false);
  const { addPoints, recordWatched } = useUser();

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
    return (
      <div className="relative w-full bg-black" style={{ aspectRatio: "16 / 9" }}>
        <video
          key={videoUrl}
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
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
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
