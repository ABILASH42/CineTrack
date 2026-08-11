import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { LibraryProvider } from "@/lib/context/LibraryContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CineTrack — The Crunchyroll for Movies & Custom Watchlists",
  description: "Track movies, organize custom collections, log ratings, watch trailers, and analyze your movie watch history.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100 selection:bg-rose-500 selection:text-white min-h-screen flex flex-col font-sans`}
      >
        <LibraryProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
        </LibraryProvider>
      </body>
    </html>
  );
}
