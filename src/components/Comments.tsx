"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabaseClient";

type Comment = {
  id: string;
  display_name: string;
  body: string;
  created_at: string;
  status: string;
};

export default function Comments({
  seriesId,
  episode,
}: {
  seriesId: string;
  episode: number;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const supabase = getBrowserSupabase();
      const { data, error } = await supabase
        .from("comments")
        .select("id, display_name, body, created_at, status")
        .eq("series_id", seriesId)
        .eq("episode", episode)
        .eq("status", "approved")
        .order("created_at", { ascending: true });
      if (error) throw error;
      setComments(data as Comment[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesId, episode]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const display = name.trim() || "Anonymous";
    const text = body.trim();
    if (!text) {
      setError("Comment cannot be empty");
      return;
    }
    setPosting(true);
    try {
      const supabase = getBrowserSupabase();
      const { error } = await supabase
        .from("comments")
        .insert({
          series_id: seriesId,
          episode,
          display_name: display.slice(0, 40),
          body: text.slice(0, 1000),
          status: "approved", // open mode: auto-approve. Flip to "pending" + moderation later.
        });
      if (error) throw error;
      setBody("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="px-4 py-4">
      <h2 className="text-lg font-bold mb-3">Comments</h2>

      <form onSubmit={submit} className="mb-4 space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          maxLength={40}
          className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#D4AF37]"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts on this episode…"
          maxLength={1000}
          rows={3}
          className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#D4AF37] resize-none"
        />
        <button
          type="submit"
          disabled={posting}
          className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#B8962E] transition disabled:opacity-60"
        >
          {posting ? "Posting…" : "Post Comment"}
        </button>
      </form>

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      {loading ? (
        <p className="text-[#666] text-sm">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-[#666] text-sm">No comments yet. Be the first!</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="bg-[#1a1a1a] rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-[#D4AF37]">
                  {c.display_name}
                </span>
                <span className="text-[#666] text-[10px]">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-[#ddd] whitespace-pre-wrap break-words">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
