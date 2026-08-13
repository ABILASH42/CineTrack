import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { LibraryProvider } from "@/lib/context/LibraryContext";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://cinetrack.app"),
  title: {
    default: "CineTrack — Personal Cinema Tracker & Movie Collections",
    template: "%s | CineTrack",
  },
  description: "Track trending movies, curate custom watchlists, log star ratings, write reviews, and explore film collections.",
  keywords: ["movies", "watchlist", "cinema tracker", "movie ratings", "film collections", "TMDB", "trending movies"],
  authors: [{ name: "CineTrack Team" }],
  creator: "CineTrack",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cinetrack.app",
    title: "CineTrack — Personal Cinema Tracker & Movie Watchlists",
    description: "Track trending movies, organize custom collections, rate films, and manage your cinema watch log.",
    siteName: "CineTrack",
  },
  twitter: {
    card: "summary_large_image",
    title: "CineTrack — Cinema Tracker & Watchlists",
    description: "Track trending movies, rate films, and curate custom movie collections.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://cinetrack.app",
  },
  verification: {
    google: "UNhWjOMuWvbtqZ0BgHssRJq0Pe9t0rkX6p2aWF56oeE",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "CineTrack",
  "url": "https://cinetrack.app",
  "description": "Discover trending movies, manage watchlists, rate films, and organize custom collections.",
  "applicationCategory": "EntertainmentApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="google-site-verification" content="UNhWjOMuWvbtqZ0BgHssRJq0Pe9t0rkX6p2aWF56oeE" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100 selection:bg-rose-500 selection:text-white min-h-screen flex flex-col font-sans`}
      >
        <LibraryProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
        </LibraryProvider>
        <Analytics />
      </body>
    </html>
  );
}
