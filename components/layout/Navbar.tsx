'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Compass, BookmarkCheck, Library, Search, User, LogOut, Sparkles } from 'lucide-react';
import { useLibrary } from '@/lib/context/LibraryContext';

export function Navbar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useLibrary();

  const navItems = [
    { name: 'Discover', href: '/', icon: Compass },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'My Watchlist', href: '/library', icon: BookmarkCheck },
    { name: 'Collections', href: '/collections', icon: Library },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-black/70 border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-600 to-indigo-600 p-[2px] shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
              <Film className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              Cine<span className="text-rose-500">Track</span>
            </span>
            <span className="hidden xs:flex text-[9px] sm:text-[10px] tracking-widest uppercase font-semibold text-rose-400/80 -mt-0.5 sm:-mt-1 items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Crunchyroll for Movies
            </span>
          </div>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1.5 backdrop-blur-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-4 lg:px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
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

        {/* User Auth Profile Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/library"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 text-slate-200 text-xs font-semibold hover:border-rose-500/50 active:scale-95 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold text-xs">
                  {profile?.username ? profile.username[0].toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline font-bold text-slate-100 max-w-[100px] truncate">
                  {profile?.username || user.email?.split('@')[0]}
                </span>
              </Link>

              <button
                onClick={() => signOut()}
                className="p-2 rounded-full text-slate-400 hover:text-rose-400 hover:bg-white/10 active:scale-95 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-600/30 active:scale-95 transition-transform"
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-xl text-[10px] sm:text-xs font-medium transition-all ${
                isActive
                  ? 'text-rose-400 font-bold bg-rose-500/10'
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-rose-500' : 'text-slate-400'}`} />
              <span className="truncate max-w-[70px]">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
