"use client";

import { useState } from "react";

export default function ShareButton({
  url,
  label = "Share",
}: {
  url?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const link = url ?? (typeof window !== "undefined" ? window.location.href : "");
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Fallback for insecure contexts
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

  return (
    <button
      type="button"
      onClick={copyLink}
      className="flex flex-col items-center gap-1"
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
        {copied ? "Link copied!" : label}
      </span>
    </button>
  );
}
