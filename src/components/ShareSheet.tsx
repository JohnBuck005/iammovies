"use client";

import { useEffect, useState } from "react";

type ShareSheetProps = {
  seriesId: string;
  episodeNumber: number;
  seriesTitle: string;
  episodeTitle: string;
  /** Premise line, used as the caption so a pasted link carries its own hook. */
  hook?: string;
  className?: string;
};

/**
 * Share control for an episode.
 *
 * What a tap actually does: the text and URL go to the OS share sheet, and the
 * user picks Instagram / Facebook / WhatsApp and confirms there. Those apps then
 * post a LINK CARD (rendered from the page's og:/twitter: tags), not inline
 * video — no platform accepts a playable video hand-off from a web page. The
 * og: image is what makes that card worth tapping, so the per-episode
 * generateMetadata in the watch route is what actually powers this.
 */
export default function ShareSheet({
  seriesId,
  episodeNumber,
  seriesTitle,
  episodeTitle,
  hook,
  className = "",
}: ShareSheetProps) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}/series/${seriesId}/watch/${episodeNumber}`);
    setCanNativeShare(typeof navigator.share === "function");
  }, [seriesId, episodeNumber]);

  const text = hook
    ? `${hook} Episode ${episodeNumber}: ${episodeTitle}`
    : `${seriesTitle} — Ep ${episodeNumber}: ${episodeTitle}`;

  async function nativeShare() {
    if (!canNativeShare) return;
    try {
      await navigator.share({ title: `${seriesTitle} — Ep ${episodeNumber}`, text, url });
      setOpen(false);
    } catch {
      // User dismissed the sheet — not an error worth surfacing.
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = `${text}\n${url}`;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setOpen(false);
    setTimeout(() => setCopied(false), 1800);
  }

  function openDirect(href: string) {
    window.open(href, "_blank", "noopener,noreferrer,width=640,height=760");
    setOpen(false);
  }

  const targets = [
    {
      label: "WhatsApp",
      tint: "#25D366",
      href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    },
    {
      label: "Facebook",
      tint: "#1877F2",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      label: "X",
      tint: "#e7e7ea",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    },
  ];

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => (canNativeShare ? nativeShare() : setOpen((v) => !v))}
        aria-label={`Share Episode ${episodeNumber}`}
        className="flex flex-col items-center gap-1 active:scale-95 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-6 w-6 text-white"
          fill="currentColor"
        >
          <path d="M13.5 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
          <path d="M20.4 3.6a1.7 1.7 0 00-2.4 0l-2.1 2.1a1.7 1.7 0 000 2.4l.3.3-3.1 3.1-2.2-.6a1.7 1.7 0 00-1.6.3l-2.4 2.4a1.7 1.7 0 000 2.4l5.6 5.6a1.7 1.7 0 002.4 0l2.4-2.4c.3-.4.4-1 .3-1.6l-.6-2.2 3.1-3.1.3.3a1.7 1.7 0 002.4 0l2.1-2.1a1.7 1.7 0 000-2.4l-5.5-5.5zm-1.4 1.4l5.5 5.5-2.1 2.1-5.5-5.5 2.1-2.1z" />
        </svg>
        <span className="text-[10px] text-white/70">
          {copied ? "Copied!" : "Share"}
        </span>
      </button>

      {open && !canNativeShare ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute bottom-full right-0 z-50 mb-2 w-52 overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#141414] shadow-xl">
            {targets.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => openDirect(t.href)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white hover:bg-[#1e1e1e]"
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: t.tint }}
                />
                {t.label}
              </button>
            ))}
            <button
              type="button"
              onClick={copyLink}
              className="flex w-full items-center gap-3 border-t border-[#2a2a2a] px-4 py-3 text-left text-sm text-white hover:bg-[#1e1e1e]"
            >
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#D4AF37]" />
              Copy link + caption
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
