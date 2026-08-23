"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/components/UserProvider";

const navItems = [
  {
    label: "Discover",
    href: "/",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
  },
  {
    label: "Series",
    href: "/series",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: "Rewards",
    href: "/rewards",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h4a2 2 0 012 2v1h2a2 2 0 012 2v1H4a1 1 0 01-1-1V6a2 2 0 012-2h4V3a1 1 0 011-1zm7 4a2 2 0 11-4 0 2 2 0 014 0zM4 14v2a2 2 0 002 2h8a2 2 0 002-2v-2H4z" clipRule="evenodd" />
      </svg>
    ),
    showDot: true,
  },
  {
    label: "My List",
    href: "/watchlist",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { watchlist } = useUser();
  const myListCount = watchlist.length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-sm border-t border-[#1a1a1a] z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const showBadge = item.label === "My List" && myListCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 ${
                isActive ? "text-[#D4AF37]" : "text-[#888]"
              }`}
            >
              <div className="relative">
                {item.icon}
                {showBadge && (
                  <span className="absolute -top-1 -right-2 bg-[#D4AF37] text-black text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {myListCount}
                  </span>
                )}
                {item.showDot && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] rounded-full w-3 h-3" />
                )}
              </div>
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
