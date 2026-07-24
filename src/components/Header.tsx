"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { seriesData } from "@/data/series";

const TABS = [
  { key: "discover", label: "Discover", icon: null },
  { key: "new", label: "New", icon: "✨" },
  { key: "premium", label: "Premium", icon: "💎" },
  { key: "trending", label: "Trending", icon: null },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "discover";

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results = query.trim()
    ? seriesData.filter(
        (s) =>
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          s.genre.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const goSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?tab=search&q=${encodeURIComponent(query.trim())}`);
      setFocused(false);
    }
  };

  const selectTab = (key: string) => {
    if (pathname === "/") {
      router.push(`/?tab=${key}`);
    } else {
      router.push(`/?tab=${key}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#1a1a1a]">
      <div className="px-4 py-3">
        {/* Logo */}
        <div className="flex items-center justify-between mb-3">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/images/iamoviestory-logo.jpg"
              alt="IAmoviestory"
              className="w-9 h-9 rounded-lg object-cover"
            />
            <span className="font-bold text-lg tracking-wide">IAmoviestory</span>
          </Link>
          <div className="flex items-center gap-3">
            <button className="text-[#888] hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={goSearch} className="relative">
          <input
            type="text"
            placeholder="Search series..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            className="w-full bg-[#1a1a1a] text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] placeholder-[#666]"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Live dropdown results */}
          {focused && query.trim() && (
            <div className="absolute left-0 right-0 top-12 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl max-h-80 overflow-y-auto z-50">
              {results.length > 0 ? (
                results.map((s) => (
                  <Link
                    key={s.id}
                    href={`/series/${s.id}`}
                    className="flex items-center gap-3 p-3 hover:bg-[#222] transition border-b border-[#222] last:border-0"
                  >
                    <img src={s.thumbnail} alt={s.title} className="w-10 h-14 object-cover rounded" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{s.title}</p>
                      <p className="text-[#888] text-xs">{s.genre} · {s.views}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center text-[#888] text-sm">
                  No series found for "{query}"
                </div>
              )}
            </div>
          )}
        </form>

        {/* Category tabs */}
        <div className="flex gap-4 mt-3 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => selectTab(tab.key)}
              className={`text-sm whitespace-nowrap pb-1 flex items-center gap-1 border-b-2 transition ${
                activeTab === tab.key
                  ? "text-white font-medium border-[#D4AF37]"
                  : "text-[#888] border-transparent"
              }`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
