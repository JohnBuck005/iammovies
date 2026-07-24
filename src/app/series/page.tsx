import SeriesCard from "@/components/SeriesCard";
import { seriesData } from "@/data/series";
import Link from "next/link";

export const metadata = {
  title: "All Series - IAmoviestory",
  description: "Browse every short drama series on IAmoviestory.",
};

export default function SeriesListPage() {
  const realSeries = seriesData.filter((s) => s.isReal);
  const otherSeries = seriesData.filter((s) => !s.isReal);

  return (
    <div className="px-4 py-4">
      <h1 className="text-2xl font-bold mb-1">All Series</h1>
      <p className="text-[#888] text-sm mb-6">
        {seriesData.length} series · new episodes weekly
      </p>

      {/* Now Streaming (real) */}
      {realSeries.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-bold">Now Streaming</h2>
            <span className="text-[10px] bg-[#D4AF37] text-black px-2 py-0.5 rounded font-medium">
              LIVE
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {realSeries.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        </section>
      )}

      {/* Coming Soon (demo/fictional) */}
      {otherSeries.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-bold">Coming Soon</h2>
            <span className="text-[10px] bg-[#333] text-[#aaa] px-2 py-0.5 rounded font-medium">
              PREVIEW
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {otherSeries.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        </section>
      )}

      {/* Back to discover */}
      <div className="mt-6">
        <Link
          href="/"
          className="inline-block text-[#D4AF37] text-sm hover:underline"
        >
          ← Back to Discover
        </Link>
      </div>
    </div>
  );
}
