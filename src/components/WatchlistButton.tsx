"use client";

import { useState } from "react";
import { useUser } from "@/components/UserProvider";

export default function WatchlistButton({ seriesId }: { seriesId: string }) {
  const { inWatchlist, toggleWatchlist } = useUser();
  const saved = inWatchlist(seriesId);
  const [justToggled, setJustToggled] = useState(false);

  return (
    <button
      onClick={() => {
        toggleWatchlist(seriesId);
        setJustToggled(true);
        setTimeout(() => setJustToggled(false), 1200);
      }}
      className="w-full bg-[#1a1a1a] rounded-lg py-3 text-sm font-medium hover:bg-[#222] transition flex items-center justify-center gap-2"
    >
      {saved ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
          {justToggled ? "Saved to My List" : "In My List"}
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M10 4v12M4 10h12" strokeLinecap="round" />
          </svg>
          {justToggled ? "Added!" : "Add to My List"}
        </>
      )}
    </button>
  );
}
