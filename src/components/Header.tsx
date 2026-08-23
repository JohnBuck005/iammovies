"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { seriesData } from "@/data/series";

const TABS = [
  { key: "discover", label: "Discover", icon: null },
  { key: "new", label: "New", icon: "✨" },
  { key: "premium", label: "Premium", icon: "💎" },
  { key: "trending", label: "Trending", icon: "🔥" },
];

export default function Header() {
  const pathname = usePathname();
  const activeTab = pathname === "/" ? "discover" : "discover";

  const selectTab = (key: string) => {
    window.location.href = `/?tab=${key}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#1a1a1a]">
      <div className="px-4 py-3">
        {/* Logo + icons */}
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
        <form onSubmit={(e) => { e.preventDefault(); }} className="relative">
          <input
            type="text"
            placeholder="Search series..."
            className="w-full bg-[#1a1a1a] text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] placeholder-[#666]"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </button>
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
