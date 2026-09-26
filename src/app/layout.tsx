import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { UserProvider } from "@/components/UserProvider";
import { Suspense } from "react";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

// `NEXT_PUBLIC_BASE_URL` is http://localhost:3000 in .env.local. If that value ever
// reached production, every shared link would advertise itself as a localhost URL
// and render no image, so only trust it when it is a real https host.
function resolveMetadataBase(): URL {
  const raw = process.env.NEXT_PUBLIC_BASE_URL;
  if (raw && raw.startsWith("https://") && !raw.includes("localhost")) {
    return new URL(raw);
  }
  return new URL("https://iamoviestory.com");
}

export const metadata: Metadata = {
  // Required for the relative openGraph.url / images in child routes to resolve to
  // absolute URLs. Crawlers (Facebook, WhatsApp, Instagram) reject relative ones,
  // so without this every shared link renders with no image.
  metadataBase: resolveMetadataBase(),
  title: "IAmoviestory - Short Drama Streaming",
  description: "Watch captivating short drama series. Free episodes on every series.",
  openGraph: {
    title: "IAmoviestory - Short Drama Streaming",
    description: "Watch captivating short drama series. Free episodes on every series.",
    type: "website",
    url: "/",
    images: [
      {
        url: "/images/iamoviestory-logo.jpg",
        width: 1200,
        height: 630,
        alt: "IAmoviestory - Short Drama Streaming",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IAmoviestory - Short Drama Streaming",
    description: "Watch captivating short drama series. Free episodes on every series.",
    images: ["/images/iamoviestory-logo.jpg"],
  },
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a] text-white">
        <ServiceWorkerRegistration />
        <UserProvider>
          <Suspense fallback={<div className="h-[140px] bg-[#0a0a0a]" />}>
            <Header />
          </Suspense>
          <main className="pb-20">{children}</main>
          <BottomNav />
        </UserProvider>
      </body>
    </html>
  );
}
