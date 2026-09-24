"use client";

// ReelShort-style vertical episode feed:
//   - one episode fills the screen, TikTok-style swipe (scroll-snap) moves
//     between episodes, the active one plays and neighbours stay primed
//   - a bottom sheet lists every episode as a numbered grid (paged 1-10,
//     11-20, ...) with the current episode highlighted and locked ones marked
//   - locked episodes render an unlock card instead of a player

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveCW, findCWForSeries } from "@/lib/continueWatching";
import { useUser } from "@/components/UserProvider";

type HlsType = typeof import("hls.js").default;

export type FeedEpisode = {
  number: number;
  title: string;
  duration?: string | null;
  videoUrl?: string | null;
  thumbnail?: string | null;
};

type FeedProps = {
  seriesId: string;
  title: string;
  description: string;
  genre: string;
  rating?: string | number;
  views?: string;
  poster?: string;
  episodes: FeedEpisode[];
  startEpisode?: number;
  freeAllowance: number;
  isAdmin: boolean;
  hasSubscription: boolean;
};

const PAGE_SIZE = 10;

/* ------------------------------------------------------------------ */
/* One episode's player. Mounted only for the active episode +/- 1 so  */
/* a 16-episode series never holds 16 hls.js instances.                */
/* ------------------------------------------------------------------ */
function FeedPlayer({
  episode,
  seriesId,
  active,
  muted,
  setMuted,
  onEnded,
}: {
  episode: FeedEpisode;
  seriesId: string;
  active: boolean;
  muted: boolean;
  setMuted: (m: boolean) => void;
  onEnded: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<HlsType | null>(null);
  const [hlsUrl, setHlsUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const lastSaveRef = useRef(0);
  const userPausedRef = useRef(false);
  const src = episode.videoUrl;

  // 1. resolve the manifest URL while active (/api/video returns { url })
  useEffect(() => {
    if (!active || !src) {
      setHlsUrl(null);
      return;
    }
    let cancelled = false;
    setErr(null);
    if (/\.m3u8(\?|$)/.test(src)) {
      setHlsUrl(src);
      return;
    }
    setLoading(true);
    fetch(src)
      .then((r) => {
        if (!r.ok) throw new Error(`video endpoint ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (!cancelled) setHlsUrl(d?.url ?? null);
      })
      .catch((e) => {
        if (!cancelled) setErr(`${e?.message || e} (${src})`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [active, src]);

  // 2. attach hls.js (or fall back to native HLS on Safari/WebView)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl || !active) return;
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
        return;
      }
      const { default: Hls } = await import("hls.js");
      if (cancelled) return;
      if (!Hls.isSupported()) {
        video.src = hlsUrl;
        return;
      }
      const hls = new Hls({ maxBufferLength: 20, capLevelToPlayerSize: true });
      hlsRef.current = hls;
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (!data.fatal) return;
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            setErr("Playback error — try refreshing");
            hls.destroy();
            hlsRef.current = null;
        }
      });
      cleanup = () => {
        hls.destroy();
        if (hlsRef.current === hls) hlsRef.current = null;
      };
    })();

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, [hlsUrl, active]);

  // Attempt playback. Only NotAllowedError (browser policy) downgrades to
  // muted — NotSupportedError just means hls.js has not attached the source
  // yet, which the onCanPlay handler retries. This distinction matters:
  // treating "no source yet" as "blocked" used to leave clips silent.
  const tryPlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch((err) => {
      if (err?.name === "NotAllowedError") {
        v.muted = true;
        setMuted(true);
        v.play().catch(() => {});
      }
    });
  };

  // 3. play only the active episode; pause the rest
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active && hlsUrl) {
      v.muted = muted;
      if (!userPausedRef.current) tryPlay();
    } else {
      try {
        v.pause();
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, hlsUrl, muted]);

  const saveProgress = () => {
    const v = videoRef.current;
    if (!v || !v.duration || !Number.isFinite(v.duration)) return;
    const now = Date.now();
    if (now - lastSaveRef.current < 4000) return;
    lastSaveRef.current = now;
    saveCW({
      seriesId,
      episode: episode.number,
      progress: Math.max(1, Math.min(100, Math.round((v.currentTime / v.duration) * 100))),
      ts: now,
    });
  };

  return (
    <div className="absolute inset-0 bg-black">
      <video
        ref={videoRef}
        controls
        controlsList="nodownload"
        playsInline
        preload="metadata"
        muted={muted}
        poster={episode.thumbnail ?? undefined}
        className="absolute inset-0 w-full h-full object-contain bg-black"
        // source just became available (or a seek finished): start playback
        // unless the viewer paused it themselves
        onCanPlay={() => {
          if (active && !userPausedRef.current) tryPlay();
        }}
        onPlay={() => {
          userPausedRef.current = false;
        }}
        onPause={() => {
          if (active) userPausedRef.current = true;
        }}
        onTimeUpdate={saveProgress}
        onEnded={() => {
          saveCW({ seriesId, episode: episode.number, progress: 100, ts: Date.now() });
          onEnded();
        }}
      />
      {loading && !hlsUrl && !err && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {err && (
        <div className="absolute inset-0 flex items-center justify-center px-8 text-center bg-black/70">
          <div>
            <p className="text-red-400 text-sm">Could not load video</p>
            <p className="text-[#888] text-xs mt-1">{err}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The feed                                                            */
/* ------------------------------------------------------------------ */
export default function EpisodeFeed({
  seriesId,
  title,
  description,
  genre,
  rating,
  views,
  poster,
  episodes,
  startEpisode,
  freeAllowance,
  isAdmin,
  hasSubscription,
}: FeedProps) {
  const router = useRouter();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const { recordWatched, inWatchlist, toggleWatchlist } = useUser();
  const saved = inWatchlist(seriesId);

  const isLocked = (ep: FeedEpisode) =>
    !isAdmin && ep.number > freeAllowance && !hasSubscription;

  // Where to start: explicit episode (watch route) > saved progress > ep 1.
  // Resolved inside an effect so SSR and hydration render identical DOM
  // (always episode 1 on first paint), avoiding a hydration mismatch.
  const [activeIdx, setActiveIdx] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  // Sound ON by default — no mute button. If the browser blocks audible
  // autoplay (needs a gesture), we fall back to muted and unmute on the very
  // first touch, so the clip is never silent after the viewer interacts.
  const [muted, setMuted] = useState(false);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const unblock = () => setMuted(false);
    window.addEventListener("pointerdown", unblock, { once: true });
    window.addEventListener("touchstart", unblock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unblock);
      window.removeEventListener("touchstart", unblock);
    };
  }, []);

  const activeEp = episodes[activeIdx];

  // Jump to the starting episode on mount / when the route's episode changes
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let target = startEpisode ?? 1;
    if (!startEpisode) {
      const cw = findCWForSeries(seriesId);
      if (cw) target = cw.episode;
    }
    const found = episodes.findIndex((e) => e.number === target);
    const idx = found >= 0 ? found : 0;
    const raf = requestAnimationFrame(() => {
      el.scrollTop = idx * el.clientHeight;
      setActiveIdx(idx);
      setPageIndex(Math.floor(idx / PAGE_SIZE));
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startEpisode]);

  // Which episode is on screen -> active
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            const idx = Number((e.target as HTMLElement).dataset.idx);
            if (!Number.isNaN(idx)) setActiveIdx(idx);
          }
        }
      },
      { root, threshold: [0.6] }
    );
    root.querySelectorAll("[data-idx]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [episodes.length]);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const jumpTo = (epNumber: number) => {
    const idx = episodes.findIndex((e) => e.number === epNumber);
    const el = scrollerRef.current;
    if (idx < 0 || !el) return;
    el.scrollTo({ top: idx * el.clientHeight, behavior: "smooth" });
    setActiveIdx(idx);
    setSheetOpen(false);
    setShowHint(false);
  };

  const goNext = () => {
    // credit the finished episode before advancing (rewards / progress sync)
    recordWatched(seriesId, episodes[activeIdx]?.number ?? 1, 100);
    if (activeIdx < episodes.length - 1) jumpTo(episodes[activeIdx + 1].number);
  };

  // Paged episode numbers, ReelShort style (1-10, 11-20, ...)
  const pages = useMemo(() => {
    const out: { label: string; eps: FeedEpisode[] }[] = [];
    for (let i = 0; i < episodes.length; i += PAGE_SIZE) {
      const slice = episodes.slice(i, i + PAGE_SIZE);
      out.push({ label: `${slice[0].number}-${slice[slice.length - 1].number}`, eps: slice });
    }
    return out;
  }, [episodes]);
  const [pageIndex, setPageIndex] = useState(0);

  return (
    <div className="fixed inset-0 z-40 bg-black">
      {/* ---- vertical snap feed ---- */}
      <div
        ref={scrollerRef}
        className="h-full w-full overflow-y-auto overscroll-y-contain"
        style={{ scrollSnapType: "y mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {episodes.map((ep, i) => {
          const locked = isLocked(ep);
          const isActive = i === activeIdx;
          const primed = Math.abs(i - activeIdx) <= 1;
          return (
            <section
              key={ep.number}
              data-idx={i}
              className="relative w-full h-full snap-start snap-always bg-black"
            >
              {/* poster always under the player */}
              <img
                src={ep.thumbnail || poster || ""}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-70"
              />

              {locked ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center bg-black/85">
                  <span className="text-4xl">🔒</span>
                  <p className="text-sm font-semibold">Episode {ep.number} · Premium</p>
                  <p className="text-[#999] text-xs">
                    {freeAllowance <= 0
                      ? "Subscribe to watch every episode"
                      : freeAllowance === 1
                        ? "Episode 1 is free to watch"
                        : `Episodes 1–${freeAllowance} are free to watch`}
                  </p>
                  <Link
                    href="/subscribe"
                    className="mt-1 bg-[#D4AF37] text-black text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-[#B8962E] transition"
                  >
                    🔓 Subscribe to Unlock
                  </Link>
                </div>
              ) : !ep.videoUrl ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-8 bg-black/85">
                  <p className="text-[#aaa] text-sm">Video coming soon</p>
                  <p className="text-[#666] text-xs">Ep {ep.number} · {ep.title}</p>
                </div>
              ) : primed ? (
                <FeedPlayer
                  episode={ep}
                  seriesId={seriesId}
                  active={isActive}
                  muted={muted}
                  setMuted={setMuted}
                  onEnded={goNext}
                />
              ) : null}
            </section>
          );
        })}
      </div>

      {/* ---- top bar ---- */}
      <div className="absolute top-0 inset-x-0 z-20 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-start gap-3 px-4 pt-4 pb-6">
          <button
            type="button"
            aria-label="Back"
            onClick={() => {
              if (window.history.length > 1) router.back();
              else router.push("/");
            }}
            className="pointer-events-auto w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center hover:bg-black/70 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="min-w-0 pointer-events-auto">
            <p className="font-semibold text-sm leading-tight drop-shadow truncate">{title}</p>
            <p className="text-[#bbb] text-xs drop-shadow truncate">
              Ep {activeEp?.number}: {activeEp?.title}
            </p>
          </div>
        </div>
      </div>

      {/* ---- right rail ---- */}
      <div className="absolute right-3 bottom-28 z-20 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label="Choose episode"
          className="w-12 h-12 rounded-xl bg-black/60 backdrop-blur border border-white/15 flex flex-col items-center justify-center hover:bg-black/80 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm9 0a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm9 0a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z" />
          </svg>
          <span className="text-[9px] text-white/90 leading-none mt-0.5">
            {activeEp?.number}-{episodes[episodes.length - 1]?.number}
          </span>
        </button>

        <button
          type="button"
          onClick={() => toggleWatchlist(seriesId)}
          aria-label={saved ? "Remove from My List" : "Add to My List"}
          className="w-12 h-12 rounded-full bg-black/60 backdrop-blur border border-white/15 flex items-center justify-center hover:bg-black/80 transition"
        >
          {saved ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 2a2 2 0 00-2 2v14l7-4 7 4V4a2 2 0 00-2-2H5z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M10 4v12M4 10h12" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* ---- swipe hint ---- */}
      {showHint && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-36 z-20 pointer-events-none">
          <div className="bg-black/70 backdrop-blur text-white/90 text-xs px-4 py-2 rounded-full border border-white/10">
            Swipe up for the next episode ↑
          </div>
        </div>
      )}

      {/* ---- episode sheet (ReelShort layout) ---- */}
      {sheetOpen && (
        <div
          className="absolute inset-0 z-30 bg-black/70"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="absolute inset-x-0 bottom-0 bg-[#141414] border-t border-[#2b2b2b] rounded-t-2xl px-4 pt-4 pb-6 max-h-[64vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* header: thumbnail + current episode + close */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={activeEp?.thumbnail || poster || ""}
                alt=""
                className="w-16 h-10 rounded object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  Ep {activeEp?.number}: {activeEp?.title}
                </p>
                <p className="text-[#888] text-xs truncate">
                  {genre}
                  {rating ? ` · ⭐ ${rating}` : ""}
                  {views ? ` · ${views} views` : ""}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close episodes"
                onClick={() => setSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-[#222] hover:bg-[#333] transition flex items-center justify-center text-[#ccc]"
              >
                ✕
              </button>
            </div>

            <p className="text-[#888] text-xs mb-2 line-clamp-2">{description}</p>

            {/* page tabs: 1-10, 11-20 ... */}
            {pages.length > 1 && (
              <div className="flex gap-5 border-b border-[#262626] mb-3">
                {pages.map((p, i) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setPageIndex(i)}
                    className={`pb-2 text-sm whitespace-nowrap border-b-2 transition ${
                      i === pageIndex
                        ? "text-[#D4AF37] border-[#D4AF37] font-medium"
                        : "text-[#888] border-transparent"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* numbered grid */}
            <div className="grid grid-cols-5 gap-2">
              {(pages[pageIndex]?.eps ?? episodes).map((ep) => {
                const current = ep.number === activeEp?.number;
                const locked = isLocked(ep);
                return (
                  <button
                    key={ep.number}
                    type="button"
                    onClick={() => jumpTo(ep.number)}
                    className={`relative h-11 rounded-lg text-sm font-medium transition ${
                      current
                        ? "bg-[#D4AF37] text-black"
                        : "bg-[#232323] text-white hover:bg-[#2e2e2e]"
                    }`}
                  >
                    {ep.number}
                    {locked && (
                      <span className="absolute top-0.5 right-0.5 text-[9px] leading-none opacity-80">
                        🔒
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
