// Continue-watching storage shared by VideoPlayer and EpisodeFeed.
// Single source of truth for the localStorage shape so the two writers can
// never drift — the home screen's "Continue Watching" row reads this same key.

export type CWEntry = { seriesId: string; episode: number; progress: number; ts: number };

const CW_KEY = "iam_continue_watching";

export function saveCW(entry: CWEntry) {
  try {
    const raw = localStorage.getItem(CW_KEY);
    const list: CWEntry[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((e) => e.seriesId === entry.seriesId);
    if (idx >= 0) list[idx] = entry;
    else list.push(entry);
    list.sort((a, b) => b.ts - a.ts);
    localStorage.setItem(CW_KEY, JSON.stringify(list.slice(0, 20)));
  } catch {}
}

export function getContinueWatching(): CWEntry[] {
  try {
    const raw = localStorage.getItem(CW_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function findCW(seriesId: string, episode: number): CWEntry | null {
  return getContinueWatching().find((e) => e.seriesId === seriesId && e.episode === episode) ?? null;
}

export function findCWForSeries(seriesId: string): CWEntry | null {
  return getContinueWatching().find((e) => e.seriesId === seriesId) ?? null;
}
