import { Suspense } from "react";
import HomeClient from "./home-client";

export default function Home() {
  return (
    <Suspense fallback={<div className="px-4 py-4 text-[#888]">Loading…</div>}>
      <HomeClient />
    </Suspense>
  );
}
