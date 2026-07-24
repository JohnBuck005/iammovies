import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { UserProvider } from "@/components/UserProvider";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "IAmoviestory - Short Drama Streaming",
  description: "Watch captivating short drama series. First two episodes free on every series.",
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
