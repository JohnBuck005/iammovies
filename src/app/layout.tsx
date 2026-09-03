import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { UserProvider } from "@/components/UserProvider";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "IAmoviestory - Short Drama Streaming",
  description: "Watch captivating short drama series. First two episodes free on every series.",
  openGraph: {
    title: "IAmoviestory - Short Drama Streaming",
    description: "Watch captivating short drama series. First two episodes free on every series.",
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
    description: "Watch captivating short drama series. First two episodes free on every series.",
    images: ["/images/iamoviestory-logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a] text-white">
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
