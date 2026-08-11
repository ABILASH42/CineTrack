'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Compass, BookmarkCheck, Library, Search, User, Sparkles } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Discover', href: '/', icon: Compass },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'My Watchlist', href: '/library', icon: BookmarkCheck },
    { name: 'Collections', href: '/collections', icon: Library },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-black/60 border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-600 to-indigo-600 p-[2px] shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Film className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              Cine<span className="text-rose-500">Track</span>
            </span>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-rose-400/80 -mt-1 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Crunchyroll for Movies
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1.5 backdrop-blur-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md shadow-rose-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Quick Search & User Profile Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="md:hidden p-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </Link>

          <Link
            href="/library"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 text-slate-200 text-sm font-semibold hover:border-rose-500/50 hover:text-white transition-all shadow-sm group"
          >
            <div className="w-7 h-7 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
              <User className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline">My Profile</span>
          </Link>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 px-4 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 text-xs font-medium transition-colors ${
                isActive ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
