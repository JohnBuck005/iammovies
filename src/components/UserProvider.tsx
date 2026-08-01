"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getBrowserSupabase } from "@/lib/supabaseClient";

interface AuthUser {
  id: string;
  email: string | null;
}

interface UserState {
  user: AuthUser | null;
  isAuthed: boolean;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [points, setPoints] = useState(0);
  const [watched, setWatched] = useState<Record<string, number>>({});
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load guest (localStorage) defaults first so the UI isn't empty pre-auth.
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
  }, []);

  // Auth session + server-synced watchlist/progress for logged-in users.
  const loadSession = async () => {
    const supabase = getBrowserSupabase();
    try {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!u) {
        setUser(null);
        setIsAuthed(false);
        setLoaded(true);
        return;
      }
      setUser({ id: u.id, email: u.email ?? null });
      setIsAuthed(true);

      const [{ data: wl }, { data: prog }] = await Promise.all([
        supabase.from("watchlists").select("series_id").eq("user_id", u.id),
        supabase
          .from("watch_progress")
          .select("series_id,episode,progress")
          .eq("user_id", u.id),
      ]);

      setWatchlist((wl ?? []).map((r: { series_id: string }) => r.series_id));
      const w: Record<string, number> = {};
      (prog ?? []).forEach(
        (r: { series_id: string; episode: number; progress: number }) => {
          w[`${r.series_id}:${r.episode}`] = r.progress;
        }
      );
      setWatched(w);
    } catch {
      // Tables may not exist yet / network issue — fall back to local.
    }
    setLoaded(true);
  };

  useEffect(() => {
    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadSession();
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist guest data locally (only when not authed).
  useEffect(() => {
    if (!loaded || isAuthed) return;
    const data = { watchlist, points, watched, lastCheckIn };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore quota errors
    }
  }, [watchlist, points, watched, lastCheckIn, loaded, isAuthed]);

  const toggleWatchlist = (id: string) => {
    const isIn = watchlist.includes(id);
    setWatchlist((prev) =>
      isIn ? prev.filter((x) => x !== id) : [...prev, id]
    );
    if (isAuthed && user) {
      const supabase = getBrowserSupabase();
      if (isIn) {
        supabase
          .from("watchlists")
          .delete()
          .eq("user_id", user.id)
          .eq("series_id", id);
      } else {
        supabase
          .from("watchlists")
          .insert({ user_id: user.id, series_id: id });
      }
    }
  };

  const inWatchlist = (id: string) => watchlist.includes(id);

  const addPoints = (n: number) => setPoints((p) => p + n);

  const spendPoints = (n: number) => {
    if (points < n) return false;
    setPoints((p) => p - n);
    return true;
  };

  const recordWatched = (
    seriesId: string,
    episode: number,
    pct: number
  ) => {
    const key = `${seriesId}:${episode}`;
    setWatched((prev) => ({ ...prev, [key]: Math.max(prev[key] ?? 0, pct) }));
    if (isAuthed && user) {
      const supabase = getBrowserSupabase();
      supabase.from("watch_progress").upsert(
        { user_id: user.id, series_id: seriesId, episode, progress: pct },
        { onConflict: "user_id,series_id,episode" }
      );
    }
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
        user,
        isAuthed,
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
      user: null,
      isAuthed: false,
      watchlist: [] as string[],
      points: 0,
      watched: {} as Record<string, number>,
      lastCheckIn: null,
      toggleWatchlist: () => {},
      inWatchlist: () => false,
      addPoints: () => {},
      spendPoints: () => false,
      recordWatched: () => {},
      watchedCount: 0,
      checkIn: () => ({ ok: false, gained: 0 }),
    };
  }
  return ctx;
}
