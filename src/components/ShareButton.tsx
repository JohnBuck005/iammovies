"use client";

import { useState } from "react";

type ShareButtonProps = {
  url?: string;
  label?: string;
  title?: string;
};

export default function ShareButton({
  url,
  label = "Share",
  title = "",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const link = url ?? (typeof window !== "undefined" ? window.location.href : "");
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function shareFacebook() {
    const link = url ?? (typeof window !== "undefined" ? window.location.href : "");
    const text = title ? `${title} — IAmoviestory` : "IAmoviestory — Watch Short Drama Series";
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
    window.open(fbUrl, "_blank", "noopener,noreferrer,width=600,height=500");
  }

  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={shareFacebook}
        className="flex flex-col items-center gap-1"
        aria-label="Share on Facebook"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        <span className="text-[10px] text-[#888]">Facebook</span>
      </button>

      <button
        type="button"
        onClick={copyLink}
        className="flex flex-col items-center gap-1"
        aria-label="Copy link"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
        </svg>
        <span className="text-[10px] text-[#888]">
          {copied ? "Copied!" : "Copy"}
        </span>
      </button>
    </div>
  );
}
