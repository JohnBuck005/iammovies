import { Suspense } from "react";
import HomeClient from "./home-client";

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <HomeClient />
    </Suspense>
  );
}
