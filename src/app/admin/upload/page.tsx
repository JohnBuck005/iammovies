"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SeriesOption = {
  id: string;
  title: string;
  episodeCount: number;
};

export default function AdminUploadPage() {
  const router = useRouter();
  const [seriesList, setSeriesList] = useState<SeriesOption[]>([]);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const [seriesId, setSeriesId] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [fetchThumbFromVideo, setFetchThumbFromVideo] = useState(true);

  useEffect(() => {
    fetch("/api/admin/upload")
      .then((r) => r.json())
      .then((data) => {
        setSeriesList(data.series ?? []);
      })
      .catch(() => setError("Failed to load series"))
      .finally(() => setLoadingSeries(false));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seriesId,
          episodeNumber: Number(episodeNumber),
          title,
          duration,
          videoUrl,
          thumbnailUrl: fetchThumbFromVideo ? "" : thumbnailUrl,
          coverUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setResult(`Saved: ${data.episode.title} (Ep ${data.episode.episodeNumber}). Commit: ${data.commitUrl}`);
      setTitle("");
      setDuration("");
      setVideoUrl("");
      setThumbnailUrl("");
      setCoverUrl("");
      setEpisodeNumber("");
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Upload Episode</h1>
          <p className="text-xs text-[#888] mt-1">Adds to series.ts and commits via GitHub.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      {result && (
        <div className="bg-green-500/10 border border-green-500/40 rounded-xl p-4 mb-6">
          <p className="text-sm text-green-400">{result}</p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs text-[#aaa] mb-1">Series</label>
          <select
            value={seriesId}
            onChange={(e) => setSeriesId(e.target.value)}
            className="w-full bg-[#1a1a1a] rounded-lg px-4 py-3 text-sm outline-none border border-[#333] focus:ring-2 focus:ring-[#D4AF37]"
          >
            <option value="">Select series</option>
            {seriesList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.episodeCount} eps)
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#aaa] mb-1">Episode number</label>
            <input
              type="number"
              min="1"
              required
              value={episodeNumber}
              onChange={(e) => setEpisodeNumber(e.target.value)}
              className="w-full bg-[#1a1a1a] rounded-lg px-4 py-3 text-sm outline-none border border-[#333] focus:ring-2 focus:ring-[#D4AF37]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#aaa] mb-1">Duration</label>
            <input
              required
              placeholder="e.g. 5:20"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-[#1a1a1a] rounded-lg px-4 py-3 text-sm outline-none border border-[#333] focus:ring-2 focus:ring-[#D4AF37]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#aaa] mb-1">Episode title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#1a1a1a] rounded-lg px-4 py-3 text-sm outline-none border border-[#333] focus:ring-2 focus:ring-[#D4AF37]"
          />
        </div>

        <div>
          <label className="block text-xs text-[#aaa] mb-1">Video URL</label>
          <input
            required
            placeholder="https://..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full bg-[#1a1a1a] rounded-lg px-4 py-3 text-sm outline-none border border-[#333] focus:ring-2 focus:ring-[#D4AF37]"
          />
          <p className="text-[10px] text-[#666] mt-1">Use Bunny video URL or /api/video?ep=N if you keep local proxying.</p>
        </div>

        <div>
          <label className="block text-xs text-[#aaa] mb-1">Thumbnail URL</label>
          <input
            placeholder="https://... or leave blank for auto naming"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            className="w-full bg-[#1a1a1a] rounded-lg px-4 py-3 text-sm outline-none border border-[#333] focus:ring-2 focus:ring-[#D4AF37]"
          />
          <p className="text-[10px] text-[#666] mt-1">If blank, it defaults to /images/episodes/{`${seriesId || "<series>"}`}-ep{episodeNumber || "<n>"}.jpg</p>
        </div>

        <div>
          <label className="block text-xs text-[#aaa] mb-1">Cover image URL (optional)</label>
          <input
            placeholder="https://..."
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            className="w-full bg-[#1a1a1a] rounded-lg px-4 py-3 text-sm outline-none border border-[#333] focus:ring-2 focus:ring-[#D4AF37]"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#D4AF37] text-black py-3 rounded-lg text-sm font-bold hover:bg-[#B8962E] transition disabled:opacity-60"
        >
          {submitting ? "Uploading…" : "Add Episode"}
        </button>
      </form>

      <div className="mt-8">
        <button onClick={() => router.push("/admin")} className="text-xs text-[#888] hover:text-white">
          ← Back to admin
        </button>
      </div>
    </div>
  );
}
