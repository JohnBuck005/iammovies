"use client";

export default function WatchPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
      <p className="text-red-400 text-sm mb-4">
        Something went wrong loading this episode.
      </p>
      <button
        onClick={reset}
        className="bg-[#D4AF37] text-black px-6 py-2 rounded-lg text-sm font-bold"
      >
        Try Again
      </button>
    </div>
  );
}