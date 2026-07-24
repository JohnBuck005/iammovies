"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface UserState {
  watchlist: string[]; // series ids
  points: number;
  watched: Record<string, number>; // "seriesId:episode" -> last position (0-100)
  lastCheckIn: string | null; // date string YYYY-MM-DD
  toggleWatchlist: (id: string) => void;
  inWatchlist: (id: string) => boolean;
  addPoints: (n: number) => void;
  spendPoints: (n: number) => boolean;
  recordWatched: (seriesId: string, episode: number, pct: number) => void;
  watchedCount: number;
  checkIn: () => { ok: boolean; gained: number };
}

const STORAGE_KEY = "iamoviestory_user_v1";

const UserContext = createContext<UserState | null>(null);

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [points, setPoints] = useState(0);
  const [watched, setWatched] = useState<Record<string, number>>({});
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setWatchlist(data.watchlist ?? []);
        setPoints(data.points ?? 0);
        setWatched(data.watched ?? {});
        setLastCheckIn(data.lastCheckIn ?? null);
      }
    } catch {
      // ignore corrupt storage
    }
    setLoaded(true);
  }, []);

  // Persist on change (only after initial load)
  useEffect(() => {
    if (!loaded) return;
    const data = { watchlist, points, watched, lastCheckIn };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore quota errors
    }
  }, [watchlist, points, watched, lastCheckIn, loaded]);

  const toggleWatchlist = (id: string) => {
    setWatchlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const inWatchlist = (id: string) => watchlist.includes(id);

  const addPoints = (n: number) => setPoints((p) => p + n);

  const spendPoints = (n: number) => {
    if (points < n) return false;
    setPoints((p) => p - n);
    return true;
  };

  const recordWatched = (seriesId: string, episode: number, pct: number) => {
    const key = `${seriesId}:${episode}`;
    setWatched((prev) => {
      const cur = prev[key] ?? 0;
      return { ...prev, [key]: Math.max(cur, pct) };
    });
  };

  const checkIn = () => {
    const t = today();
    if (lastCheckIn === t) return { ok: false, gained: 0 };
    setLastCheckIn(t);
    setPoints((p) => p + 5);
    return { ok: true, gained: 5 };
  };

  const watchedCount = Object.keys(watched).filter(
    (k) => (watched[k] ?? 0) > 0
  ).length;

  return (
    <UserContext.Provider
      value={{
        watchlist,
        points,
        watched,
        lastCheckIn,
        toggleWatchlist,
        inWatchlist,
        addPoints,
        spendPoints,
        recordWatched,
        watchedCount,
        checkIn,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    // Safe fallback during SSR / before provider mounts
    return {
      watchlist: [] as string[],
      points: 0,
      watched: {} as Record<string, number>,
      lastCheckIn: null,
      toggleWatchlist: (_id: string) => {},
      inWatchlist: (_id: string) => false,
      addPoints: (_n: number) => {},
      spendPoints: (_n: number) => false,
      recordWatched: (_s: string, _e: number, _p: number) => {},
      watchedCount: 0,
      checkIn: () => ({ ok: false, gained: 0 }),
    };
  }
  return ctx;
}
